import { 
	AccessibilityToolInterface, 
	PdfAnalysisContext, 
	ToolExecutionResult, 
	AccessibilityIssue, 
	AccessibilityFix 
} from './AccessibilityToolsManager';

interface ImageInfo {
	index: number;
	page: number;
	width: number;
	height: number;
	position: { x: number; y: number };
	contextText?: string;
	existingAltText?: string;
	isPrimaryContent: boolean;
	isDecorative: boolean;
}

export class ImageAltTextTool implements AccessibilityToolInterface {
	getName(): string {
		return 'image_alttext';
	}

	getDescription(): string {
		return 'Generates AI-powered alt-text descriptions for images in PDF documents';
	}

	getSupportedWCAGCriteria(): string[] {
		return [
			'1.1.1', // Non-text Content (Level A)
			'1.4.5', // Images of Text (Level AA)
			'1.4.9', // Images of Text (No Exception) (Level AAA)
		];
	}

	canProcess(context: PdfAnalysisContext): boolean {
		return context.hasImages;
	}

	async execute(context: PdfAnalysisContext, llmProvider?: any): Promise<ToolExecutionResult> {
		const startTime = Date.now();
		const issues: AccessibilityIssue[] = [];
		const fixes: AccessibilityFix[] = [];

		try {
			// Extract image information from PDF
			const images = await this.extractImageInfo(context);
			
			if (images.length === 0) {
				return {
					toolName: this.getName(),
					success: true,
					issuesFound: [],
					fixesApplied: [],
					processing_time_ms: Date.now() - startTime,
				};
			}

			// Analyze each image for accessibility issues
			for (const image of images) {
				const imageIssues = await this.analyzeImage(image, context);
				issues.push(...imageIssues);

				// Generate alt-text if needed and LLM provider is available
				if (llmProvider && this.needsAltText(image)) {
					try {
						const altTextFix = await this.generateAltText(image, context, llmProvider);
						fixes.push(altTextFix);
					} catch (error) {
						// Alt-text generation failed, but continue with other images
						console.warn(`Alt-text generation failed for image ${image.index}:`, error);
					}
				}
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

	private async extractImageInfo(context: PdfAnalysisContext): Promise<ImageInfo[]> {
		// This is a placeholder implementation
		// In a real implementation, you would use pdf-lib or similar to extract actual image data
		const images: ImageInfo[] = [];

		// Simulate image detection based on content analysis
		const imagePatterns = [
			/figure\s*\d+/gi,
			/chart\s*\d+/gi,
			/diagram/gi,
			/illustration/gi,
			/photo/gi,
			/image/gi,
		];

		let imageCount = 0;
		imagePatterns.forEach(pattern => {
			const matches = context.textContent.match(pattern);
			if (matches) {
				imageCount += matches.length;
			}
		});

		// Create mock image info for detected images
		for (let i = 0; i < Math.min(imageCount, 10); i++) {
			images.push({
				index: i,
				page: Math.floor(i / 3) + 1, // Distribute across pages
				width: 400 + Math.random() * 200,
				height: 300 + Math.random() * 150,
				position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 500 },
				contextText: this.extractContextText(context.textContent, i),
				existingAltText: undefined, // Assume no existing alt-text
				isPrimaryContent: Math.random() > 0.3, // 70% are primary content
				isDecorative: Math.random() > 0.8, // 20% are decorative
			});
		}

		return images;
	}

	private extractContextText(fullText: string, imageIndex: number): string {
		// Extract surrounding text for context
		const words = fullText.split(/\s+/);
		const position = Math.floor((imageIndex + 1) * words.length / 10);
		const start = Math.max(0, position - 20);
		const end = Math.min(words.length, position + 20);
		return words.slice(start, end).join(' ');
	}

	private async analyzeImage(image: ImageInfo, _context: PdfAnalysisContext): Promise<AccessibilityIssue[]> {
		const issues: AccessibilityIssue[] = [];

		// Check for missing alt-text
		if (!image.existingAltText && !image.isDecorative) {
			const severity = image.isPrimaryContent ? 'high' : 'medium';
			issues.push({
				type: 'missing_alt_text',
				severity,
				description: `Image ${image.index + 1} on page ${image.page} lacks alt-text description`,
				location: `Page ${image.page}, Position (${Math.round(image.position.x)}, ${Math.round(image.position.y)})`,
				wcagCriteria: ['1.1.1'],
				suggestion: image.isPrimaryContent 
					? 'Add descriptive alt-text explaining the content and purpose of this image'
					: 'Add brief alt-text or mark as decorative if purely aesthetic',
			});
		}

		// Check for potentially decorative images with alt-text
		if (image.existingAltText && image.isDecorative) {
			issues.push({
				type: 'missing_alt_text',
				severity: 'low',
				description: `Image ${image.index + 1} appears decorative but has alt-text`,
				location: `Page ${image.page}`,
				wcagCriteria: ['1.1.1'],
				suggestion: 'Consider marking decorative images with empty alt-text (alt="")',
			});
		}

		// Check for complex images needing longer descriptions
		if (image.isPrimaryContent && this.isComplexImage(image)) {
			issues.push({
				type: 'missing_alt_text',
				severity: 'medium',
				description: `Complex image ${image.index + 1} may need extended description`,
				location: `Page ${image.page}`,
				wcagCriteria: ['1.1.1'],
				suggestion: 'Complex images like charts or diagrams may need detailed descriptions beyond alt-text',
			});
		}

		return issues;
	}

	private isComplexImage(image: ImageInfo): boolean {
		// Heuristics to determine if image is complex
		const area = image.width * image.height;
		const aspectRatio = image.width / image.height;
		
		// Large images or unusual aspect ratios might be charts/diagrams
		return area > 100000 || aspectRatio > 3 || aspectRatio < 0.33;
	}

	private needsAltText(image: ImageInfo): boolean {
		return !image.existingAltText && !image.isDecorative && image.isPrimaryContent;
	}

	private async generateAltText(
		image: ImageInfo, 
		context: PdfAnalysisContext, 
		_llmProvider: any
	): Promise<AccessibilityFix> {
		const _prompt = this.buildAltTextPrompt(image, context);
		
		try {
			// This would use the LLM provider to generate alt-text
			// For now, we'll create a mock implementation
			const altText = await this.mockGenerateAltText(image, context);

			return {
				type: 'alt_text_generation',
				description: `Generated alt-text for image ${image.index + 1}`,
				applied: false, // Would be true if actually applied to PDF
				wcagImprovement: ['1.1.1'],
				beforeValue: image.existingAltText || 'No alt-text',
				afterValue: altText,
			};
		} catch (error) {
			throw new Error(`Failed to generate alt-text: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private buildAltTextPrompt(image: ImageInfo, _context: PdfAnalysisContext): string {
		return `Generate concise, descriptive alt-text for an image in a PDF document.

Context Information:
- Document: ${context.fileName}
- Page: ${image.page} of ${context.pageCount}
- Document Language: ${context.language}
- WCAG Level: ${context.wcagLevel}

Image Details:
- Dimensions: ${Math.round(image.width)}x${Math.round(image.height)} pixels
- Position: Page ${image.page}, coordinates (${Math.round(image.position.x)}, ${Math.round(image.position.y)})
- Primary Content: ${image.isPrimaryContent ? 'Yes' : 'No'}
- Context Text: "${image.contextText}"

Requirements:
1. Create alt-text that describes the image's content and purpose
2. Keep it concise but informative (aim for 125 characters or less)
3. Focus on what's important for understanding the document
4. Consider the surrounding context text
5. Use appropriate language for WCAG ${context.wcagLevel} compliance

Generate only the alt-text, no additional explanation:`;
	}

	private async mockGenerateAltText(image: ImageInfo, _context: PdfAnalysisContext): Promise<string> {
		// Mock implementation - in real use, this would call the LLM
		const contextLower = (image.contextText || '').toLowerCase();
		
		if (contextLower.includes('chart') || contextLower.includes('graph')) {
			return `Chart showing data visualization on page ${image.page}`;
		} else if (contextLower.includes('diagram') || contextLower.includes('flow')) {
			return `Diagram illustrating process or concept described in surrounding text`;
		} else if (contextLower.includes('photo') || contextLower.includes('picture')) {
			return `Photograph related to the content on page ${image.page}`;
		} else if (contextLower.includes('logo') || contextLower.includes('brand')) {
			return `Company or organization logo`;
		} else {
			return `Illustration supporting the content about ${this.extractKeywords(image.contextText || '')}`;
		}
	}

	private extractKeywords(text: string): string {
		// Simple keyword extraction for mock alt-text
		const words = text.toLowerCase().split(/\s+/);
		const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
		
		const keywords = words
			.filter(word => word.length > 3 && !commonWords.has(word))
			.slice(0, 3);
			
		return keywords.length > 0 ? keywords.join(', ') : 'document content';
	}
}