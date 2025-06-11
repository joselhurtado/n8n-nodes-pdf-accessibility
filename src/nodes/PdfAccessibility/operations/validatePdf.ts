import { IExecuteFunctions } from 'n8n-workflow';
import { PdfUtils } from '../utils/pdfUtils';
import { PdfValidationResult } from '../interfaces';
import * as fs from 'fs';

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
	const inputMethod = this.getNodeParameter('inputMethod', itemIndex, 'binary') as string;

	// Get PDF data based on input method
	let binaryData;
	let pdfBuffer;
	let fileName = 'unknown.pdf';
	
	if (inputMethod === 'upload') {
		// Handle file upload
		const pdfFilePath = this.getNodeParameter('pdfFile', itemIndex, '') as string;
		if (!pdfFilePath) {
			throw new Error('Please select a PDF file to upload');
		}
		
		try {
			pdfBuffer = fs.readFileSync(pdfFilePath);
			fileName = pdfFilePath.split('/').pop() || 'uploaded.pdf';
		} catch (error) {
			throw new Error(`Failed to read uploaded file: ${error instanceof Error ? error.message : String(error)}`);
		}
	} else {
		// Handle binary data from previous node
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
		
		try {
			binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
			pdfBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
			fileName = binaryData.fileName || 'unknown.pdf';
		} catch (error) {
			throw new Error(
				`PDF file required: No binary data found with property name "${binaryPropertyName}". ` +
				'Connect a node that provides PDF data (like HTTP Request for file upload, ' +
				'Read Binary File, or Google Drive) or switch to "Upload File" input method.'
			);
		}
	}

	// Validate PDF
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

	return validation;
}