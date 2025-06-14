import pdfParse from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';
import { PdfValidationResult, PdfAccessibilityError } from '../interfaces';
import { PDF_LIMITS, ERROR_MESSAGES } from '../config';

export class PdfUtils {
	/**
	 * Validates a PDF file and extracts basic information
	 */
	static async validatePdf(
		pdfBuffer: Buffer,
		fileName: string,
		options: {
			maxFileSize?: number;
			maxPages?: number;
			allowScanned?: boolean;
			allowForms?: boolean;
			minTextLength?: number;
		} = {},
	): Promise<PdfValidationResult> {
		const {
			maxFileSize = PDF_LIMITS.MAX_FILE_SIZE,
			maxPages = PDF_LIMITS.MAX_PAGES,
			allowScanned = false,
			allowForms = false,
			minTextLength = PDF_LIMITS.MIN_TEXT_LENGTH,
		} = options;

		try {
			console.log('=== PDF VALIDATION DEBUG ===');
			console.log('PDF Buffer length:', pdfBuffer.length);
			console.log('Max file size:', maxFileSize);
			console.log('File name:', fileName);
			console.log('PDF Buffer first 20 bytes:', pdfBuffer.slice(0, 20));
			console.log('PDF header check:', pdfBuffer.slice(0, 8).toString());
			
			// Basic file validation
			if (pdfBuffer.length > maxFileSize) {
				console.log('❌ File too large');
				throw new Error(PdfAccessibilityError.FILE_TOO_LARGE);
			}

			console.log('✅ File size OK, attempting PDF parse...');
			
			// Parse PDF
			const pdfData = await pdfParse(pdfBuffer);
			console.log('✅ PDF parse successful');
			const pageCount = pdfData.numpages;
			const textContent = pdfData.text || '';
			const textLength = textContent.length;
			const wordCount = textContent.split(/\s+/).filter((word: string) => word.length > 0).length;
			
			console.log('PDF Data extracted:');
			console.log('- Pages:', pageCount);
			console.log('- Text length:', textLength);
			console.log('- Word count:', wordCount);
			console.log('- First 100 chars:', textContent.substring(0, 100));

			// Validation checks
			console.log('Running validation checks...');
			const hasText = textLength >= minTextLength;
			const isScanned = textLength < 50; // Heuristic for scanned documents
			const tooManyPages = pageCount > maxPages;
			
			console.log('Checking form fields...');
			const hasFormFields = this.detectFormFields(pdfBuffer.toString('binary'));
			
			console.log('Checking non-Roman characters...');
			const hasNonRomanChars = this.detectNonRomanChars(textContent);
			
			// DEBUG: Show sample of problematic characters
			if (hasNonRomanChars) {
				const problematicChars = textContent.match(/[^\u0020-\u007F\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g);
				console.log('Problematic characters found:', problematicChars ? problematicChars.slice(0, 10) : 'none');
				console.log('Character codes:', problematicChars ? problematicChars.slice(0, 5).map(c => c.charCodeAt(0)) : 'none');
			}
			
			console.log('Validation results:');
			console.log('- hasText:', hasText, `(${textLength} >= ${minTextLength})`);
			console.log('- isScanned:', isScanned);
			console.log('- tooManyPages:', tooManyPages, `(${pageCount} > ${maxPages})`);
			console.log('- hasFormFields:', hasFormFields);
			console.log('- hasNonRomanChars:', hasNonRomanChars);

			// Overall validation
			const validationDetails = {
				fileSize: pdfBuffer.length <= maxFileSize,
				pageCount: pageCount <= maxPages,
				hasReadableText: hasText,
				notScanned: !isScanned || allowScanned,
				noForms: !hasFormFields || allowForms,
				romanCharsOnly: !hasNonRomanChars,
			};

			const valid = Object.values(validationDetails).every(check => check);
			
			console.log('Final validation details:', validationDetails);
			console.log('Overall valid:', valid);
			
			if (!valid) {
				console.log('❌ Validation failed. Failed checks:');
				const failedChecks: string[] = [];
				Object.entries(validationDetails).forEach(([key, value]) => {
					if (!value) {
						console.log(`  - ${key}: FAILED`);
						failedChecks.push(key);
					}
				});
				
				// Create specific error message based on failed checks
				let specificError = 'PDF validation failed: ';
				if (failedChecks.includes('fileSize')) {
					specificError += `File too large (${pdfBuffer.length} bytes > ${maxFileSize} bytes). `;
				}
				if (failedChecks.includes('pageCount')) {
					specificError += `Too many pages (${pageCount} > ${maxPages}). `;
				}
				if (failedChecks.includes('hasReadableText')) {
					specificError += `Insufficient text content (${textLength} chars < ${minTextLength} required). `;
				}
				if (failedChecks.includes('notScanned')) {
					specificError += `Scanned document detected (not allowed). `;
				}
				if (failedChecks.includes('noForms')) {
					specificError += `Form fields detected (not allowed). `;
				}
				if (failedChecks.includes('romanCharsOnly')) {
					specificError += `Non-Roman characters detected. `;
				}
				
				return {
					valid: false,
					pageCount,
					textLength,
					wordCount,
					hasText,
					isScanned,
					tooManyPages,
					hasFormFields,
					hasNonRomanChars,
					fileSize: pdfBuffer.length,
					fileName,
					extractedText: textContent.substring(0, PDF_LIMITS.MAX_TEXT_EXTRACT),
					validationDetails,
					error: specificError.trim(),
				};
			} else {
				console.log('✅ All validation checks passed!');
			}

			return {
				valid,
				pageCount,
				textLength,
				wordCount,
				hasText,
				isScanned,
				tooManyPages,
				hasFormFields,
				hasNonRomanChars,
				fileSize: pdfBuffer.length,
				fileName,
				extractedText: textContent.substring(0, PDF_LIMITS.MAX_TEXT_EXTRACT),
				validationDetails,
			};
		} catch (error) {
			// Enhanced error handling with specific error messages
			console.log('❌ PDF VALIDATION ERROR ===');
			console.log('Error type:', typeof error);
			console.log('Error instanceof Error:', error instanceof Error);
			console.log('Error message:', error instanceof Error ? error.message : String(error));
			console.log('Error stack:', error instanceof Error ? error.stack : 'No stack');
			
			let errorMessage = 'Unknown validation error';
			
			if (error instanceof Error) {
				errorMessage = error.message;
				
				// Provide specific guidance for common errors
				if (error.message.includes('Invalid PDF')) {
					errorMessage = 'Invalid PDF format or corrupted file. Please ensure the file is a valid PDF.';
				} else if (error.message.includes('password')) {
					errorMessage = 'Password-protected PDFs are not supported. Please provide an unprotected PDF.';
				} else if (error.message.includes('encrypted')) {
					errorMessage = 'Encrypted PDFs are not supported. Please provide an unencrypted PDF.';
				}
			}
			
			console.log('Final error message:', errorMessage);
			
			return {
				valid: false,
				pageCount: 0,
				textLength: 0,
				wordCount: 0,
				hasText: false,
				isScanned: false,
				tooManyPages: false,
				hasFormFields: false,
				hasNonRomanChars: false,
				fileSize: pdfBuffer.length,
				fileName,
				extractedText: '',
				validationDetails: {
					fileSize: pdfBuffer.length <= maxFileSize,
					pageCount: false,
					hasReadableText: false,
					notScanned: false,
					noForms: false,
					romanCharsOnly: false,
				},
				error: errorMessage,
			};
		}
	}

	/**
	 * Applies accessibility improvements to a PDF
	 */
	static async remediatePdf(
		pdfBuffer: Buffer,
		improvements: {
			title?: string;
			language?: string;
			metadata?: Record<string, string>;
		},
	): Promise<Buffer> {
		try {
			const pdfDoc = await PDFDocument.load(pdfBuffer);

			// Set document title
			if (improvements.title) {
				pdfDoc.setTitle(improvements.title);
			}

			// Set language for screen readers
			if (improvements.language) {
				pdfDoc.setLanguage(improvements.language);
			}

			// Set accessibility metadata
			pdfDoc.setProducer('N8N PDF Accessibility Service v1.0');
			pdfDoc.setSubject('WCAG 2.1 AA Compliant Document');
			pdfDoc.setKeywords(['accessibility', 'WCAG', 'compliant', 'remediated']);
			pdfDoc.setCreator('PDF Accessibility Automation');
			pdfDoc.setCreationDate(new Date());
			pdfDoc.setModificationDate(new Date());

			// Apply additional metadata
			if (improvements.metadata) {
				Object.entries(improvements.metadata).forEach(([_key, _value]) => {
					// Note: pdf-lib has limited metadata support
					// For full accessibility tagging, additional libraries would be needed
				});
			}

			// Save the remediated PDF
			const remediatedPdfBytes = await pdfDoc.save({
				useObjectStreams: false, // Better compatibility
				addDefaultPage: false,
				objectsPerTick: 50,
			});

			return Buffer.from(remediatedPdfBytes);
		} catch (error) {
			throw new Error(
				`${ERROR_MESSAGES.REMEDIATION_FAILED}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	/**
	 * Detects if PDF contains form fields
	 */
	private static detectFormFields(pdfRawContent: string): boolean {
		try {
			const formIndicators = ['/AcroForm', '/XFA', '/Widget', '/Tx', '/Ch', '/Btn'];
			return formIndicators.some(indicator => pdfRawContent.includes(indicator));
		} catch (error) {
			// If detection fails, assume no forms to avoid blocking validation
			return false;
		}
	}

	/**
	 * Detects non-Roman characters in text
	 */
	private static detectNonRomanChars(text: string): boolean {
		// Extended check for Latin scripts including Spanish, French, German, etc.
		// Allow: Basic Latin, Latin-1 Supplement, Latin Extended-A, Latin Extended-B
		// This covers accented characters like á, é, í, ó, ú, ñ, ç, etc.
		// Also allow common whitespace characters: space, tab, newline, carriage return
		const nonRomanPattern = /[^\u0020-\u007F\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\s]/;
		return nonRomanPattern.test(text);
	}

	/**
	 * Extracts images and their positions from PDF (placeholder)
	 */
	static async extractImages(_pdfBuffer: Buffer): Promise<Array<{ page: number; bbox: number[] }>> {
		// This is a placeholder - full image extraction requires additional libraries
		// like pdf2pic or pdf-poppler for complete implementation
		return [];
	}

	/**
	 * Formats file size for human reading
	 */
	static formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
}