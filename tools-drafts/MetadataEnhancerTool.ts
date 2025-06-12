import { 
	AccessibilityToolInterface, 
	PdfAnalysisContext, 
	ToolExecutionResult, 
	AccessibilityIssue, 
	AccessibilityFix 
} from './AccessibilityToolsManager';

interface MetadataInfo {
	title?: string;
	author?: string;
	subject?: string;
	keywords?: string;
	creator?: string;
	producer?: string;
	creationDate?: Date;
	modificationDate?: Date;
	language?: string;
	tagged?: boolean;
	hasDocumentStructure?: boolean;
	hasBookmarks?: boolean;
	hasAccessibilityAPI?: boolean;
}

interface MetadataAnalysis {
	current: MetadataInfo;
	missing: string[];
	inadequate: string[];
	recommendations: {
		title?: string;
		author?: string;
		subject?: string;
		keywords?: string[];
		language?: string;
	};
}

export class MetadataEnhancerTool implements AccessibilityToolInterface {
	getName(): string {
		return 'metadata_enhancer';
	}

	getDescription(): string {
		return 'Analyzes and enhances PDF metadata for improved accessibility and discoverability';
	}

	getSupportedWCAGCriteria(): string[] {
		return [
			'1.3.1', // Info and Relationships (Level A)
			'3.1.1', // Language of Page (Level A)
			'3.1.2', // Language of Parts (Level AA)
		];
	}

	canProcess(_context: PdfAnalysisContext): boolean {
		// Can process any PDF document
		return true;
	}

	async execute(context: PdfAnalysisContext, llmProvider?: any): Promise<ToolExecutionResult> {
		const startTime = Date.now();
		const issues: AccessibilityIssue[] = [];
		const fixes: AccessibilityFix[] = [];

		try {
			// Analyze current metadata
			const metadataAnalysis = await this.analyzeMetadata(context);
			
			// Identify metadata issues
			const metadataIssues = this.identifyMetadataIssues(metadataAnalysis, context);
			issues.push(...metadataIssues);

			// Generate enhanced metadata if LLM provider is available
			if (llmProvider && issues.length > 0) {
				const metadataFixes = await this.generateMetadataEnhancements(metadataAnalysis, context, llmProvider);
				fixes.push(...metadataFixes);
			}

			return {
				toolName: this.getName(),
				success: true,
				issuesFound: issues,
				fixesApplied: fixes,
				processing_time_ms: Date.now() - startTime,
			};

		} catch (error) {
			return {
				toolName: this.getName(),
				success: false,
				issuesFound: issues,
				fixesApplied: fixes,
				processing_time_ms: Date.now() - startTime,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	private async analyzeMetadata(context: PdfAnalysisContext): Promise<MetadataAnalysis> {
		// Extract current metadata (mock implementation - would use pdf-lib in real scenario)
		const current = this.extractCurrentMetadata(context);
		
		// Determine missing and inadequate metadata
		const missing = this.findMissingMetadata(current);
		const inadequate = this.findInadequateMetadata(current);
		
		// Generate recommendations based on content analysis
		const recommendations = this.generateMetadataRecommendations(context);

		return {
			current,
			missing,
			inadequate,
			recommendations,
		};
	}

	private extractCurrentMetadata(context: PdfAnalysisContext): MetadataInfo {
		// Mock implementation - in real scenario, would extract from PDF buffer
		// For now, assume minimal metadata based on filename
		const fileName = context.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
		
		return {
			title: fileName.length > 5 ? fileName : undefined,
			language: context.language,
			tagged: false, // Would need PDF structure analysis
			hasDocumentStructure: false,
			hasBookmarks: false,
			hasAccessibilityAPI: false,
			creator: 'Unknown',
			producer: 'Unknown',
		};
	}

	private findMissingMetadata(metadata: MetadataInfo): string[] {
		const missing: string[] = [];
		const requiredFields = ['title', 'author', 'subject', 'language'];
		
		requiredFields.forEach(field => {
			if (!metadata[field as keyof MetadataInfo]) {
				missing.push(field);
			}
		});

		if (!metadata.keywords) missing.push('keywords');
		if (!metadata.tagged) missing.push('accessibility_tags');
		
		return missing;
	}

	private findInadequateMetadata(metadata: MetadataInfo): string[] {
		const inadequate: string[] = [];
		
		// Check title quality
		if (metadata.title) {
			if (metadata.title.length < 5 || 
				metadata.title.toLowerCase().includes('untitled') ||
				metadata.title.toLowerCase().includes('document')) {
				inadequate.push('title');
			}
		}

		// Check subject quality
		if (metadata.subject && metadata.subject.length < 10) {
			inadequate.push('subject');
		}

		// Check keywords quality
		if (metadata.keywords) {
			const keywordCount = metadata.keywords.split(/[,;]/).filter(k => k.trim().length > 0).length;
			if (keywordCount < 3) {
				inadequate.push('keywords');
			}
		}

		return inadequate;
	}

	private generateMetadataRecommendations(context: PdfAnalysisContext): MetadataAnalysis['recommendations'] {
		const textSample = context.textContent.substring(0, 2000);
		const words = textSample.toLowerCase().split(/\s+/);
		
		// Extract potential title from first meaningful line
		const lines = context.textContent.split('\n').filter(line => line.trim().length > 0);
		const potentialTitle = this.extractPotentialTitle(lines);
		
		// Generate keywords from content
		const keywords = this.extractKeywords(words);
		
		// Generate subject from content analysis
		const subject = this.generateSubjectFromContent(textSample);

		return {
			title: potentialTitle,
			subject,
			keywords,
			language: context.language,
		};
	}

	private extractPotentialTitle(lines: string[]): string {
		// Look for title in first few lines
		for (let i = 0; i < Math.min(5, lines.length); i++) {
			const line = lines[i].trim();
			
			// Skip very short lines or lines with only special characters
			if (line.length < 5 || /^[^a-zA-Z]*$/.test(line)) continue;
			
			// Good title candidates
			if (line.length >= 10 && line.length <= 100 && 
				!line.toLowerCase().includes('page') &&
				!line.includes('|') && !line.includes('\t')) {
				return this.cleanTitle(line);
			}
		}
		
		return 'Document Title'; // Fallback
	}

	private cleanTitle(title: string): string {
		// Clean up potential title text
		return title
			.replace(/^\d+\.?\s*/, '') // Remove leading numbers
			.replace(/\s+/g, ' ')      // Normalize whitespace
			.trim()
			.substring(0, 100);        // Limit length
	}

	private extractKeywords(words: string[]): string[] {
		// Extract meaningful keywords from content
		const stopWords = new Set([
			'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
			'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
			'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
			'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
		]);

		// Count word frequency
		const wordCounts = new Map<string, number>();
		words.forEach(word => {
			const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
			if (cleanWord.length > 3 && !stopWords.has(cleanWord) && /^[a-z]+$/.test(cleanWord)) {
				wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
			}
		});

		// Get top keywords
		return Array.from(wordCounts.entries())
			.filter(([_word, count]) => count >= 2) // Must appear at least twice
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8)
			.map(([word]) => word);
	}

	private generateSubjectFromContent(text: string): string {
		const lowerText = text.toLowerCase();
		
		// Detect content type and generate appropriate subject
		if (lowerText.includes('report') || lowerText.includes('analysis')) {
			return 'Analytical report containing data and findings';
		} else if (lowerText.includes('manual') || lowerText.includes('guide') || lowerText.includes('instruction')) {
			return 'Instructional guide and documentation';
		} else if (lowerText.includes('policy') || lowerText.includes('procedure') || lowerText.includes('compliance')) {
			return 'Policy and procedural documentation';
		} else if (lowerText.includes('financial') || lowerText.includes('budget') || lowerText.includes('accounting')) {
			return 'Financial documentation and data';
		} else if (lowerText.includes('research') || lowerText.includes('study') || lowerText.includes('methodology')) {
			return 'Research documentation and findings';
		} else if (lowerText.includes('technical') || lowerText.includes('specification') || lowerText.includes('engineering')) {
			return 'Technical documentation and specifications';
		} else if (lowerText.includes('training') || lowerText.includes('education') || lowerText.includes('learning')) {
			return 'Educational and training materials';
		} else {
			return 'Document containing important information and content';
		}
	}

	private identifyMetadataIssues(analysis: MetadataAnalysis, context: PdfAnalysisContext): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];

		// Missing title
		if (analysis.missing.includes('title')) {
			issues.push({
				type: 'metadata',
				severity: 'high',
				description: 'PDF lacks a proper document title',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Add a descriptive title that clearly identifies the document content',
			});
		}

		// Inadequate title
		if (analysis.inadequate.includes('title')) {
			issues.push({
				type: 'metadata',
				severity: 'medium',
				description: 'PDF title is inadequate or generic',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Improve the title to be more descriptive and meaningful',
			});
		}

		// Missing language
		if (analysis.missing.includes('language')) {
			issues.push({
				type: 'metadata',
				severity: 'high',
				description: 'PDF lacks language specification',
				wcagCriteria: ['3.1.1'],
				suggestion: 'Specify the primary language of the document for accessibility tools',
			});
		}

		// Missing author
		if (analysis.missing.includes('author')) {
			issues.push({
				type: 'metadata',
				severity: 'medium',
				description: 'PDF lacks author information',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Add author information for document identification and credibility',
			});
		}

		// Missing subject/description
		if (analysis.missing.includes('subject')) {
			issues.push({
				type: 'metadata',
				severity: 'medium',
				description: 'PDF lacks subject/description metadata',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Add a subject description that summarizes the document content',
			});
		}

		// Missing keywords
		if (analysis.missing.includes('keywords')) {
			issues.push({
				type: 'metadata',
				severity: 'low',
				description: 'PDF lacks keyword metadata for discoverability',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Add relevant keywords to improve document searchability',
			});
		}

		// Missing accessibility tags
		if (analysis.missing.includes('accessibility_tags')) {
			issues.push({
				type: 'metadata',
				severity: 'high',
				description: 'PDF is not tagged for accessibility',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Enable accessibility tagging to support assistive technologies',
			});
		}

		return issues;
	}

	private async generateMetadataEnhancements(
		analysis: MetadataAnalysis,
		context: PdfAnalysisContext,
		_llmProvider: any
	): Promise<AccessibilityFix[]> {
		const fixes: AccessibilityFix[] = [];

		// Enhanced title
		if (analysis.missing.includes('title') || analysis.inadequate.includes('title')) {
			fixes.push({
				type: 'metadata_title',
				description: 'Generated enhanced document title',
				applied: false,
				wcagImprovement: ['1.3.1'],
				beforeValue: analysis.current.title || 'No title',
				afterValue: analysis.recommendations.title || 'Enhanced Document Title',
			});
		}

		// Enhanced subject
		if (analysis.missing.includes('subject') || analysis.inadequate.includes('subject')) {
			fixes.push({
				type: 'metadata_subject',
				description: 'Generated document subject description',
				applied: false,
				wcagImprovement: ['1.3.1'],
				beforeValue: analysis.current.subject || 'No subject',
				afterValue: analysis.recommendations.subject || 'Document description',
			});
		}

		// Enhanced keywords
		if (analysis.missing.includes('keywords') || analysis.inadequate.includes('keywords')) {
			const keywords = analysis.recommendations.keywords || [];
			fixes.push({
				type: 'metadata_keywords',
				description: `Generated ${keywords.length} relevant keywords`,
				applied: false,
				wcagImprovement: ['1.3.1'],
				beforeValue: analysis.current.keywords || 'No keywords',
				afterValue: keywords.join(', '),
			});
		}

		// Language specification
		if (analysis.missing.includes('language')) {
			fixes.push({
				type: 'metadata_language',
				description: 'Set document language for accessibility',
				applied: false,
				wcagImprovement: ['3.1.1'],
				beforeValue: 'No language specified',
				afterValue: context.language,
			});
		}

		// Accessibility tagging recommendation
		if (analysis.missing.includes('accessibility_tags')) {
			fixes.push({
				type: 'metadata_accessibility',
				description: 'Enable accessibility tagging and structure',
				applied: false,
				wcagImprovement: ['1.3.1'],
				beforeValue: 'Not tagged for accessibility',
				afterValue: 'Accessibility tags enabled with proper document structure',
			});
		}

		return fixes;
	}
}