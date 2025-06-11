import { IExecuteFunctions } from 'n8n-workflow';
import { PdfUtils } from '../utils/pdfUtils';
import { getPdfInput } from '../utils/inputUtils';
import { PdfValidationResult } from '../interfaces';

export async function validatePdf(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<PdfValidationResult> {
	// Get input parameters
	const maxFileSize = this.getNodeParameter('maxFileSize', itemIndex, 20) as number * 1024 * 1024; // Convert MB to bytes
	const maxPages = this.getNodeParameter('maxPages', itemIndex, 10) as number;
	const allowScanned = this.getNodeParameter('allowScanned', itemIndex, false) as boolean;
	const allowForms = this.getNodeParameter('allowForms', itemIndex, false) as boolean;
	const minTextLength = this.getNodeParameter('minTextLength', itemIndex, 100) as number;

	// Get PDF input using utility function
	const pdfInput = await getPdfInput(this, itemIndex);

	// Validate PDF
	const validation = await PdfUtils.validatePdf(
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

	return validation;
}