import { IExecuteFunctions } from 'n8n-workflow';
import { AiUtils } from '../utils/aiUtils';
import { PdfUtils } from '../utils/pdfUtils';
import { getPdfInput } from '../utils/inputUtils';
import { AccessibilityAnalysis, PdfValidationResult } from '../interfaces';
import { LLMProviderType } from '../providers';

export async function analyzePdf(
	this: IExecuteFunctions,
	itemIndex: number,
	validation?: PdfValidationResult,
): Promise<AccessibilityAnalysis> {
	// Get validation data or validate PDF if not provided
	let validationData: PdfValidationResult;
	if (validation) {
		// Use provided validation data (from full workflow)
		validationData = validation;
	} else {
		// Get PDF input and validate it
		const pdfInput = await getPdfInput(this, itemIndex);
		
		// Get validation parameters
		const maxFileSize = this.getNodeParameter('maxFileSize', itemIndex, 20) as number * 1024 * 1024;
		const maxPages = this.getNodeParameter('maxPages', itemIndex, 10) as number;
		const allowScanned = this.getNodeParameter('allowScanned', itemIndex, false) as boolean;
		const allowForms = this.getNodeParameter('allowForms', itemIndex, false) as boolean;
		const minTextLength = this.getNodeParameter('minTextLength', itemIndex, 100) as number;
		
		// Validate PDF
		validationData = await PdfUtils.validatePdf(
			pdfInput.buffer,
			pdfInput.fileName,
			{
				maxFileSize,
				maxPages,
				allowScanned,
				allowForms,
				minTextLength,
			},
		);
		
		if (!validationData.valid) {
			throw new Error(`PDF validation failed: ${validationData.error || 'Unknown validation error'}`);
		}
	}

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
		validationData.extractedText,
		{
			fileName: validationData.fileName,
			pageCount: validationData.pageCount,
			wordCount: validationData.wordCount,
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