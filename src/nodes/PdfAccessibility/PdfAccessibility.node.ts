import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { validatePdf } from './operations/validatePdf';
import { analyzePdf } from './operations/analyzePdf';
import { remediatePdf } from './operations/remediatePdf';
import { generateReport } from './operations/generateReport';
import { getPdfInput } from './utils/inputUtils';
import { SUPPORTED_LANGUAGES } from './config';
import { PdfValidationResult, AccessibilityAnalysis } from './interfaces';

export class PdfAccessibility implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PDF Accessibility',
		name: 'pdfAccessibility',
    icon: 'file:pdf-accessibility.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Analyze and remediate PDF documents for WCAG accessibility compliance with flexible input options.',
		defaults: {
			name: 'PDF Accessibility',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'anthropicApi',
				required: true,
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['anthropic'],
					},
				},
			},
			{
				name: 'openAIApi',
				required: true,
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['openai'],
					},
				},
			},
			{
				name: 'googleApi',
				required: true,
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['google'],
					},
				},
			},
			{
				name: 'customApi',
				required: true,
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['custom'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'LLM Provider',
				name: 'llmProvider',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Anthropic (Claude)',
						value: 'anthropic',
						description: 'Use Anthropic Claude models for analysis',
					},
					{
						name: 'OpenAI (GPT)',
						value: 'openai',
						description: 'Use OpenAI GPT models for analysis',
					},
					{
						name: 'Google (Gemini)',
						value: 'google',
						description: 'Use Google Gemini models for analysis',
					},
					{
						name: 'Custom API',
						value: 'custom',
						description: 'Use a custom LLM API endpoint',
					},
				],
				default: 'anthropic',
				description: 'Choose your preferred LLM provider for accessibility analysis',
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Validate PDF',
						value: 'validatePdf',
						description: 'Validate PDF file for accessibility processing',
						action: 'Validate a PDF file',
					},
					{
						name: 'Analyze Accessibility',
						value: 'analyzePdf',
						description: 'Analyze PDF for WCAG compliance issues using AI',
						action: 'Analyze PDF accessibility',
					},
					{
						name: 'Remediate PDF',
						value: 'remediatePdf',
						description: 'Apply accessibility improvements to PDF',
						action: 'Remediate PDF accessibility',
					},
					{
						name: 'Generate Report',
						value: 'generateReport',
						description: 'Generate detailed accessibility report',
						action: 'Generate accessibility report',
					},
					{
						name: 'Full Workflow',
						value: 'fullWorkflow',
						description: 'Complete validation, analysis, and remediation',
						action: 'Run full accessibility workflow',
					},
				],
				default: 'fullWorkflow',
			},

			// PDF Input Method
			{
				displayName: 'Input Method',
				name: 'inputMethod',
				type: 'options',
				options: [
					{
						name: 'Binary Data from Previous Node',
						value: 'binary',
						description: 'Use PDF binary data from previous node',
					},
					{
						name: 'Download from URL',
						value: 'url',
						description: 'Download PDF from a URL (Google Drive share links, direct URLs, etc.)',
					},
					{
						name: 'File Path (Local/Network)',
						value: 'filepath',
						description: 'Provide file path to PDF (supports expressions)',
					},
					{
						name: 'Base64 Encoded Data',
						value: 'base64',
						description: 'Provide PDF as base64 encoded string',
					},
				],
				default: 'binary',
				description: 'Choose how to provide the PDF file',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'https://drive.google.com/file/d/... or {{$json.pdfUrl}}',
				description: 'URL to download PDF from. Supports Google Drive share links, direct URLs, and expressions.',
				displayOptions: {
					show: {
						inputMethod: ['url'],
					},
				},
			},
			{
				displayName: 'File Path',
				name: 'filePath',
				type: 'string',
				default: '',
				placeholder: '/path/to/file.pdf or {{$json.filePath}}',
				description: 'Full path to PDF file. Supports expressions and variables.',
				displayOptions: {
					show: {
						inputMethod: ['filepath'],
					},
				},
			},
			{
				displayName: 'Base64 Data',
				name: 'base64Data',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'JVBERi0xLjQK... or {{$json.pdfBase64}}',
				description: 'PDF file as base64 encoded string. Supports expressions.',
				displayOptions: {
					show: {
						inputMethod: ['base64'],
					},
				},
			},
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				placeholder: 'data or {{$json.propertyName}}',
				description: 'Name of the binary property containing PDF. Supports expressions.',
				displayOptions: {
					show: {
						inputMethod: ['binary'],
					},
				},
			},

			// Validation Options
			{
				displayName: 'Maximum File Size (MB)',
				name: 'maxFileSize',
				type: 'number',
				default: 20,
				description: 'Maximum allowed file size in megabytes',
				displayOptions: {
					show: {
						operation: [
							'validatePdf',
							'analyzePdf',
							'remediatePdf',
							'generateReport',
							'fullWorkflow',
						],
					},
				},
			},
			{
				displayName: 'Maximum Pages',
				name: 'maxPages',
				type: 'number',
				default: 10,
				description: 'Maximum number of pages allowed',
				displayOptions: {
					show: {
						operation: [
							'validatePdf',
							'analyzePdf',
							'remediatePdf',
							'generateReport',
							'fullWorkflow',
						],
					},
				},
			},
			{
				displayName: 'Allow Scanned Documents',
				name: 'allowScanned',
				type: 'boolean',
				default: false,
				description: 'Whether to allow scanned documents (lower accuracy)',
				displayOptions: {
					show: {
						operation: [
							'validatePdf',
							'analyzePdf',
							'remediatePdf',
							'generateReport',
							'fullWorkflow',
						],
					},
				},
			},
			{
				displayName: 'Allow Form Documents',
				name: 'allowForms',
				type: 'boolean',
				default: false,
				description: 'Whether to allow documents with fillable forms',
				displayOptions: {
					show: {
						operation: [
							'validatePdf',
							'analyzePdf',
							'remediatePdf',
							'generateReport',
							'fullWorkflow',
						],
					},
				},
			},
			{
				displayName: 'Minimum Text Length',
				name: 'minTextLength',
				type: 'number',
				default: 100,
				description: 'Minimum number of characters required for text content',
				displayOptions: {
					show: {
						operation: [
							'validatePdf',
							'analyzePdf',
							'remediatePdf',
							'generateReport',
							'fullWorkflow',
						],
					},
				},
			},

			// AI Analysis Options
			{
				displayName: 'AI Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'Claude 3.5 Sonnet',
						value: 'claude-3-5-sonnet-20241022',
						description: 'Best for complex analysis (recommended)',
					},
					{
						name: 'Claude 3.5 Haiku',
						value: 'claude-3-5-haiku-20241022',
						description: 'Faster and more cost-effective',
					},
					{
						name: 'Claude 3 Opus',
						value: 'claude-3-opus-20240229',
						description: 'Most capable for complex analysis',
					},
				],
				default: 'claude-3-5-sonnet-20241022',
				description: 'Anthropic Claude model to use for analysis',
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['anthropic'],
					},
				},
			},
			{
				displayName: 'AI Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'GPT-4 Turbo',
						value: 'gpt-4-turbo-preview',
						description: 'Latest GPT-4 with improved capabilities',
					},
					{
						name: 'GPT-4',
						value: 'gpt-4',
						description: 'Standard GPT-4 model',
					},
					{
						name: 'GPT-3.5 Turbo',
						value: 'gpt-3.5-turbo',
						description: 'Faster and more cost-effective',
					},
				],
				default: 'gpt-4-turbo-preview',
				description: 'OpenAI model to use for analysis',
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['openai'],
					},
				},
			},
			{
				displayName: 'AI Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'Gemini 1.5 Pro',
						value: 'gemini-1.5-pro-latest',
						description: 'Latest and most capable Gemini model',
					},
					{
						name: 'Gemini 1.5 Flash',
						value: 'gemini-1.5-flash-latest',
						description: 'Faster Gemini model',
					},
					{
						name: 'Gemini Pro',
						value: 'gemini-pro',
						description: 'Standard Gemini model',
					},
				],
				default: 'gemini-1.5-pro-latest',
				description: 'Google Gemini model to use for analysis',
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['google'],
					},
				},
			},
			{
				displayName: 'AI Model',
				name: 'model',
				type: 'string',
				default: '',
				placeholder: 'your-model-name',
				description: 'Model name/ID for your custom LLM API',
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
						llmProvider: ['custom'],
					},
				},
			},
			{
				displayName: 'WCAG Level',
				name: 'wcagLevel',
				type: 'options',
				options: [
					{
						name: 'A',
						value: 'A',
						description: 'Minimum level',
					},
					{
						name: 'AA',
						value: 'AA',
						description: 'Standard level (recommended)',
					},
					{
						name: 'AAA',
						value: 'AAA',
						description: 'Enhanced level',
					},
				],
				default: 'AA',
				description: 'WCAG compliance level to target',
				displayOptions: {
					show: {
						operation: ['analyzePdf', 'fullWorkflow'],
					},
				},
			},

			// Remediation Options
			{
				displayName: 'Auto-Generate Title',
				name: 'autoTitle',
				type: 'boolean',
				default: true,
				description: 'Automatically generate document title from content',
				displayOptions: {
					show: {
						operation: ['remediatePdf', 'fullWorkflow'],
					},
				},
			},
			{
				displayName: 'Document Language',
				name: 'setLanguage',
				type: 'options',
				options: SUPPORTED_LANGUAGES.map((lang) => ({
					name: lang.name,
					value: lang.value,
				})),
				default: 'en-US',
				description: 'Primary language of the document',
				displayOptions: {
					show: {
						operation: ['remediatePdf', 'fullWorkflow'],
					},
				},
			},
			{
				displayName: 'Add Accessibility Metadata',
				name: 'addMetadata',
				type: 'boolean',
				default: true,
				description: 'Add accessibility-related metadata to PDF',
				displayOptions: {
					show: {
						operation: ['remediatePdf', 'fullWorkflow'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'outputFilename',
				type: 'string',
				default: 'ACCESSIBLE_{original}',
				description: 'Filename pattern for remediated PDF. Use {original} for original name.',
				displayOptions: {
					show: {
						operation: ['remediatePdf', 'fullWorkflow'],
					},
				},
			},

			// Report Options
			{
				displayName: 'Report Format',
				name: 'reportFormat',
				type: 'options',
				options: [
					{
						name: 'HTML',
						value: 'html',
						description: 'HTML formatted report',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Plain text report',
					},
					{
						name: 'Both',
						value: 'both',
						description: 'Both HTML and text formats',
					},
				],
				default: 'both',
				description: 'Format for the accessibility report',
				displayOptions: {
					show: {
						operation: ['generateReport', 'fullWorkflow'],
					},
				},
			},
			{
				displayName: 'Include Validation Details',
				name: 'includeValidation',
				type: 'boolean',
				default: true,
				description: 'Include validation results in the report',
				displayOptions: {
					show: {
						operation: ['generateReport', 'fullWorkflow'],
					},
				},
			},
			{
				displayName: 'Include Recommendations',
				name: 'includeRecommendations',
				type: 'boolean',
				default: true,
				description: 'Include AI-generated recommendations in the report',
				displayOptions: {
					show: {
						operation: ['generateReport', 'fullWorkflow'],
					},
				},
			},

			// Output Options
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Complete',
						value: 'complete',
						description: 'Full results with all data',
					},
					{
						name: 'Summary',
						value: 'summary',
						description: 'Summary results only',
					},
					{
						name: 'Report Only',
						value: 'report-only',
						description: 'Only the accessibility report',
					},
				],
				default: 'complete',
				description: 'How much data to include in the output',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const outputFormat = this.getNodeParameter('outputFormat', i, 'complete') as string;

				let result: any = {};
				const binaryData: any = {};

				switch (operation) {
					case 'validatePdf':
						result = await validatePdf.call(this, i);
						break;

					case 'analyzePdf': {
						// Can work standalone or with validation data from previous node
						const validationInput = items[i].json as unknown as PdfValidationResult;
						if (validationInput && validationInput.extractedText) {
							// Use validation data from previous node
							result = await analyzePdf.call(this, i, validationInput);
						} else {
							// Perform validation and analysis directly
							result = await analyzePdf.call(this, i);
						}
						break;
					}

					case 'remediatePdf': {
						// Can work standalone or with analysis data from previous node
						const analysisInput = items[i].json as unknown as AccessibilityAnalysis;
						let remediationResult;
						if (analysisInput && analysisInput.suggestedTitle) {
							// Use analysis data from previous node
							const binaryInputData = this.helpers.assertBinaryData(i, 'data');
							remediationResult = await remediatePdf.call(
								this,
								i,
								analysisInput,
								binaryInputData.fileName || 'unknown.pdf',
							);
						} else {
							// Perform validation, analysis, and remediation directly
							remediationResult = await remediatePdf.call(this, i);
						}
						result = remediationResult.result;
						binaryData.remediatedPdf = {
							data: remediationResult.remediatedBuffer.toString('base64'),
							mimeType: 'application/pdf',
							fileName: result.remediatedFileName,
						};
						break;
					}

					case 'generateReport': {
						// Can work standalone or with validation and analysis data from previous steps
						const reportInput = items[i].json;
						if (reportInput && reportInput.validation && reportInput.analysis) {
							// Use data from previous steps
							result = await generateReport.call(
								this,
								i,
								reportInput.validation as unknown as PdfValidationResult,
								reportInput.analysis as unknown as AccessibilityAnalysis,
								reportInput.remediation as any,
							);
						} else {
							// Perform validation, analysis, and generate report directly
							result = await generateReport.call(this, i);
						}
						break;
					}

					case 'fullWorkflow': {
						// Execute complete workflow
						const validation = await validatePdf.call(this, i);

						if (!validation.valid) {
							throw new NodeOperationError(
								this.getNode(),
								`PDF validation failed: ${validation.error || 'Unknown validation error'}`,
								{ itemIndex: i },
							);
						}

						const analysis = await analyzePdf.call(this, i, validation);

						const remediation = await remediatePdf.call(this, i, analysis, validation.fileName);

						const report = await generateReport.call(
							this,
							i,
							validation,
							analysis,
							remediation.result,
						);

						// Combine all results
						result = {
							validation,
							analysis,
							remediation: remediation.result,
							report,
							processingComplete: true,
							processingTimestamp: new Date().toISOString(),
						};

						// Add remediated PDF to binary data
						const pdfInput = await getPdfInput(this, i);
						binaryData.originalPdf = {
							data: pdfInput.buffer.toString('base64'),
							mimeType: 'application/pdf',
							fileName: pdfInput.fileName,
						};
						binaryData.remediatedPdf = {
							data: remediation.remediatedBuffer.toString('base64'),
							mimeType: 'application/pdf',
							fileName: remediation.result.remediatedFileName,
						};
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				// Format output based on outputFormat parameter
				let outputData: any;
				switch (outputFormat) {
					case 'summary':
						outputData = (this as any).extractSummary(result, operation);
						break;
					case 'report-only':
						outputData =
							operation === 'generateReport' || operation === 'fullWorkflow'
								? result.report || result
								: result;
						break;
					case 'complete':
					default:
						outputData = result;
						break;
				}

				returnData.push({
					json: outputData,
					binary: Object.keys(binaryData).length > 0 ? binaryData : items[i].binary,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
							operation: this.getNodeParameter('operation', i),
							timestamp: new Date().toISOString(),
						},
						binary: items[i].binary,
					});
					continue;
				}

				if (error instanceof NodeApiError || error instanceof NodeOperationError) {
					throw error;
				}

				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}

	// @ts-expect-error - This method is used via type cast in execute method
	private extractSummary(result: any, operation: string): any {
		switch (operation) {
			case 'validatePdf':
				return {
					valid: result.valid,
					pageCount: result.pageCount,
					fileSize: result.fileSize,
					fileName: result.fileName,
					issues: result.valid ? [] : this.getValidationIssues(result),
				};
			case 'analyzePdf':
				return {
					complianceScore: result.complianceScore,
					suggestedTitle: result.suggestedTitle,
					criteriaAddressed: result.criteriaAddressed?.length || 0,
					remainingIssues: result.remainingIssues?.length || 0,
				};
			case 'remediatePdf':
				return {
					success: result.success,
					originalFileName: result.originalFileName,
					remediatedFileName: result.remediatedFileName,
					improvementsApplied: result.improvementsApplied?.length || 0,
				};
			case 'generateReport':
				return {
					complianceScore: result.complianceScore,
					reportGenerated: true,
					documentInfo: result.documentInfo,
				};
			case 'fullWorkflow':
				return {
					processingComplete: result.processingComplete,
					complianceScore: result.analysis?.complianceScore,
					remediationSuccess: result.remediation?.success,
					reportGenerated: !!result.report,
				};
			default:
				return result;
		}
	}

	private getValidationIssues(validation: any): string[] {
		const issues: string[] = [];
		const details = validation.validationDetails || {};

		if (!details.fileSize) issues.push('File size exceeds limit');
		if (!details.pageCount) issues.push('Too many pages');
		if (!details.hasReadableText) issues.push('No readable text content');
		if (!details.notScanned) issues.push('Appears to be scanned document');
		if (!details.noForms) issues.push('Contains fillable forms');
		if (!details.romanCharsOnly) issues.push('Contains non-Roman characters');

		return issues;
	}
}
