import { 
	AccessibilityToolInterface, 
	PdfAnalysisContext, 
	ToolExecutionResult, 
	AccessibilityIssue, 
	AccessibilityFix 
} from './AccessibilityToolsManager';

interface LinkInfo {
	text: string;
	url?: string;
	page: number;
	position: number;
	contextText: string;
	isDescriptive: boolean;
	isGeneric: boolean;
	isEmail: boolean;
	isPhone: boolean;
	isExternal: boolean;
	hasTitle: boolean;
	title?: string;
}

interface LinkAnalysis {
	links: LinkInfo[];
	genericLinks: LinkInfo[];
	undescriptiveLinks: LinkInfo[];
	duplicateTexts: string[];
	linksWithoutContext: LinkInfo[];
	externalLinksWithoutWarning: LinkInfo[];
}

export class LinkTextTool implements AccessibilityToolInterface {
	getName(): string {
		return 'link_text';
	}

	getDescription(): string {
		return 'Analyzes and improves link text for meaningful descriptions and accessibility';
	}

	getSupportedWCAGCriteria(): string[] {
		return [
			'2.4.4', // Link Purpose (In Context) (Level A)
			'2.4.9', // Link Purpose (Link Only) (Level AAA)
			'3.2.4', // Consistent Identification (Level AA)
		];
	}

	canProcess(context: PdfAnalysisContext): boolean {
		return context.hasLinks;
	}

	async execute(context: PdfAnalysisContext, llmProvider?: any): Promise<ToolExecutionResult> {
		const startTime = Date.now();
		const issues: AccessibilityIssue[] = [];
		const fixes: AccessibilityFix[] = [];

		try {
			// Analyze link structure
			const linkAnalysis = await this.analyzeLinkStructure(context);
			
			if (linkAnalysis.links.length === 0) {
				return {
					toolName: this.getName(),
					success: true,
					issuesFound: [],
					fixesApplied: [],
					processing_time_ms: Date.now() - startTime,
				};
			}

			// Identify accessibility issues
			const linkIssues = this.identifyLinkIssues(linkAnalysis, context);
			issues.push(...linkIssues);

			// Generate fixes if LLM provider is available
			if (llmProvider && issues.length > 0) {
				const linkFixes = await this.generateLinkFixes(linkAnalysis, context, llmProvider);
				fixes.push(...linkFixes);
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

	private async analyzeLinkStructure(context: PdfAnalysisContext): Promise<LinkAnalysis> {
		const links = this.extractLinkInfo(context);
		
		const genericLinks = links.filter(link => this.isGenericLinkText(link.text));
		const undescriptiveLinks = links.filter(link => !link.isDescriptive);
		const duplicateTexts = this.findDuplicateLinkTexts(links);
		const linksWithoutContext = links.filter(link => link.contextText.trim().length < 20);
		const externalLinksWithoutWarning = links.filter(link => 
			link.isExternal && !this.hasExternalWarning(link)
		);

		return {
			links,
			genericLinks,
			undescriptiveLinks,
			duplicateTexts,
			linksWithoutContext,
			externalLinksWithoutWarning,
		};
	}

	private extractLinkInfo(context: PdfAnalysisContext): LinkInfo[] {
		const links: LinkInfo[] = [];
		const text = context.textContent;

		// Extract different types of links
		const patterns = [
			// URLs
			{
				regex: /https?:\/\/[^\s]+/gi,
				type: 'url'
			},
			// Email addresses
			{
				regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
				type: 'email'
			},
			// Phone numbers
			{
				regex: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/gi,
				type: 'phone'
			},
			// Generic link patterns
			{
				regex: /\b(?:click here|read more|learn more|more info|download|link)\b/gi,
				type: 'generic'
			}
		];

		let position = 0;
		const lines = text.split('\n');
		
		for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
			const line = lines[lineIndex];
			
			for (const pattern of patterns) {
				let match;
				const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
				
				while ((match = regex.exec(line)) !== null) {
					const linkText = match[0];
					const linkInfo: LinkInfo = {
						text: linkText,
						url: pattern.type === 'url' ? linkText : undefined,
						page: Math.ceil(position / 3000),
						position: position + match.index,
						contextText: this.extractLinkContext(lines, lineIndex, match.index),
						isDescriptive: this.isDescriptiveLinkText(linkText),
						isGeneric: this.isGenericLinkText(linkText),
						isEmail: pattern.type === 'email',
						isPhone: pattern.type === 'phone',
						isExternal: pattern.type === 'url' && !this.isInternalLink(linkText),
						hasTitle: false, // Would need PDF structure analysis
					};
					
					links.push(linkInfo);
				}
			}
			
			position += line.length;
		}

		return links.slice(0, 50); // Limit to first 50 links
	}

	private extractLinkContext(lines: string[], lineIndex: number, charIndex: number): string {
		const currentLine = lines[lineIndex];
		const beforeText = currentLine.substring(Math.max(0, charIndex - 50), charIndex);
		const afterText = currentLine.substring(charIndex, Math.min(currentLine.length, charIndex + 100));
		
		// Also include surrounding lines for context
		const prevLine = lineIndex > 0 ? lines[lineIndex - 1].substring(-30) : '';
		const nextLine = lineIndex < lines.length - 1 ? lines[lineIndex + 1].substring(0, 30) : '';
		
		return `${prevLine} ${beforeText} [LINK] ${afterText} ${nextLine}`.trim();
	}

	private isDescriptiveLinkText(text: string): boolean {
		// Check if link text is descriptive enough
		const words = text.trim().split(/\s+/);
		
		// Too short or generic
		if (words.length < 2 || text.length < 4) return false;
		
		// Generic phrases
		const genericPhrases = [
			'click here', 'read more', 'learn more', 'more info', 'info',
			'download', 'link', 'here', 'this', 'more', 'continue'
		];
		
		const lowerText = text.toLowerCase();
		return !genericPhrases.some(phrase => lowerText.includes(phrase));
	}

	private isGenericLinkText(text: string): boolean {
		const genericPhrases = [
			'click here', 'read more', 'learn more', 'more info', 'more information',
			'download', 'link', 'here', 'this link', 'continue', 'next', 'previous'
		];
		
		const lowerText = text.toLowerCase().trim();
		return genericPhrases.includes(lowerText) || 
			   genericPhrases.some(phrase => lowerText === phrase);
	}

	private isInternalLink(url: string): boolean {
		// Simple heuristic - would need actual domain analysis
		return url.includes('#') || url.startsWith('/') || url.includes('localhost');
	}

	private hasExternalWarning(link: LinkInfo): boolean {
		const contextLower = link.contextText.toLowerCase();
		const warningWords = ['external', 'opens in new', 'new window', 'new tab', 'leaves site'];
		return warningWords.some(word => contextLower.includes(word));
	}

	private findDuplicateLinkTexts(links: LinkInfo[]): string[] {
		const textCounts = new Map<string, number>();
		
		links.forEach(link => {
			const normalizedText = link.text.toLowerCase().trim();
			textCounts.set(normalizedText, (textCounts.get(normalizedText) || 0) + 1);
		});
		
		return Array.from(textCounts.entries())
			.filter(([text, count]) => count > 1 && text.length > 3)
			.map(([text]) => text);
	}

	private identifyLinkIssues(analysis: LinkAnalysis, _context: PdfAnalysisContext): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];

		// Generic link text
		if (analysis.genericLinks.length > 0) {
			issues.push({
				type: 'link_text',
				severity: 'high',
				description: `Found ${analysis.genericLinks.length} links with generic text like "click here" or "read more"`,
				wcagCriteria: ['2.4.4', '2.4.9'],
				suggestion: 'Replace generic link text with descriptive text that explains the link destination or purpose',
			});
		}

		// Undescriptive links
		if (analysis.undescriptiveLinks.length > 0) {
			issues.push({
				type: 'link_text',
				severity: 'medium',
				description: `Found ${analysis.undescriptiveLinks.length} links with insufficient descriptive text`,
				wcagCriteria: ['2.4.4'],
				suggestion: 'Improve link text to be more descriptive of the destination or action',
			});
		}

		// Duplicate link texts
		if (analysis.duplicateTexts.length > 0) {
			issues.push({
				type: 'link_text',
				severity: 'medium',
				description: `Found ${analysis.duplicateTexts.length} sets of duplicate link text`,
				wcagCriteria: ['3.2.4'],
				suggestion: 'Ensure identical link text leads to the same destination, or make text unique for different destinations',
			});
		}

		// External links without warning
		if (analysis.externalLinksWithoutWarning.length > 0) {
			issues.push({
				type: 'link_text',
				severity: 'low',
				description: `Found ${analysis.externalLinksWithoutWarning.length} external links without clear indication`,
				wcagCriteria: ['3.2.1'],
				suggestion: 'Indicate external links clearly to inform users they will leave the current context',
			});
		}

		// Links without sufficient context
		if (analysis.linksWithoutContext.length > 0) {
			issues.push({
				type: 'link_text',
				severity: 'medium',
				description: `Found ${analysis.linksWithoutContext.length} links lacking sufficient context`,
				wcagCriteria: ['2.4.4'],
				suggestion: 'Ensure links have sufficient surrounding context or improve the link text itself',
			});
		}

		return issues;
	}

	private async generateLinkFixes(
		analysis: LinkAnalysis,
		context: PdfAnalysisContext,
		llmProvider: any
	): Promise<AccessibilityFix[]> {
		const fixes: AccessibilityFix[] = [];

		// Fix generic links
		for (const link of analysis.genericLinks.slice(0, 10)) { // Limit to first 10
			try {
				const improvedText = await this.generateImprovedLinkText(link, context, llmProvider);
				fixes.push({
					type: 'link_text_improvement',
					description: `Improved generic link text`,
					applied: false,
					wcagImprovement: ['2.4.4', '2.4.9'],
					beforeValue: link.text,
					afterValue: improvedText,
				});
			} catch (error) {
				console.warn(`Failed to improve link text for "${link.text}":`, error);
			}
		}

		// Fix undescriptive links
		for (const link of analysis.undescriptiveLinks.slice(0, 10)) { // Limit to first 10
			if (!analysis.genericLinks.includes(link)) { // Skip if already processed
				try {
					const improvedText = await this.generateImprovedLinkText(link, context, llmProvider);
					fixes.push({
						type: 'link_text_improvement',
						description: `Enhanced link descriptiveness`,
						applied: false,
						wcagImprovement: ['2.4.4'],
						beforeValue: link.text,
						afterValue: improvedText,
					});
				} catch (error) {
					console.warn(`Failed to improve link text for "${link.text}":`, error);
				}
			}
		}

		// Generate suggestions for duplicate link texts
		if (analysis.duplicateTexts.length > 0) {
			fixes.push({
				type: 'link_text_uniqueness',
				description: `Identified ${analysis.duplicateTexts.length} duplicate link texts requiring attention`,
				applied: false,
				wcagImprovement: ['3.2.4'],
				beforeValue: analysis.duplicateTexts.join(', '),
				afterValue: 'Review duplicate link texts to ensure they lead to the same destination or make them unique',
			});
		}

		return fixes;
	}

	private async generateImprovedLinkText(
		link: LinkInfo,
		_context: PdfAnalysisContext,
		_llmProvider: any
	): Promise<string> {
		// Mock implementation - would use LLM in real scenario
		const contextWords = link.contextText.toLowerCase();
		
		// Analyze context to suggest better link text
		if (link.isEmail) {
			return `Email ${link.text}`;
		} else if (link.isPhone) {
			return `Call ${link.text}`;
		} else if (link.url) {
			const domain = this.extractDomain(link.url);
			return `Visit ${domain}`;
		} else if (contextWords.includes('download')) {
			return 'Download document';
		} else if (contextWords.includes('report') || contextWords.includes('study')) {
			return 'View full report';
		} else if (contextWords.includes('contact') || contextWords.includes('support')) {
			return 'Contact support';
		} else if (contextWords.includes('product') || contextWords.includes('service')) {
			return 'Learn about our services';
		} else if (contextWords.includes('policy') || contextWords.includes('terms')) {
			return 'Read privacy policy';
		} else {
			// Extract key words from context for generic improvement
			const keywords = this.extractKeywords(contextWords);
			return keywords.length > 0 ? `Learn more about ${keywords[0]}` : 'Learn more details';
		}
	}

	private extractDomain(url: string): string {
		try {
			const match = url.match(/https?:\/\/([^\/]+)/);
			return match ? match[1] : 'external site';
		} catch {
			return 'external site';
		}
	}

	private extractKeywords(text: string): string[] {
		const words = text.split(/\s+/);
		const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
		
		return words
			.filter(word => word.length > 3 && !stopWords.has(word.toLowerCase()))
			.slice(0, 3);
	}
}