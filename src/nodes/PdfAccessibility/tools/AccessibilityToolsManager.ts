import { Buffer } from 'buffer';
import { ImageAltTextTool } from './ImageAltTextTool';
import { HeadingStructureTool } from './HeadingStructureTool';
import { TableAccessibilityTool } from './TableAccessibilityTool';
import { LinkTextTool } from './LinkTextTool';
import { MetadataEnhancerTool } from './MetadataEnhancerTool';

export interface AccessibilityIssue {
	type: 'missing_alt_text' | 'heading_structure' | 'table_headers' | 'link_text' | 'metadata' | 'reading_order' | 'color_contrast';
	severity: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	location?: string;
	wcagCriteria: string[];
	suggestion: string;
}

export interface AccessibilityFix {
	type: string;
	description: string;
	applied: boolean;
	wcagImprovement: string[];
	beforeValue?: string;
	afterValue?: string;
}

export interface ToolExecutionResult {
	toolName: string;
	success: boolean;
	issuesFound: AccessibilityIssue[];
	fixesApplied: AccessibilityFix[];
	processing_time_ms: number;
	error?: string;
}

export interface PdfAnalysisContext {
	buffer: Buffer;
	fileName: string;
	pageCount: number;
	textContent: string;
	hasImages: boolean;
	hasTables: boolean;
	hasLinks: boolean;
	language: string;
	wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface AccessibilityToolInterface {
	getName(): string;
	getDescription(): string;
	getSupportedWCAGCriteria(): string[];
	canProcess(context: PdfAnalysisContext): boolean;
	execute(context: PdfAnalysisContext, llmProvider?: any): Promise<ToolExecutionResult>;
}

export class AccessibilityToolsManager {
	private tools: Map<string, AccessibilityToolInterface> = new Map();
	private executionLog: ToolExecutionResult[] = [];

	constructor() {
		this.initializeTools();
	}

	private initializeTools(): void {
		// Initialize and register all accessibility tools
		this.registerTool(new ImageAltTextTool());
		this.registerTool(new HeadingStructureTool());
		this.registerTool(new TableAccessibilityTool());
		this.registerTool(new LinkTextTool());
		this.registerTool(new MetadataEnhancerTool());
		
		console.log(`AccessibilityToolsManager: ${this.tools.size} accessibility tools initialized and ready`);
	}

	registerTool(tool: AccessibilityToolInterface): void {
		this.tools.set(tool.getName(), tool);
	}

	getAvailableTools(): string[] {
		return Array.from(this.tools.keys());
	}

	getToolDescription(toolName: string): string | null {
		const tool = this.tools.get(toolName);
		return tool ? tool.getDescription() : null;
	}

	/**
	 * Analyze PDF and determine which tools should be executed based on content
	 */
	async analyzeAndRecommendTools(context: PdfAnalysisContext): Promise<{
		recommendedTools: string[];
		reasoning: string[];
		estimatedComplexity: 'simple' | 'moderate' | 'complex';
	}> {
		const recommended: string[] = [];
		const reasoning: string[] = [];

		// Check each registered tool to see if it can process this context
		this.tools.forEach((tool, toolName) => {
			if (tool.canProcess(context)) {
				recommended.push(toolName);
				reasoning.push(`${tool.getDescription()}`);
			}
		});

		// Metadata enhancement is always recommended
		if (!recommended.includes('metadata_enhancer')) {
			recommended.push('metadata_enhancer');
			reasoning.push('Metadata enhancement improves document accessibility and discoverability');
		}

		// Heading structure for documents with substantial text
		if (context.textContent.length > 1000 && !recommended.includes('heading_structure')) {
			recommended.push('heading_structure');
			reasoning.push('Substantial text content benefits from heading structure optimization');
		}

		// Determine complexity based on content and WCAG level
		let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
		if (context.wcagLevel === 'AAA' || recommended.length > 5) {
			complexity = 'complex';
		} else if (context.wcagLevel === 'AA' || recommended.length > 3) {
			complexity = 'moderate';
		}

		return {
			recommendedTools: recommended,
			reasoning,
			estimatedComplexity: complexity,
		};
	}

	/**
	 * Execute specific tools in optimized order
	 */
	async executeTools(
		toolNames: string[],
		context: PdfAnalysisContext,
		llmProvider?: any
	): Promise<{
		results: ToolExecutionResult[];
		summary: {
			totalIssues: number;
			totalFixes: number;
			processingTime: number;
			success: boolean;
		};
	}> {
		const results: ToolExecutionResult[] = [];
		const startTime = Date.now();
		let totalIssues = 0;
		let totalFixes = 0;
		let overallSuccess = true;

		// Execute tools in optimal order
		const orderedTools = this.optimizeToolOrder(toolNames);

		for (const toolName of orderedTools) {
			const tool = this.tools.get(toolName);
			if (!tool) {
				results.push({
					toolName,
					success: false,
					issuesFound: [],
					fixesApplied: [],
					processing_time_ms: 0,
					error: `Tool '${toolName}' not found`,
				});
				overallSuccess = false;
				continue;
			}

			// Check if tool can process this context
			if (!tool.canProcess(context)) {
				results.push({
					toolName,
					success: false,
					issuesFound: [],
					fixesApplied: [],
					processing_time_ms: 0,
					error: `Tool '${toolName}' cannot process this document type`,
				});
				continue;
			}

			try {
				const result = await tool.execute(context, llmProvider);
				results.push(result);
				totalIssues += result.issuesFound.length;
				totalFixes += result.fixesApplied.length;
				
				if (!result.success) {
					overallSuccess = false;
				}
			} catch (error) {
				const errorResult: ToolExecutionResult = {
					toolName,
					success: false,
					issuesFound: [],
					fixesApplied: [],
					processing_time_ms: 0,
					error: error instanceof Error ? error.message : String(error),
				};
				results.push(errorResult);
				overallSuccess = false;
			}
		}

		// Store execution log
		this.executionLog.push(...results);

		return {
			results,
			summary: {
				totalIssues,
				totalFixes,
				processingTime: Date.now() - startTime,
				success: overallSuccess,
			},
		};
	}

	/**
	 * Optimize tool execution order for best results
	 */
	private optimizeToolOrder(toolNames: string[]): string[] {
		// Define optimal execution order
		const orderPriority: Record<string, number> = {
			'metadata_enhancer': 1,     // Core document properties
			'heading_structure': 2,     // Document hierarchy
			'image_alttext': 3,         // Content descriptions
			'table_accessibility': 4,   // Tabular data
			'link_text': 5,            // Navigation elements
		};

		return toolNames.sort((a, b) => {
			const priorityA = orderPriority[a] || 999;
			const priorityB = orderPriority[b] || 999;
			return priorityA - priorityB;
		});
	}

	/**
	 * Get execution statistics
	 */
	getExecutionStats(): {
		totalExecutions: number;
		successRate: number;
		averageProcessingTime: number;
		mostUsedTools: string[];
	} {
		if (this.executionLog.length === 0) {
			return {
				totalExecutions: 0,
				successRate: 0,
				averageProcessingTime: 0,
				mostUsedTools: [],
			};
		}

		const successful = this.executionLog.filter(result => result.success).length;
		const successRate = (successful / this.executionLog.length) * 100;
		const averageTime = this.executionLog.reduce((sum, result) => 
			sum + result.processing_time_ms, 0) / this.executionLog.length;

		// Count tool usage
		const toolUsage = new Map<string, number>();
		this.executionLog.forEach(result => {
			const count = toolUsage.get(result.toolName) || 0;
			toolUsage.set(result.toolName, count + 1);
		});

		const mostUsedTools = Array.from(toolUsage.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([toolName]) => toolName);

		return {
			totalExecutions: this.executionLog.length,
			successRate,
			averageProcessingTime: averageTime,
			mostUsedTools,
		};
	}

	/**
	 * Generate comprehensive accessibility report
	 */
	generateAccessibilityReport(results: ToolExecutionResult[], wcagLevel: string): {
		summary: string;
		detailedFindings: any;
		complianceScore: number;
		recommendations: string[];
	} {
		const allIssues = results.flatMap(result => result.issuesFound);
		const allFixes = results.flatMap(result => result.fixesApplied);

		// Calculate compliance score based on issues resolved
		const criticalIssues = allIssues.filter(issue => issue.severity === 'critical').length;
		const highIssues = allIssues.filter(issue => issue.severity === 'high').length;
		const mediumIssues = allIssues.filter(issue => issue.severity === 'medium').length;
		const lowIssues = allIssues.filter(issue => issue.severity === 'low').length;

		const appliedFixes = allFixes.filter(fix => fix.applied).length;
		const totalIssues = allIssues.length;

		// Weighted scoring: critical = 4 points, high = 3, medium = 2, low = 1
		const maxScore = (criticalIssues * 4) + (highIssues * 3) + (mediumIssues * 2) + lowIssues;
		const achievedScore = Math.max(0, maxScore - (criticalIssues * 4) - (highIssues * 3) - (mediumIssues * 2) - lowIssues + (appliedFixes * 2));
		const complianceScore = maxScore > 0 ? Math.round((achievedScore / maxScore) * 100) : 100;

		const recommendations = [
			`${totalIssues} accessibility issues identified across ${results.length} analysis tools`,
			`${appliedFixes} improvements successfully applied`,
			`Target WCAG ${wcagLevel} compliance level`,
			criticalIssues > 0 ? `${criticalIssues} critical issues require immediate attention` : null,
			highIssues > 0 ? `${highIssues} high-priority issues should be addressed soon` : null,
		].filter(Boolean) as string[];

		return {
			summary: `Accessibility analysis complete. Compliance score: ${complianceScore}% for WCAG ${wcagLevel}`,
			detailedFindings: {
				issuesByType: this.groupIssuesByType(allIssues),
				fixesBySeverity: this.groupFixesBySeverity(allFixes),
				toolPerformance: results.map(r => ({
					tool: r.toolName,
					success: r.success,
					issuesFound: r.issuesFound.length,
					fixesApplied: r.fixesApplied.length,
					processingTime: r.processing_time_ms,
				})),
			},
			complianceScore,
			recommendations,
		};
	}

	private groupIssuesByType(issues: AccessibilityIssue[]): Record<string, number> {
		const grouped: Record<string, number> = {};
		issues.forEach(issue => {
			grouped[issue.type] = (grouped[issue.type] || 0) + 1;
		});
		return grouped;
	}

	private groupFixesBySeverity(fixes: AccessibilityFix[]): Record<string, number> {
		const grouped: Record<string, number> = {
			applied: fixes.filter(f => f.applied).length,
			pending: fixes.filter(f => !f.applied).length,
		};
		return grouped;
	}
}