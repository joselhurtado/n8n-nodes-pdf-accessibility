import axios from 'axios';
import { BaseLLMProvider, IAnalysisOptions } from './base';
import { AccessibilityAnalysis } from '../interfaces';

export class GoogleProvider extends BaseLLMProvider {
	private static readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

	getName(): string {
		return 'Google';
	}

	getModels(): string[] {
		return [
			'gemini-1.5-pro-latest',
			'gemini-1.5-flash-latest',
			'gemini-pro',
			'gemini-pro-vision',
		];
	}

	async validateCredentials(): Promise<boolean> {
		try {
			if (!this.credentials.apiKey) {
				return false;
			}

			const model = 'gemini-pro';
			const response = await axios.post(
				`${GoogleProvider.BASE_URL}/models/${model}:generateContent?key=${this.credentials.apiKey}`,
				{
					contents: [{
						parts: [{ text: 'Hello' }]
					}],
					generationConfig: {
						maxOutputTokens: 10,
					}
				},
				{
					headers: {
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
		const model = options.model || this.credentials.model || 'gemini-1.5-pro-latest';
		const prompt = this.buildAnalysisPrompt(
			text,
			documentInfo,
			options.wcagLevel,
			options.language || 'en-US',
		);

		try {
			const response = await axios.post(
				`${GoogleProvider.BASE_URL}/models/${model}:generateContent?key=${this.credentials.apiKey}`,
				{
					contents: [{
						parts: [{ text: prompt }]
					}],
					generationConfig: {
						maxOutputTokens: 4000,
						temperature: 0.1,
					},
					safetySettings: [
						{
							category: 'HARM_CATEGORY_HARASSMENT',
							threshold: 'BLOCK_NONE'
						},
						{
							category: 'HARM_CATEGORY_HATE_SPEECH',
							threshold: 'BLOCK_NONE'
						},
						{
							category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
							threshold: 'BLOCK_NONE'
						},
						{
							category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
							threshold: 'BLOCK_NONE'
						}
					]
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
					timeout: 60000,
				},
			);

			const analysisText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!analysisText) {
				throw new Error('No analysis content received from Google');
			}

			return this.parseAnalysisResponse(analysisText, documentInfo.fileName);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = error.response?.data?.error?.message || error.message;
				throw new Error(`Google API Error (${status}): ${message}`);
			}
			throw new Error(`Google analysis failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}