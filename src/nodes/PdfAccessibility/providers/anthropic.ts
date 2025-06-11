import axios from 'axios';
import { BaseLLMProvider, IAnalysisOptions } from './base';
import { AccessibilityAnalysis } from '../interfaces';

export class AnthropicProvider extends BaseLLMProvider {
	private static readonly BASE_URL = 'https://api.anthropic.com/v1';
	private static readonly VERSION = '2023-06-01';
	private static readonly MAX_TOKENS = 4000;

	getName(): string {
		return 'Anthropic';
	}

	getModels(): string[] {
		return [
			'claude-3-5-sonnet-20241022',
			'claude-3-5-haiku-20241022',
			'claude-3-opus-20240229',
			'claude-3-sonnet-20240229',
			'claude-3-haiku-20240307',
		];
	}

	async validateCredentials(): Promise<boolean> {
		try {
			if (!this.isValidApiKey(this.credentials.apiKey)) {
				return false;
			}

			const response = await axios.post(
				`${AnthropicProvider.BASE_URL}/messages`,
				{
					model: 'claude-3-haiku-20240307',
					max_tokens: 10,
					messages: [{ role: 'user', content: 'Hello' }],
				},
				{
					headers: {
						'x-api-key': this.credentials.apiKey,
						'anthropic-version': AnthropicProvider.VERSION,
						'Content-Type': 'application/json',
					},
					timeout: 10000,
				},
			);

			return response.status === 200;
		} catch (error) {
			return false;
		}
	}

	async analyzeAccessibility(
		text: string,
		documentInfo: {
			fileName: string;
			pageCount: number;
			wordCount: number;
		},
		options: IAnalysisOptions,
	): Promise<AccessibilityAnalysis> {
		const model = options.model || this.credentials.model || 'claude-3-5-sonnet-20241022';
		const prompt = this.buildAnalysisPrompt(
			text,
			documentInfo,
			options.wcagLevel,
			options.language || 'en-US',
		);

		try {
			const response = await axios.post(
				`${AnthropicProvider.BASE_URL}/messages`,
				{
					model,
					max_tokens: AnthropicProvider.MAX_TOKENS,
					messages: [
						{
							role: 'user',
							content: prompt,
						},
					],
				},
				{
					headers: {
						'x-api-key': this.credentials.apiKey,
						'anthropic-version': AnthropicProvider.VERSION,
						'Content-Type': 'application/json',
					},
					timeout: 60000,
				},
			);

			const analysisText = response.data.content[0]?.text;
			if (!analysisText) {
				throw new Error('No analysis content received from Anthropic');
			}

			return this.parseAnalysisResponse(analysisText, documentInfo.fileName);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = error.response?.data?.error?.message || error.message;
				throw new Error(`Anthropic API Error (${status}): ${message}`);
			}
			throw new Error(`Anthropic analysis failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private isValidApiKey(apiKey: string): boolean {
		return /^sk-ant-api/.test(apiKey) && apiKey.length > 20;
	}
}