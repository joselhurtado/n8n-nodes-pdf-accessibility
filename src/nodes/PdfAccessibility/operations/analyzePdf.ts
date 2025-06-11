import { IExecuteFunctions } from 'n8n-workflow';
import { AiUtils } from '../utils/aiUtils';
import { AccessibilityAnalysis, PdfValidationResult } from '../interfaces';
import { LLMProviderType } from '../providers';

export async function analyzePdf(
	this: IExecuteFunctions,
	itemIndex: number,
	validation: PdfValidationResult,
): Promise<AccessibilityAnalysis> {
	// Get LLM provider configuration
	const llmProvider = this.getNodeParameter('llmProvider', itemIndex, 'anthropic') as LLMProviderType;
	const model = this.getNodeParameter('model', itemIndex) as string;
	const wcagLevel = this.getNodeParameter('wcagLevel', itemIndex, 'AA') as 'A' | 'AA' | 'AAA';
	
	// Map provider to credential type
	const credentialTypeMap = {
		anthropic: 'anthropicApi',
		openai: 'openAIApi',
		google: 'googleApi',
		custom: 'customApi',
	};
	
	const credentialType = credentialTypeMap[llmProvider];
	if (!credentialType) {
		throw new Error(`Unsupported LLM provider: ${llmProvider}`);
	}

	// Analyze accessibility using AI
	const analysis = await AiUtils.analyzeAccessibility(
		this,
		validation.extractedText,
		{
			fileName: validation.fileName,
			pageCount: validation.pageCount,
			wordCount: validation.wordCount,
		},
		llmProvider,
		credentialType,
		{
			wcagLevel,
			model,
			language: 'en-US', // TODO: Make this configurable
			analysisDepth: 'standard', // TODO: Make this configurable
		},
	);

	return analysis;
}