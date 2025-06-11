export interface PdfValidationResult {
	valid: boolean;
	pageCount: number;
	textLength: number;
	wordCount: number;
	hasText: boolean;
	isScanned: boolean;
	tooManyPages: boolean;
	hasFormFields: boolean;
	hasNonRomanChars: boolean;
	fileSize: number;
	fileName: string;
	extractedText: string;
	validationDetails: ValidationDetails;
	error?: string;
}

export interface ValidationDetails {
	fileSize: boolean;
	pageCount: boolean;
	hasReadableText: boolean;
	notScanned: boolean;
	noForms: boolean;
	romanCharsOnly: boolean;
}

export interface AccessibilityAnalysis {
	suggestedTitle: string;
	language: string;
	structuralChanges: string[];
	altTextAdded: string[];
	tableImprovements: string[];
	linkDescriptions: string[];
	criteriaAddressed: string[];
	remainingIssues: string[];
	complianceScore: number;
	recommendations: string[];
}

export interface RemediationResult {
	success: boolean;
	originalFileName: string;
	remediatedFileName: string;
	originalFileSize: number;
	remediatedFileSize: number;
	improvementsApplied: string[];
	processingTimestamp: string;
	error?: string;
}

export interface AccessibilityReport {
	documentInfo: {
		originalFileName: string;
		processingDate: string;
		originalSize: number;
		remediatedSize?: number;
		pageCount: number;
	};
	analysis: AccessibilityAnalysis;
	validation: PdfValidationResult;
	remediation?: RemediationResult;
	reportHtml: string;
	reportText: string;
	complianceScore: number;
}

export interface AnthropicResponse {
	content: Array<{
		text: string;
		type: string;
	}>;
	id: string;
	model: string;
	role: string;
	stop_reason: string;
	stop_sequence: null;
	type: string;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

export interface PdfProcessingOptions {
	maxFileSize: number;
	maxPages: number;
	allowScanned: boolean;
	allowForms: boolean;
	requireText: boolean;
	minTextLength: number;
	outputFormat: 'complete' | 'summary' | 'scores-only' | 'report-only';
	includeOriginal: boolean;
}

export enum PdfAccessibilityError {
	INVALID_FILE = 'INVALID_FILE',
	FILE_TOO_LARGE = 'FILE_TOO_LARGE',
	TOO_MANY_PAGES = 'TOO_MANY_PAGES',
	SCANNED_DOCUMENT = 'SCANNED_DOCUMENT',
	FORM_DOCUMENT = 'FORM_DOCUMENT',
	NO_TEXT_CONTENT = 'NO_TEXT_CONTENT',
	NON_ROMAN_CHARS = 'NON_ROMAN_CHARS',
	AI_API_ERROR = 'AI_API_ERROR',
	REMEDIATION_FAILED = 'REMEDIATION_FAILED',
	PARSING_ERROR = 'PARSING_ERROR',
}