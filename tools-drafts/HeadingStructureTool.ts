import { 
	AccessibilityToolInterface, 
	PdfAnalysisContext, 
	ToolExecutionResult, 
	AccessibilityIssue, 
	AccessibilityFix 
} from './AccessibilityToolsManager';

interface HeadingInfo {
	text: string;
	level: number;
	position: number;
	page: number;
	isProperlyTagged: boolean;
	contextText: string;
	suggestedLevel?: number;
}

interface HeadingStructureAnalysis {
	headings: HeadingInfo[];
	hasLogicalStructure: boolean;
	skippedLevels: number[];
	duplicateHeadings: string[];
	emptyHeadings: HeadingInfo[];
	tooManyH1s: boolean;
}

export class HeadingStructureTool implements AccessibilityToolInterface {
	getName(): string {
		return 'heading_structure';
	}

	getDescription(): string {
		return 'Analyzes and optimizes document heading hierarchy for logical structure and navigation';
	}

	getSupportedWCAGCriteria(): string[] {
		return [
			'1.3.1', // Info and Relationships (Level A)
			'2.4.1', // Bypass Blocks (Level A)
			'2.4.6', // Headings and Labels (Level AA)
			'2.4.10', // Section Headings (Level AAA)
		];
	}

	canProcess(context: PdfAnalysisContext): boolean {
		// Can process any document with substantial text content
		return context.textContent.length > 500;
	}

	async execute(context: PdfAnalysisContext, llmProvider?: any): Promise<ToolExecutionResult> {
		const startTime = Date.now();
		const issues: AccessibilityIssue[] = [];
		const fixes: AccessibilityFix[] = [];

		try {
			// Analyze heading structure
			const structureAnalysis = await this.analyzeHeadingStructure(context);
			
			// Identify issues
			const structureIssues = this.identifyStructureIssues(structureAnalysis, context);
			issues.push(...structureIssues);

			// Generate fixes if LLM provider is available
			if (llmProvider && issues.length > 0) {
				const structureFixes = await this.generateStructureFixes(structureAnalysis, context, llmProvider);
				fixes.push(...structureFixes);
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

	private async analyzeHeadingStructure(context: PdfAnalysisContext): Promise<HeadingStructureAnalysis> {
		const headings = this.extractHeadings(context.textContent);
		
		// Analyze structure
		const hasLogicalStructure = this.hasLogicalHeadingStructure(headings);
		const skippedLevels = this.findSkippedLevels(headings);
		const duplicateHeadings = this.findDuplicateHeadings(headings);
		const emptyHeadings = headings.filter(h => h.text.trim().length === 0);
		const h1Count = headings.filter(h => h.level === 1).length;
		const tooManyH1s = h1Count > 1;

		return {
			headings,
			hasLogicalStructure,
			skippedLevels,
			duplicateHeadings,
			emptyHeadings,
			tooManyH1s,
		};
	}

	private extractHeadings(textContent: string): HeadingInfo[] {
		const headings: HeadingInfo[] = [];
		const lines = textContent.split('\n');
		let position = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.length === 0) continue;

			// Detect potential headings using various heuristics
			const headingLevel = this.detectHeadingLevel(line, lines, i);
			
			if (headingLevel > 0) {
				headings.push({
					text: line,
					level: headingLevel,
					position,
					page: Math.ceil(position / 3000), // Approximate page based on character position
					isProperlyTagged: false, // PDF structure analysis would be needed
					contextText: this.getContextText(lines, i),
				});
			}

			position += line.length;
		}

		return headings;
	}

	private detectHeadingLevel(line: string, lines: string[], index: number): number {
		// Heuristics for detecting heading levels from text
		
		// Look for numbered headings (1., 1.1, Chapter 1, etc.)
		if (/^\d+\.?\s/.test(line) && line.length < 100) {
			const dots = (line.match(/\./g) || []).length;
			return Math.min(dots + 1, 6);
		}

		// Look for chapter/section indicators
		if (/^(chapter|section|part)\s+\d+/i.test(line)) {
			return 1;
		}

		// Look for all caps (potential headings)
		if (line === line.toUpperCase() && line.length > 3 && line.length < 80) {
			return this.estimateHeadingLevelFromContext(line, lines, index);
		}

		// Look for title case with specific patterns
		if (this.isTitleCase(line) && line.length < 100 && !line.endsWith('.')) {
			return this.estimateHeadingLevelFromContext(line, lines, index);
		}

		// Look for lines followed by empty lines (potential headings)
		if (index < lines.length - 1 && lines[index + 1].trim() === '' && line.length < 80) {
			return this.estimateHeadingLevelFromContext(line, lines, index);
		}

		return 0; // Not a heading
	}

	private estimateHeadingLevelFromContext(line: string, lines: string[], index: number): number {
		// Estimate heading level based on position and content
		const linesFromStart = index;
		const totalLines = lines.length;
		const positionRatio = linesFromStart / totalLines;

		// Earlier in document = likely higher level
		if (positionRatio < 0.1) return 1;
		if (positionRatio < 0.3) return 2;
		if (positionRatio < 0.6) return 3;
		return 4;
	}

	private isTitleCase(text: string): boolean {
		const words = text.split(/\s+/);
		if (words.length === 0) return false;

		// Check if most words are capitalized
		const capitalizedWords = words.filter(word => 
			word.length > 0 && word[0] === word[0].toUpperCase()
		);

		return capitalizedWords.length / words.length > 0.7;
	}

	private getContextText(lines: string[], index: number): string {
		const start = Math.max(0, index - 2);
		const end = Math.min(lines.length, index + 3);
		return lines.slice(start, end).join(' ').trim();
	}

	private hasLogicalHeadingStructure(headings: HeadingInfo[]): boolean {
		if (headings.length === 0) return true;

		let currentLevel = 0;
		for (const heading of headings) {
			if (heading.level > currentLevel + 1) {
				return false; // Skipped a level
			}
			currentLevel = heading.level;
		}
		return true;
	}

	private findSkippedLevels(headings: HeadingInfo[]): number[] {
		const skipped: number[] = [];
		let maxLevel = 0;

		for (const heading of headings) {
			if (heading.level > maxLevel + 1) {
				// Found skipped levels
				for (let level = maxLevel + 1; level < heading.level; level++) {
					if (!skipped.includes(level)) {
						skipped.push(level);
					}
				}
			}
			maxLevel = Math.max(maxLevel, heading.level);
		}

		return skipped.sort();
	}

	private findDuplicateHeadings(headings: HeadingInfo[]): string[] {
		const seen = new Set<string>();
		const duplicates = new Set<string>();

		for (const heading of headings) {
			const normalizedText = heading.text.toLowerCase().trim();
			if (seen.has(normalizedText)) {
				duplicates.add(heading.text);
			} else {
				seen.add(normalizedText);
			}
		}

		return Array.from(duplicates);
	}

	private identifyStructureIssues(analysis: HeadingStructureAnalysis, context: PdfAnalysisContext): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];

		// No headings found
		if (analysis.headings.length === 0 && context.textContent.length > 2000) {
			issues.push({
				type: 'heading_structure',
				severity: 'high',
				description: 'Document lacks heading structure for navigation',
				wcagCriteria: ['1.3.1', '2.4.1'],
				suggestion: 'Add headings to create a logical document structure that aids navigation',
			});
		}

		// Multiple H1s
		if (analysis.tooManyH1s) {
			issues.push({
				type: 'heading_structure',
				severity: 'medium',
				description: 'Document has multiple H1 headings',
				wcagCriteria: ['1.3.1'],
				suggestion: 'Use only one H1 heading per document, typically for the main title',
			});
		}

		// Skipped heading levels
		if (analysis.skippedLevels.length > 0) {
			issues.push({
				type: 'heading_structure',
				severity: 'medium',
				description: `Heading structure skips levels: ${analysis.skippedLevels.join(', ')}`,
				wcagCriteria: ['1.3.1'],
				suggestion: 'Use heading levels sequentially (H1, H2, H3...) without skipping levels',
			});
		}

		// Duplicate headings
		if (analysis.duplicateHeadings.length > 0) {
			issues.push({
				type: 'heading_structure',
				severity: 'low',
				description: `Found ${analysis.duplicateHeadings.length} duplicate headings`,
				wcagCriteria: ['2.4.6'],
				suggestion: 'Make headings unique and descriptive to improve navigation clarity',
			});
		}

		// Empty headings
		if (analysis.emptyHeadings.length > 0) {
			issues.push({
				type: 'heading_structure',
				severity: 'high',
				description: `Found ${analysis.emptyHeadings.length} empty headings`,
				wcagCriteria: ['1.3.1', '2.4.6'],
				suggestion: 'Remove empty headings or add meaningful content',
			});
		}

		// Poor heading structure
		if (!analysis.hasLogicalStructure) {
			issues.push({
				type: 'heading_structure',
				severity: 'medium',
				description: 'Document heading structure is not logically organized',
				wcagCriteria: ['1.3.1', '2.4.10'],
				suggestion: 'Reorganize headings to create a logical hierarchy that reflects content structure',
			});
		}

		return issues;
	}

	private async generateStructureFixes(
		analysis: HeadingStructureAnalysis, 
		context: PdfAnalysisContext, 
		llmProvider: any
	): Promise<AccessibilityFix[]> {
		const fixes: AccessibilityFix[] = [];

		// Generate optimized heading structure
		if (!analysis.hasLogicalStructure || analysis.skippedLevels.length > 0) {
			try {
				const optimizedStructure = await this.generateOptimizedStructure(analysis, context, llmProvider);
				fixes.push({
					type: 'heading_structure_optimization',
					description: 'Generated optimized heading structure',
					applied: false,
					wcagImprovement: ['1.3.1', '2.4.1', '2.4.6'],
					beforeValue: `${analysis.headings.length} headings with structural issues`,
					afterValue: optimizedStructure,
				});
			} catch (error) {
				console.warn('Failed to generate optimized heading structure:', error);
			}
		}

		// Generate suggestions for duplicate headings
		if (analysis.duplicateHeadings.length > 0) {
			try {
				const uniqueHeadings = await this.generateUniqueHeadings(analysis.duplicateHeadings, context, llmProvider);
				fixes.push({
					type: 'heading_uniqueness',
					description: `Generated unique alternatives for ${analysis.duplicateHeadings.length} duplicate headings`,
					applied: false,
					wcagImprovement: ['2.4.6'],
					beforeValue: analysis.duplicateHeadings.join(', '),
					afterValue: uniqueHeadings,
				});
			} catch (error) {
				console.warn('Failed to generate unique headings:', error);
			}
		}

		return fixes;
	}

	private async generateOptimizedStructure(
		analysis: HeadingStructureAnalysis,
		context: PdfAnalysisContext,
		_llmProvider: any
	): Promise<string> {
		// Mock implementation - would use LLM in real scenario
		const headingTexts = analysis.headings.map(h => h.text).slice(0, 10);
		
		return `Optimized heading structure:
H1: ${context.fileName.replace(/\.[^/.]+$/, "")} (Main Document Title)
${headingTexts.map((text, index) => {
			const level = Math.min(index + 2, 6);
			return `H${level}: ${text}`;
		}).join('\n')}`;
	}

	private async generateUniqueHeadings(
		duplicates: string[],
		_context: PdfAnalysisContext,
		_llmProvider: any
	): Promise<string> {
		// Mock implementation - would use LLM in real scenario
		return duplicates.map((heading, index) => 
			`"${heading}" → "${heading} (Section ${index + 1})"`
		).join('\n');
	}
}