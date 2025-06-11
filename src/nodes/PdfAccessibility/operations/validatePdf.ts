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
	let pdfBuffer: Buffer;
	let fileName = 'unknown.pdf';
	
	switch (inputMethod) {
		case 'filepath': {
			// Handle file path (supports expressions)
			const filePath = this.getNodeParameter('filePath', itemIndex, '') as string;
			if (!filePath) {
				throw new Error('Please provide a file path to the PDF');
			}
			
			try {
				pdfBuffer = fs.readFileSync(filePath);
				fileName = filePath.split('/').pop() || 'file.pdf';
			} catch (error) {
				throw new Error(`Failed to read file from path "${filePath}": ${error instanceof Error ? error.message : String(error)}`);
			}
			break;
		}
		
		case 'base64': {
			// Handle base64 encoded data (supports expressions)
			const base64Data = this.getNodeParameter('base64Data', itemIndex, '') as string;
			if (!base64Data) {
				throw new Error('Please provide base64 encoded PDF data');
			}
			
			try {
				// Remove data URL prefix if present (data:application/pdf;base64,)
				const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
				pdfBuffer = Buffer.from(cleanBase64, 'base64');
				fileName = 'base64.pdf';
			} catch (error) {
				throw new Error(`Failed to decode base64 data: ${error instanceof Error ? error.message : String(error)}`);
			}
			break;
		}
		
		case 'binary':
		default: {
			// Handle binary data from previous node (supports expressions for property name)
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
			
			try {
				binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
				pdfBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
				fileName = binaryData.fileName || 'binary.pdf';
			} catch (error) {
				throw new Error(
					`PDF file required: No binary data found with property name "${binaryPropertyName}". ` +
					'Connect a node that provides PDF data (like HTTP Request, Read Binary File, etc.) ' +
					'or switch to "File Path" or "Base64 Data" input method.'
				);
			}
			break;
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