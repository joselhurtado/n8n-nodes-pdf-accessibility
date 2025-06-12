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
 * Handles all major binary data formats from Google Drive, HTTP Request, and other N8N nodes
 */
async function convertToPdfBuffer(rawData: any, binaryData?: any): Promise<Buffer> {
	// Optional debug mode (can be enabled via environment variable)
	const debug = process.env.PDF_DEBUG === 'true';
	
	if (debug) {
		console.log('=== PDF BUFFER CONVERSION DEBUG ===');
		console.log('rawData type:', typeof rawData);
		console.log('rawData isBuffer:', Buffer.isBuffer(rawData));
		console.log('binaryData exists:', !!binaryData);
	}
	
	// If it's already a proper Buffer with PDF header, return it
	if (Buffer.isBuffer(rawData)) {
		const header = rawData.slice(0, 8).toString();
		if (debug) console.log('Buffer header:', header);
		if (header.startsWith('%PDF-')) {
			if (debug) console.log('✅ Valid PDF Buffer found');
			return rawData;
		}
		// If Buffer but not PDF, might be base64 encoded
		const base64String = rawData.toString();
		if (isBase64String(base64String)) {
			if (debug) console.log('✅ Buffer contains base64, converting');
			return Buffer.from(base64String, 'base64');
		}
	}
	
	// Handle base64 string (Google Drive format)
	if (typeof rawData === 'string') {
		if (debug) {
			console.log('rawData is string, length:', rawData.length);
			console.log('String starts with:', rawData.substring(0, 20));
		}
		if (isBase64String(rawData)) {
			if (debug) console.log('✅ Valid base64 string found');
			return Buffer.from(rawData, 'base64');
		}
	}
	
	// Handle serialized Buffer: {type: "Buffer", data: [array]}
	if (typeof rawData === 'object' && 
			rawData.type === 'Buffer' && 
			Array.isArray(rawData.data)) {
		if (debug) console.log('✅ Serialized Buffer found, data length:', rawData.data.length);
		return Buffer.from(rawData.data);
	}
	
	// Check if binaryData contains the actual data in .data property
	if (binaryData && binaryData.data) {
		if (debug) console.log('Checking binaryData.data...');
		if (typeof binaryData.data === 'string' && isBase64String(binaryData.data)) {
			if (debug) console.log('✅ Base64 in binaryData.data found');
			return Buffer.from(binaryData.data, 'base64');
		}
		if (typeof binaryData.data === 'object' && 
				binaryData.data.type === 'Buffer' && 
				Array.isArray(binaryData.data.data)) {
			if (debug) console.log('✅ Serialized Buffer in binaryData.data found');
			return Buffer.from(binaryData.data.data);
		}
		
		// Check if binaryData.data is already a Buffer
		if (Buffer.isBuffer(binaryData.data)) {
			if (debug) console.log('✅ Direct Buffer in binaryData.data found');
			return binaryData.data;
		}
	}
	
	// Additional Google Drive formats
	if (binaryData && binaryData.content) {
		if (debug) console.log('Checking binaryData.content...');
		if (typeof binaryData.content === 'string' && isBase64String(binaryData.content)) {
			if (debug) console.log('✅ Base64 in binaryData.content found');
			return Buffer.from(binaryData.content, 'base64');
		}
	}
	
	// Check nested data structures
	if (rawData && rawData.data && typeof rawData.data === 'string') {
		if (debug) console.log('Checking rawData.data string...');
		if (isBase64String(rawData.data)) {
			if (debug) console.log('✅ Base64 in rawData.data found');
			return Buffer.from(rawData.data, 'base64');
		}
	}
	
	// Enhanced error with troubleshooting guidance
	const errorDetails = {
		rawDataType: typeof rawData,
		rawDataKeys: rawData && typeof rawData === 'object' ? Object.keys(rawData) : 'N/A',
		binaryDataKeys: binaryData ? Object.keys(binaryData) : 'N/A'
	};
	
	if (debug) {
		console.log('❌ No valid PDF format detected');
		console.log('Available data summary:', errorDetails);
	}
	
	throw new Error(
		'Unable to convert binary data to PDF Buffer. ' +
		'Troubleshooting: ' +
		'1) Ensure the input is a valid PDF file. ' +
		'2) If using Google Drive, try "Get File" or "Download File" operations. ' +
		'3) If using HTTP Request, ensure response type is binary. ' +
		'4) Enable debug mode (set PDF_DEBUG=true) for detailed analysis. ' +
		`Data analysis: ${JSON.stringify(errorDetails)}`
	);
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
				// Convert Google Drive share links to direct download links
				let downloadUrl = url;
				if (url.includes('drive.google.com/file/d/')) {
					// Extract file ID from share link
					const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
					if (fileIdMatch) {
						downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
					}
				} else if (url.includes('docs.google.com/document/d/')) {
					// Extract document ID from Google Docs link
					const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
					if (docIdMatch) {
						downloadUrl = `https://docs.google.com/document/d/${docIdMatch[1]}/export?format=pdf`;
					}
				}
				
				const response = await context.helpers.httpRequest({
					method: 'GET',
					url: downloadUrl,
					returnFullResponse: false,
					encoding: 'arraybuffer',
					headers: {
						'User-Agent': 'N8N-PDF-Accessibility-Node/1.2.8'
					}
				});
				
				pdfBuffer = Buffer.isBuffer(response) ? response : Buffer.from(response);
				
				// Extract filename from URL or use default
				fileName = url.split('/').pop()?.split('?')[0] || 'downloaded.pdf';
				if (!fileName.endsWith('.pdf')) {
					fileName += '.pdf';
				}
				
			} catch (error) {
				throw new Error(
					`Failed to download PDF from URL "${url}". ` +
					'Troubleshooting: ' +
					'1) Ensure the URL is publicly accessible. ' +
					'2) For Google Drive, use shareable links with "Anyone with the link can view" permissions. ' +
					'3) For Google Docs, the document will be automatically converted to PDF. ' +
					`Error: ${error instanceof Error ? error.message : String(error)}`
				);
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
				const isFormatError = error instanceof Error && error.message.includes('Unable to convert binary data');
				if (isFormatError) {
					// Re-throw format conversion errors with original message
					throw error;
				}
				
				throw new Error(
					`PDF file required: No binary data found with property name "${binaryPropertyName}". ` +
					'Troubleshooting: ' +
					'1) Connect a node that provides PDF data (HTTP Request, Read Binary File, Google Drive, etc.). ' +
					'2) Ensure the previous node outputs binary data, not JSON. ' +
					'3) Check the binary property name matches the previous node output. ' +
					'4) Alternative: Switch to "File Path", "URL", or "Base64 Data" input method. ' +
					'5) For Google Drive: Use "Get File" or "Download File" operations instead of "Get" or "List".'
				);
			}
			break;
		}
	}
	
	return { buffer: pdfBuffer, fileName };
}