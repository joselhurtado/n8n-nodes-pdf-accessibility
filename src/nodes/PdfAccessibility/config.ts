export const PDF_LIMITS = {
	MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
	MAX_PAGES: 10,
	MIN_TEXT_LENGTH: 100,
	MAX_TEXT_EXTRACT: 2000, // Characters to extract for analysis
} as const;

export const ANTHROPIC_CONFIG = {
	BASE_URL: 'https://api.anthropic.com/v1',
	DEFAULT_MODEL: 'claude-3-5-sonnet-20241022',
	MAX_TOKENS: 4000,
	VERSION: '2023-06-01',
} as const;

export const WCAG_CRITERIA = [
	'1.1.1 Non-text Content',
	'1.3.1 Info and Relationships',
	'1.4.3 Contrast (Minimum)',
	'2.4.2 Page Titled',
	'2.4.4 Link Purpose (In Context)',
	'3.1.1 Language of Page',
	'4.1.2 Name, Role, Value',
] as const;

export const SUPPORTED_LANGUAGES = [
	{ name: 'English (US)', value: 'en-US' },
	{ name: 'English (UK)', value: 'en-GB' },
	{ name: 'Spanish', value: 'es' },
	{ name: 'French', value: 'fr' },
	{ name: 'German', value: 'de' },
	{ name: 'Italian', value: 'it' },
	{ name: 'Portuguese', value: 'pt' },
	{ name: 'Dutch', value: 'nl' },
] as const;

export const ERROR_MESSAGES = {
	INVALID_FILE: 'Invalid PDF file or corrupted data',
	FILE_TOO_LARGE: `File size exceeds ${PDF_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
	TOO_MANY_PAGES: `Document has more than ${PDF_LIMITS.MAX_PAGES} pages`,
	SCANNED_DOCUMENT: 'Scanned documents are not supported - text-based PDFs only',
	FORM_DOCUMENT: 'Documents with fillable forms are not supported',
	NO_TEXT_CONTENT: 'Document must contain readable text content',
	NON_ROMAN_CHARS: 'Document contains non-Roman characters - not supported',
	AI_API_ERROR: 'Error communicating with AI service',
	REMEDIATION_FAILED: 'Failed to apply accessibility improvements',
	PARSING_ERROR: 'Failed to parse PDF document',
} as const;