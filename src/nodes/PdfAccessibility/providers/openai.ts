import axios from 'axios';
import { BaseLLMProvider, IAnalysisOptions } from './base';
import { AccessibilityAnalysis } from '../interfaces';

export class OpenAIProvider extends BaseLLMProvider {
	private static readonly BASE_URL = 'https://api.openai.com/v1';

	getName(): string {
		return 'OpenAI';
	}

	getModels(): string[] {
		return [
			'gpt-4-turbo-preview',
			'gpt-4-0125-preview',
			'gpt-4-1106-preview',
			'gpt-4',
			'gpt-3.5-turbo',
			'gpt-3.5-turbo-16k',
		];
	}

	async validateCredentials(): Promise<boolean> {
		try {
			if (!this.credentials.apiKey || !this.credentials.apiKey.startsWith('sk-')) {
				return false;
			}

			const response = await axios.get(
				`${OpenAIProvider.BASE_URL}/models`,
				{
					headers: {
						'Authorization': `Bearer ${this.credentials.apiKey}`,
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
		const model = options.model || this.credentials.model || 'gpt-4-turbo-preview';
		const prompt = this.buildAnalysisPrompt(
			text,
			documentInfo,
			options.wcagLevel,
			options.language || 'en-US',
		);

		try {
			const response = await axios.post(
				`${OpenAIProvider.BASE_URL}/chat/completions`,
				{
					model,
					messages: [
						{
							role: 'system',
							content: 'You are a PDF accessibility expert specializing in WCAG compliance analysis. Always respond with valid JSON only.',
						},
						{
							role: 'user',
							content: prompt,
						},
					],
					max_tokens: 4000,
					temperature: 0.1,
				},
				{
					headers: {
						'Authorization': `Bearer ${this.credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					timeout: 60000,
				},
			);

			const analysisText = response.data.choices[0]?.message?.content;
			if (!analysisText) {
				throw new Error('No analysis content received from OpenAI');
			}

			return this.parseAnalysisResponse(analysisText, documentInfo.fileName);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = error.response?.data?.error?.message || error.message;
				throw new Error(`OpenAI API Error (${status}): ${message}`);
			}
			throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}