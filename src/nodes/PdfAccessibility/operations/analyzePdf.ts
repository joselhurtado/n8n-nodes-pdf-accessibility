import { IExecuteFunctions } from 'n8n-workflow';
import { AiUtils } from '../utils/aiUtils';
import { AccessibilityAnalysis, PdfValidationResult } from '../interfaces';

export async function analyzePdf(
	this: IExecuteFunctions,
	itemIndex: number,
	validation: PdfValidationResult,
): Promise<AccessibilityAnalysis> {
	// Get AI configuration
	const model = this.getNodeParameter('model', itemIndex, 'claude-3-5-sonnet-20241022') as string;
	const credentials = await this.getCredentials('anthropicApi', itemIndex);
	
	if (!credentials?.apiKey) {
		throw new Error('Anthropic API credentials are required for accessibility analysis');
	}

	// Analyze accessibility using AI
	const analysis = await AiUtils.analyzeAccessibility(
		validation.extractedText,
		{
			fileName: validation.fileName,
			pageCount: validation.pageCount,
			wordCount: validation.wordCount,
		},
		credentials.apiKey as string,
		model,
	);

	return analysis;
}