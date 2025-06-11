import { IExecuteFunctions } from 'n8n-workflow';
import { PdfUtils } from '../utils/pdfUtils';
import { AccessibilityAnalysis, RemediationResult } from '../interfaces';

export async function remediatePdf(
	this: IExecuteFunctions,
	itemIndex: number,
	analysis: AccessibilityAnalysis,
	originalFileName: string,
): Promise<{ result: RemediationResult; remediatedBuffer: Buffer }> {
	// Get remediation options
	const autoTitle = this.getNodeParameter('autoTitle', itemIndex, true) as boolean;
	const setLanguage = this.getNodeParameter('setLanguage', itemIndex, 'en-US') as string;
	const addMetadata = this.getNodeParameter('addMetadata', itemIndex, true) as boolean;
	const outputFilename = this.getNodeParameter('outputFilename', itemIndex, 'ACCESSIBLE_{original}') as string;

	// Get original PDF buffer
	const originalBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, 'data');
	const originalFileSize = originalBuffer.length;

	try {
		// Prepare improvements
		const improvements: {
			title?: string;
			language?: string;
			metadata?: Record<string, string>;
		} = {};

		if (autoTitle && analysis.suggestedTitle) {
			improvements.title = analysis.suggestedTitle;
		}

		if (setLanguage) {
			improvements.language = setLanguage;
		}

		if (addMetadata) {
			improvements.metadata = {
				'accessibility-service': 'N8N PDF Accessibility Service',
				'wcag-level': 'AA',
				'compliance-score': analysis.complianceScore.toString(),
			};
		}

		// Apply remediation
		const remediatedBuffer = await PdfUtils.remediatePdf(originalBuffer, improvements);

		// Generate output filename
		const remediatedFileName = outputFilename.replace(
			'{original}',
			originalFileName.replace(/\.[^/.]+$/, '') // Remove extension
		) + '.pdf';

		// Create result
		const result: RemediationResult = {
			success: true,
			originalFileName,
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
			originalFileName,
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