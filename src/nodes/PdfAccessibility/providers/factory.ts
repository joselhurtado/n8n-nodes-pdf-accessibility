import { ILLMProvider, IProviderCredentials } from './base';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import { GoogleProvider } from './google';

export type LLMProviderType = 'anthropic' | 'openai' | 'google' | 'custom';

export class LLMProviderFactory {
	static createProvider(
		providerType: LLMProviderType,
		credentials: IProviderCredentials,
	): ILLMProvider {
		switch (providerType) {
			case 'anthropic':
				return new AnthropicProvider(credentials);
			case 'openai':
				return new OpenAIProvider(credentials);
			case 'google':
				return new GoogleProvider(credentials);
			case 'custom':
				throw new Error('Custom provider not yet implemented');
			default:
				throw new Error(`Unsupported LLM provider: ${providerType}`);
		}
	}

	static getSupportedProviders(): LLMProviderType[] {
		return ['anthropic', 'openai', 'google'];
	}

	static getProviderModels(providerType: LLMProviderType): string[] {
		const tempCredentials = { apiKey: 'temp' };
		const provider = this.createProvider(providerType, tempCredentials);
		return provider.getModels();
	}
}