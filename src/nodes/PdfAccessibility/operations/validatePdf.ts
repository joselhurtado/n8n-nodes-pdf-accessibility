import { IExecuteFunctions } from 'n8n-workflow';
import { PdfUtils } from '../utils/pdfUtils';
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

	// Get binary data with helpful error message
	let binaryData;
	let pdfBuffer;
	
	try {
		binaryData = this.helpers.assertBinaryData(itemIndex, 'data');
		pdfBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, 'data');
	} catch (error) {
		throw new Error(
			'PDF file required: This node expects a PDF file as binary input. ' +
			'Connect a node that provides PDF data (like HTTP Request for file upload, ' +
			'Read Binary File, or Google Drive) to the "data" binary property. ' +
			'Make sure the previous node outputs the PDF file in the binary data with key "data".'
		);
	}

	// Validate PDF
	const validation = await PdfUtils.validatePdf(
		pdfBuffer,
		binaryData.fileName || 'unknown.pdf',
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