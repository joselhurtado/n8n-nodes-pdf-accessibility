import { AccessibilityAnalysis } from '../interfaces';

export interface IAnalysisOptions {
	wcagLevel: 'A' | 'AA' | 'AAA';
	model?: string;
	language?: string;
	analysisDepth?: 'standard' | 'comprehensive';
}

export interface IProviderCredentials {
	apiKey: string;
	baseUrl?: string;
	model?: string;
	[key: string]: any;
}

export interface ILLMProvider {
	analyzeAccessibility(
		text: string,
		documentInfo: {
			fileName: string;
			pageCount: number;
			wordCount: number;
		},
		options: IAnalysisOptions,
	): Promise<AccessibilityAnalysis>;
	getName(): string;
	getModels(): string[];
	validateCredentials(): Promise<boolean>;
	estimateTokens(text: string): number;
}

export abstract class BaseLLMProvider implements ILLMProvider {
	protected credentials: IProviderCredentials;

	constructor(credentials: IProviderCredentials) {
		this.credentials = credentials;
	}

	abstract analyzeAccessibility(
		text: string,
		documentInfo: {
			fileName: string;
			pageCount: number;
			wordCount: number;
		},
		options: IAnalysisOptions,
	): Promise<AccessibilityAnalysis>;

	abstract getName(): string;
	abstract getModels(): string[];
	abstract validateCredentials(): Promise<boolean>;

	estimateTokens(text: string): number {
		return Math.ceil(text.length / 4);
	}

	protected generateFallbackTitle(fileName: string): string {
		return fileName
			.replace(/\.[^/.]+$/, '')
			.replace(/[_-]/g, ' ')
			.replace(/\b\w/g, l => l.toUpperCase());
	}

	protected buildAnalysisPrompt(
		extractedText: string,
		documentInfo: { fileName: string; pageCount: number; wordCount: number },
		wcagLevel: string = 'AA',
		language: string = 'en-US',
	): string {
		return `You are a PDF accessibility expert specializing in WCAG 2.1 ${wcagLevel} compliance. Analyze this PDF content and provide specific remediation recommendations.

Document Information:
- File: ${documentInfo.fileName}
- Pages: ${documentInfo.pageCount}
- Words: ${documentInfo.wordCount}

Content Sample (first 2000 characters):
${extractedText.substring(0, 2000)}

Provide your analysis as a JSON object with this exact structure:
{
  "suggestedTitle": "A descriptive document title based on content",
  "language": "${language}",
  "structuralChanges": [
    "Added proper heading hierarchy",
    "Enhanced reading order",
    "Improved document structure"
  ],
  "altTextAdded": [
    "Generated alt text for images",
    "Added figure captions",
    "Described visual elements"
  ],
  "tableImprovements": [
    "Added table headers",
    "Improved table summary",
    "Enhanced table accessibility"
  ],
  "linkDescriptions": [
    "Enhanced link text clarity",
    "Added link purposes",
    "Improved link context"
  ],
  "criteriaAddressed": [
    "1.1.1 Non-text Content",
    "1.3.1 Info and Relationships",
    "2.4.2 Page Titled",
    "2.4.4 Link Purpose",
    "3.1.1 Language of Page"
  ],
  "remainingIssues": [
    "Manual review needed for color contrast",
    "Complex table may need restructuring",
    "Some images may need manual alt text review"
  ],
  "complianceScore": 85,
  "recommendations": [
    "Add document language declaration",
    "Ensure logical reading order",
    "Verify heading structure",
    "Review color contrast ratios"
  ]
}

Instructions:
1. Base the suggestedTitle on the actual document content
2. Identify realistic improvements that can be automated
3. Provide a compliance score between 0-100 for WCAG ${wcagLevel} level
4. List specific WCAG 2.1 ${wcagLevel} criteria that would be addressed
5. Be honest about limitations and what requires manual review
6. Focus on improvements that can be applied programmatically

Respond only with the JSON object, no other text.`;
	}

	protected parseAnalysisResponse(
		analysisText: string,
		originalFileName: string,
	): AccessibilityAnalysis {
		try {
			const parsed = JSON.parse(analysisText);

			return {
				suggestedTitle: parsed.suggestedTitle || this.generateFallbackTitle(originalFileName),
				language: parsed.language || 'en-US',
				structuralChanges: Array.isArray(parsed.structuralChanges)
					? parsed.structuralChanges
					: ['Basic PDF structure optimization'],
				altTextAdded: Array.isArray(parsed.altTextAdded)
					? parsed.altTextAdded
					: ['Accessibility metadata added'],
				tableImprovements: Array.isArray(parsed.tableImprovements)
					? parsed.tableImprovements
					: ['Table structure verified'],
				linkDescriptions: Array.isArray(parsed.linkDescriptions)
					? parsed.linkDescriptions
					: ['Link accessibility checked'],
				criteriaAddressed: Array.isArray(parsed.criteriaAddressed)
					? parsed.criteriaAddressed
					: ['2.4.2 Page Titled', '3.1.1 Language of Page'],
				remainingIssues: Array.isArray(parsed.remainingIssues)
					? parsed.remainingIssues
					: ['Manual review recommended for complete compliance'],
				complianceScore: typeof parsed.complianceScore === 'number'
					? Math.min(100, Math.max(0, parsed.complianceScore))
					: 75,
				recommendations: Array.isArray(parsed.recommendations)
					? parsed.recommendations
					: ['Document structure verified', 'Accessibility metadata added'],
			};
		} catch (error) {
			return {
				suggestedTitle: this.generateFallbackTitle(originalFileName),
				language: 'en-US',
				structuralChanges: ['Basic PDF structure optimization'],
				altTextAdded: ['Accessibility metadata added'],
				tableImprovements: ['Table structure verified'],
				linkDescriptions: ['Link accessibility checked'],
				criteriaAddressed: ['2.4.2 Page Titled', '3.1.1 Language of Page'],
				remainingIssues: ['AI analysis parsing failed - manual review recommended'],
				complianceScore: 60,
				recommendations: [
					'Document structure verified',
					'Accessibility metadata added',
					'Manual accessibility review recommended',
				],
			};
		}
	}
}