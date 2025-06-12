import { IExecuteFunctions } from 'n8n-workflow';
import * as fs from 'fs';

export interface IPdfInput {
	buffer: Buffer;
	fileName: string;
}

/**
 * Helper function to detect if a string is valid base64
 */
function isBase64String(str: string): boolean {
	if (typeof str !== 'string' || str.length === 0) return false;
	const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
	if (!base64Pattern.test(str) || str.length % 4 !== 0) return false;
	
	try {
		const decoded = Buffer.from(str, 'base64');
		return decoded.slice(0, 8).toString().startsWith('%PDF-');
	} catch {
		return false;
	}
}

/**
 * Intelligent format detection and conversion to PDF Buffer
 */
async function convertToPdfBuffer(rawData: any, binaryData?: any): Promise<Buffer> {
	// If it's already a proper Buffer with PDF header, return it
	if (Buffer.isBuffer(rawData)) {
		const header = rawData.slice(0, 8).toString();
		if (header.startsWith('%PDF-')) {
			return rawData;
		}
		// If Buffer but not PDF, might be base64 encoded
		const base64String = rawData.toString();
		if (isBase64String(base64String)) {
			return Buffer.from(base64String, 'base64');
		}
	}
	
	// Handle base64 string (Google Drive format)
	if (typeof rawData === 'string' && isBase64String(rawData)) {
		return Buffer.from(rawData, 'base64');
	}
	
	// Handle serialized Buffer: {type: "Buffer", data: [array]}
	if (typeof rawData === 'object' && 
			rawData.type === 'Buffer' && 
			Array.isArray(rawData.data)) {
		return Buffer.from(rawData.data);
	}
	
	// Check if binaryData contains the actual data in .data property
	if (binaryData && binaryData.data) {
		if (typeof binaryData.data === 'string' && isBase64String(binaryData.data)) {
			return Buffer.from(binaryData.data, 'base64');
		}
		if (typeof binaryData.data === 'object' && 
				binaryData.data.type === 'Buffer' && 
				Array.isArray(binaryData.data.data)) {
			return Buffer.from(binaryData.data.data);
		}
	}
	
	throw new Error('Unable to convert binary data to PDF Buffer. Ensure the data is a valid PDF.');
}

export async function getPdfInput(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IPdfInput> {
	const inputMethod = context.getNodeParameter('inputMethod', itemIndex, 'binary') as string;
	
	let pdfBuffer: Buffer;
	let fileName = 'unknown.pdf';
	
	switch (inputMethod) {
		case 'filepath': {
			// Handle file path (supports expressions)
			const filePath = context.getNodeParameter('filePath', itemIndex, '') as string;
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
			const base64Data = context.getNodeParameter('base64Data', itemIndex, '') as string;
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
		
		case 'url': {
			// Handle URL download (Google Drive share links, direct URLs, etc.)
			const url = context.getNodeParameter('url', itemIndex, '') as string;
			if (!url) {
				throw new Error('Please provide a URL to the PDF');
			}
			
			try {
				const response = await context.helpers.httpRequest({
					method: 'GET',
					url: url,
					returnFullResponse: false,
				});
				
				pdfBuffer = Buffer.isBuffer(response) ? response : Buffer.from(response);
				fileName = url.split('/').pop()?.split('?')[0] || 'downloaded.pdf';
			} catch (error) {
				throw new Error(`Failed to download PDF from URL "${url}": ${error instanceof Error ? error.message : String(error)}`);
			}
			break;
		}
		
		case 'binary':
		default: {
			// Handle binary data from previous node with intelligent format detection
			const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
			
			try {
				const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
				const rawData = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
				
				// 🆕 INTELLIGENT FORMAT DETECTION AND CONVERSION
				pdfBuffer = await convertToPdfBuffer(rawData, binaryData);
				fileName = binaryData.fileName || 'binary.pdf';
				
			} catch (error) {
				throw new Error(
					`PDF file required: No binary data found with property name "${binaryPropertyName}". ` +
					'Connect a node that provides PDF data (like HTTP Request, Read Binary File, Google Drive, etc.) ' +
					'or switch to "File Path", "URL", or "Base64 Data" input method.'
				);
			}
			break;
		}
	}
	
	return { buffer: pdfBuffer, fileName };
}