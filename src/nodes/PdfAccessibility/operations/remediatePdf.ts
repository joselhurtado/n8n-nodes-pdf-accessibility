import { IExecuteFunctions } from 'n8n-workflow';
import { PdfUtils } from '../utils/pdfUtils';
import { AiUtils } from '../utils/aiUtils';
import { getPdfInput } from '../utils/inputUtils';
import { AccessibilityAnalysis, RemediationResult } from '../interfaces';
import { LLMProviderType } from '../providers';

export async function remediatePdf(
	this: IExecuteFunctions,
	itemIndex: number,
	analysis?: AccessibilityAnalysis,
	originalFileName?: string,
): Promise<{ result: RemediationResult; remediatedBuffer: Buffer }> {
	// Get analysis data or perform analysis if not provided
	let analysisData: AccessibilityAnalysis;
	let pdfBuffer: Buffer;
	let fileName: string;
	
	if (analysis && originalFileName) {
		// Use provided analysis data (from full workflow)
		analysisData = analysis;
		pdfBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, 'data');
		fileName = originalFileName;
	} else {
		// Get PDF input and perform analysis
		const pdfInput = await getPdfInput(this, itemIndex);
		pdfBuffer = pdfInput.buffer;
		fileName = pdfInput.fileName;
		
		// Validate PDF first
		const maxFileSize = this.getNodeParameter('maxFileSize', itemIndex, 20) as number * 1024 * 1024;
		const maxPages = this.getNodeParameter('maxPages', itemIndex, 10) as number;
		const allowScanned = this.getNodeParameter('allowScanned', itemIndex, false) as boolean;
		const allowForms = this.getNodeParameter('allowForms', itemIndex, false) as boolean;
		const minTextLength = this.getNodeParameter('minTextLength', itemIndex, 100) as number;
		
		const validation = await PdfUtils.validatePdf(
			pdfBuffer,
			fileName,
			{
				maxFileSize,
				maxPages,
				allowScanned,
				allowForms,
				minTextLength,
			},
		);
		
		if (!validation.valid) {
			throw new Error(`PDF validation failed: ${validation.error || 'Unknown validation error'}`);
		}
		
		// Perform analysis
		const llmProvider = this.getNodeParameter('llmProvider', itemIndex, 'anthropic') as LLMProviderType;
		const model = this.getNodeParameter('model', itemIndex) as string;
		const wcagLevel = this.getNodeParameter('wcagLevel', itemIndex, 'AA') as 'A' | 'AA' | 'AAA';
		
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
		
		analysisData = await AiUtils.analyzeAccessibility(
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
				language: 'en-US',
				analysisDepth: 'standard',
			},
		);
	}

	// Get remediation options
	const autoTitle = this.getNodeParameter('autoTitle', itemIndex, true) as boolean;
	const setLanguage = this.getNodeParameter('setLanguage', itemIndex, 'en-US') as string;
	const addMetadata = this.getNodeParameter('addMetadata', itemIndex, true) as boolean;
	const outputFilename = this.getNodeParameter('outputFilename', itemIndex, 'ACCESSIBLE_{original}') as string;

	// Use the PDF buffer and file size
	const originalFileSize = pdfBuffer.length;

	try {
		// Prepare improvements
		const improvements: {
			title?: string;
			language?: string;
			metadata?: Record<string, string>;
		} = {};

		if (autoTitle && analysisData.suggestedTitle) {
			improvements.title = analysisData.suggestedTitle;
		}

		if (setLanguage) {
			improvements.language = setLanguage;
		}

		if (addMetadata) {
			improvements.metadata = {
				'accessibility-service': 'N8N PDF Accessibility Service',
				'wcag-level': 'AA',
				'compliance-score': analysisData.complianceScore.toString(),
			};
		}

		// Apply remediation
		const remediatedBuffer = await PdfUtils.remediatePdf(pdfBuffer, improvements);

		// Generate output filename
		const remediatedFileName = outputFilename.replace(
			'{original}',
			fileName.replace(/\.[^/.]+$/, '') // Remove extension
		) + '.pdf';

		// Create result
		const result: RemediationResult = {
			success: true,
			originalFileName: fileName,
			remediatedFileName,
			originalFileSize,
			remediatedFileSize: remediatedBuffer.length,
			improvementsApplied: [
				...(improvements.title ? [`Set document title: "${improvements.title}"`] : []),
				...(improvements.language ? [`Set language: ${improvements.language}`] : []),
				...(improvements.metadata ? ['Added accessibility metadata'] : []),
				'Applied WCAG compliance improvements',
			],
			processingTimestamp: new Date().toISOString(),
		};

		return { result, remediatedBuffer };

	} catch (error) {
		const result: RemediationResult = {
			success: false,
			originalFileName: fileName,
			remediatedFileName: outputFilename,
			originalFileSize,
			remediatedFileSize: 0,
			improvementsApplied: [],
			processingTimestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : String(error),
		};

		throw new Error(`PDF remediation failed: ${result.error}`);
	}
}