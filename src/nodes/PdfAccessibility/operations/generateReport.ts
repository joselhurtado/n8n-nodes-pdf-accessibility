import { IExecuteFunctions } from 'n8n-workflow';
import { ReportFormatter } from '../helpers/reportFormatter';
import { AccessibilityReport, AccessibilityAnalysis, PdfValidationResult, RemediationResult } from '../interfaces';

export async function generateReport(
	this: IExecuteFunctions,
	itemIndex: number,
	validation: PdfValidationResult,
	analysis: AccessibilityAnalysis,
	remediation?: RemediationResult,
): Promise<AccessibilityReport> {
	// Get report options
	const reportFormat = this.getNodeParameter('reportFormat', itemIndex, 'both') as string;
	const includeValidation = this.getNodeParameter('includeValidation', itemIndex, true) as boolean;
	const includeRecommendations = this.getNodeParameter('includeRecommendations', itemIndex, true) as boolean;

	// Build document info
	const documentInfo = {
		originalFileName: validation.fileName,
		processingDate: new Date().toISOString(),
		originalSize: validation.fileSize,
		remediatedSize: remediation?.remediatedFileSize,
		pageCount: validation.pageCount,
	};

	// Create report data
	const reportData: AccessibilityReport = {
		documentInfo,
		analysis: includeRecommendations ? analysis : {
			...analysis,
			recommendations: [], // Exclude recommendations if not wanted
		},
		validation: includeValidation ? validation : {
			...validation,
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
		complianceScore: analysis.complianceScore,
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