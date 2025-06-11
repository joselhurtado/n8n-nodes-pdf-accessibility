import { IExecuteFunctions } from 'n8n-workflow';
import { AccessibilityAnalysis } from '../interfaces';
import { LLMProviderFactory, LLMProviderType, IAnalysisOptions } from '../providers';

export class AiUtils {
	/**
	 * Analyzes PDF content for accessibility issues using the specified LLM provider
	 */
	static async analyzeAccessibility(
		context: IExecuteFunctions,
		extractedText: string,
		documentInfo: {
			fileName: string;
			pageCount: number;
			wordCount: number;
		},
		providerType: LLMProviderType,
		credentialType: string,
		options: IAnalysisOptions,
	): Promise<AccessibilityAnalysis> {
		try {
			const credentials = await context.getCredentials(credentialType);
			if (!credentials) {
				throw new Error(`No credentials found for ${credentialType}`);
			}

			const provider = LLMProviderFactory.createProvider(providerType, {
				apiKey: credentials.apiKey as string,
				baseUrl: credentials.baseUrl as string,
				model: credentials.defaultModel as string,
				...credentials,
			});

			return await provider.analyzeAccessibility(extractedText, documentInfo, options);
		} catch (error) {
			throw new Error(`AI Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Validates LLM provider credentials
	 */
	static async validateCredentials(
		context: IExecuteFunctions,
		providerType: LLMProviderType,
		credentialType: string,
	): Promise<boolean> {
		try {
			const credentials = await context.getCredentials(credentialType);
			if (!credentials) {
				return false;
			}

			const provider = LLMProviderFactory.createProvider(providerType, {
				apiKey: credentials.apiKey as string,
				baseUrl: credentials.baseUrl as string,
				model: credentials.defaultModel as string,
				...credentials,
			});

			return await provider.validateCredentials();
		} catch (error) {
			return false;
		}
	}

	/**
	 * Gets available models for a provider type
	 */
	static getProviderModels(providerType: LLMProviderType): string[] {
		return LLMProviderFactory.getProviderModels(providerType);
	}

	/**
	 * Gets supported providers
	 */
	static getSupportedProviders(): LLMProviderType[] {
		return LLMProviderFactory.getSupportedProviders();
	}


	/**
	 * Estimates token count for cost calculation
	 */
	static estimateTokens(text: string): number {
		// Rough estimation: ~4 characters per token
		return Math.ceil(text.length / 4);
	}
}