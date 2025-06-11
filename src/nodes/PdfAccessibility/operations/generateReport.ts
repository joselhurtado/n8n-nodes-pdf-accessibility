import { IExecuteFunctions } from 'n8n-workflow';
import { ReportFormatter } from '../helpers/reportFormatter';
import { PdfUtils } from '../utils/pdfUtils';
import { AiUtils } from '../utils/aiUtils';
import { getPdfInput } from '../utils/inputUtils';
import { AccessibilityReport, AccessibilityAnalysis, PdfValidationResult, RemediationResult } from '../interfaces';
import { LLMProviderType } from '../providers';

export async function generateReport(
	this: IExecuteFunctions,
	itemIndex: number,
	validation?: PdfValidationResult,
	analysis?: AccessibilityAnalysis,
	remediation?: RemediationResult,
): Promise<AccessibilityReport> {
	// Get validation and analysis data or perform them if not provided
	let validationData: PdfValidationResult;
	let analysisData: AccessibilityAnalysis;
	
	if (validation && analysis) {
		// Use provided data (from full workflow)
		validationData = validation;
		analysisData = analysis;
	} else {
		// Get PDF input and perform validation/analysis
		const pdfInput = await getPdfInput(this, itemIndex);
		
		// Validate PDF first
		const maxFileSize = this.getNodeParameter('maxFileSize', itemIndex, 20) as number * 1024 * 1024;
		const maxPages = this.getNodeParameter('maxPages', itemIndex, 10) as number;
		const allowScanned = this.getNodeParameter('allowScanned', itemIndex, false) as boolean;
		const allowForms = this.getNodeParameter('allowForms', itemIndex, false) as boolean;
		const minTextLength = this.getNodeParameter('minTextLength', itemIndex, 100) as number;
		
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
				language: 'en-US',
				analysisDepth: 'standard',
			},
		);
	}

	// Get report options
	const reportFormat = this.getNodeParameter('reportFormat', itemIndex, 'both') as string;
	const includeValidation = this.getNodeParameter('includeValidation', itemIndex, true) as boolean;
	const includeRecommendations = this.getNodeParameter('includeRecommendations', itemIndex, true) as boolean;

	// Build document info
	const documentInfo = {
		originalFileName: validationData.fileName,
		processingDate: new Date().toISOString(),
		originalSize: validationData.fileSize,
		remediatedSize: remediation?.remediatedFileSize,
		pageCount: validationData.pageCount,
	};

	// Create report data
	const reportData: AccessibilityReport = {
		documentInfo,
		analysis: includeRecommendations ? analysisData : {
			...analysisData,
			recommendations: [], // Exclude recommendations if not wanted
		},
		validation: includeValidation ? validationData : {
			...validationData,
			validationDetails: {
				fileSize: true,
				pageCount: true,
				hasReadableText: true,
				notScanned: true,
				noForms: true,
				romanCharsOnly: true,
			},
		},
		remediation,
		reportHtml: '',
		reportText: '',
		complianceScore: analysisData.complianceScore,
	};

	// Generate reports based on format
	if (reportFormat === 'html' || reportFormat === 'both') {
		reportData.reportHtml = ReportFormatter.generateHtmlReport(reportData);
	}

	if (reportFormat === 'text' || reportFormat === 'both') {
		reportData.reportText = ReportFormatter.generateTextReport(reportData);
	}

	return reportData;
}