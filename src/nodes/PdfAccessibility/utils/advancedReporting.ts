import { ToolExecutionResult, AccessibilityIssue, AccessibilityFix } from '../tools/AccessibilityToolsManager';

export interface AccessibilityAuditReport {
	executive_summary: {
		document_name: string;
		audit_date: string;
		wcag_level: string;
		overall_score: number;
		total_issues: number;
		total_fixes: number;
		compliance_status: 'compliant' | 'partial' | 'non_compliant';
	};
	document_analysis: {
		file_info: {
			name: string;
			size: number;
			pages: number;
			language: string;
		};
		content_analysis: {
			has_images: boolean;
			has_tables: boolean;
			has_links: boolean;
			text_length: number;
		};
	};
	accessibility_findings: {
		issues_by_severity: {
			critical: AccessibilityIssue[];
			high: AccessibilityIssue[];
			medium: AccessibilityIssue[];
			low: AccessibilityIssue[];
		};
		wcag_compliance: {
			level_a: { total: number; passed: number; failed: number };
			level_aa: { total: number; passed: number; failed: number };
			level_aaa: { total: number; passed: number; failed: number };
		};
	};
	improvements_applied: {
		fixes_by_type: Record<string, AccessibilityFix[]>;
		before_after_comparison: {
			before_score: number;
			after_score: number;
			improvement_percentage: number;
		};
	};
	tool_execution_details: ToolExecutionResult[];
	recommendations: {
		immediate_actions: string[];
		long_term_improvements: string[];
		best_practices: string[];
	};
	export_formats: {
		json: string;
		html: string;
		markdown: string;
		csv: string;
	};
}

export class AdvancedReportingEngine {
	
	/**
	 * Generate comprehensive accessibility audit report
	 */
	static generateAuditReport(
		toolResults: ToolExecutionResult[],
		documentInfo: any,
		wcagLevel: string,
		beforeScore: number,
		afterScore: number
	): AccessibilityAuditReport {
		const allIssues = toolResults.flatMap(result => result.issuesFound);
		const allFixes = toolResults.flatMap(result => result.fixesApplied);

		const issuesBySeverity = this.groupIssuesBySeverity(allIssues);
		const fixesByType = this.groupFixesByType(allFixes);
		const wcagCompliance = this.calculateWCAGCompliance(allIssues, wcagLevel);

		return {
			executive_summary: {
				document_name: documentInfo.fileName,
				audit_date: new Date().toISOString(),
				wcag_level: wcagLevel,
				overall_score: afterScore,
				total_issues: allIssues.length,
				total_fixes: allFixes.filter(fix => fix.applied).length,
				compliance_status: this.determineComplianceStatus(afterScore),
			},
			document_analysis: {
				file_info: {
					name: documentInfo.fileName,
					size: documentInfo.fileSize || 0,
					pages: documentInfo.pageCount || 0,
					language: documentInfo.language || 'unknown',
				},
				content_analysis: {
					has_images: documentInfo.hasImages || false,
					has_tables: documentInfo.hasTables || false,
					has_links: documentInfo.hasLinks || false,
					text_length: documentInfo.textLength || 0,
				},
			},
			accessibility_findings: {
				issues_by_severity: issuesBySeverity,
				wcag_compliance: wcagCompliance,
			},
			improvements_applied: {
				fixes_by_type: fixesByType,
				before_after_comparison: {
					before_score: beforeScore,
					after_score: afterScore,
					improvement_percentage: Math.round(((afterScore - beforeScore) / beforeScore) * 100),
				},
			},
			tool_execution_details: toolResults,
			recommendations: this.generateRecommendations(allIssues, wcagLevel),
			export_formats: this.generateExportFormats(toolResults, documentInfo, wcagLevel),
		};
	}

	/**
	 * Generate visual diff representation of changes
	 */
	static generateVisualDiff(beforeData: any, _afterData: any): {
		summary: string;
		changes: Array<{
			category: string;
			before: string;
			after: string;
			improvement_type: string;
		}>;
		metrics: {
			total_changes: number;
			accessibility_improvements: number;
			wcag_criteria_addressed: string[];
		};
	} {
		const changes: Array<{
			category: string;
			before: string;
			after: string;
			improvement_type: string;
		}> = [];

		// Mock implementation showing the structure for visual diff
		if (beforeData.hasImages && !beforeData.altTextPresent) {
			changes.push({
				category: 'Images',
				before: 'No alt-text provided',
				after: 'Descriptive alt-text added for all images',
				improvement_type: 'WCAG 1.1.1 Non-text Content',
			});
		}

		if (beforeData.hasTables && !beforeData.tableHeaders) {
			changes.push({
				category: 'Tables',
				before: 'Tables lack proper headers',
				after: 'Table headers and captions added',
				improvement_type: 'WCAG 1.3.1 Info and Relationships',
			});
		}

		const wcagCriteria = [...new Set(changes.map(change => change.improvement_type))];

		return {
			summary: `${changes.length} accessibility improvements implemented`,
			changes,
			metrics: {
				total_changes: changes.length,
				accessibility_improvements: changes.length,
				wcag_criteria_addressed: wcagCriteria,
			},
		};
	}

	/**
	 * Export report in multiple formats
	 */
	static exportReport(report: AccessibilityAuditReport, format: 'json' | 'html' | 'markdown' | 'csv'): string {
		switch (format) {
			case 'json':
				return JSON.stringify(report, null, 2);
			case 'html':
				return this.generateHTMLReport(report);
			case 'markdown':
				return this.generateMarkdownReport(report);
			case 'csv':
				return this.generateCSVReport(report);
			default:
				return JSON.stringify(report, null, 2);
		}
	}

	private static groupIssuesBySeverity(issues: AccessibilityIssue[]): {
		critical: AccessibilityIssue[];
		high: AccessibilityIssue[];
		medium: AccessibilityIssue[];
		low: AccessibilityIssue[];
	} {
		return {
			critical: issues.filter(issue => issue.severity === 'critical'),
			high: issues.filter(issue => issue.severity === 'high'),
			medium: issues.filter(issue => issue.severity === 'medium'),
			low: issues.filter(issue => issue.severity === 'low'),
		};
	}

	private static groupFixesByType(fixes: AccessibilityFix[]): Record<string, AccessibilityFix[]> {
		const grouped: Record<string, AccessibilityFix[]> = {};
		fixes.forEach(fix => {
			if (!grouped[fix.type]) {
				grouped[fix.type] = [];
			}
			grouped[fix.type].push(fix);
		});
		return grouped;
	}

	private static calculateWCAGCompliance(issues: AccessibilityIssue[], _wcagLevel: string): {
		level_a: { total: number; passed: number; failed: number };
		level_aa: { total: number; passed: number; failed: number };
		level_aaa: { total: number; passed: number; failed: number };
	} {
		// Mock implementation - would need real WCAG criteria mapping
		const levelACriteria = ['1.1.1', '1.3.1', '2.4.1', '2.4.4', '3.1.1'];
		const levelAACriteria = ['2.4.6', '3.1.2', '3.2.4'];
		const levelAAACriteria = ['2.4.9', '2.4.10'];

		const failedCriteria = new Set(issues.flatMap(issue => issue.wcagCriteria));

		return {
			level_a: {
				total: levelACriteria.length,
				failed: levelACriteria.filter(criteria => failedCriteria.has(criteria)).length,
				passed: levelACriteria.length - levelACriteria.filter(criteria => failedCriteria.has(criteria)).length,
			},
			level_aa: {
				total: levelAACriteria.length,
				failed: levelAACriteria.filter(criteria => failedCriteria.has(criteria)).length,
				passed: levelAACriteria.length - levelAACriteria.filter(criteria => failedCriteria.has(criteria)).length,
			},
			level_aaa: {
				total: levelAAACriteria.length,
				failed: levelAAACriteria.filter(criteria => failedCriteria.has(criteria)).length,
				passed: levelAAACriteria.length - levelAAACriteria.filter(criteria => failedCriteria.has(criteria)).length,
			},
		};
	}

	private static determineComplianceStatus(score: number): 'compliant' | 'partial' | 'non_compliant' {
		if (score >= 90) return 'compliant';
		if (score >= 70) return 'partial';
		return 'non_compliant';
	}

	private static generateRecommendations(issues: AccessibilityIssue[], wcagLevel: string): {
		immediate_actions: string[];
		long_term_improvements: string[];
		best_practices: string[];
	} {
		const critical = issues.filter(issue => issue.severity === 'critical');
		const high = issues.filter(issue => issue.severity === 'high');

		return {
			immediate_actions: [
				...critical.map(issue => issue.suggestion),
				...high.slice(0, 3).map(issue => issue.suggestion),
			],
			long_term_improvements: [
				'Implement accessibility testing in development workflow',
				'Train content creators on WCAG guidelines',
				'Regular accessibility audits for all documents',
			],
			best_practices: [
				'Use semantic HTML structure in source documents',
				'Provide meaningful alt-text for all images',
				'Ensure proper heading hierarchy',
				'Test with screen readers and assistive technologies',
				`Maintain ${wcagLevel} compliance standards across all documents`,
			],
		};
	}

	private static generateExportFormats(_toolResults: ToolExecutionResult[], _documentInfo: any, _wcagLevel: string): {
		json: string;
		html: string;
		markdown: string;
		csv: string;
	} {
		// Simplified export format generation
		return {
			json: 'Full JSON report available for API integration',
			html: 'Professional HTML report suitable for stakeholder presentation',
			markdown: 'Markdown format for documentation and version control',
			csv: 'CSV format for data analysis and tracking',
		};
	}

	private static generateHTMLReport(report: AccessibilityAuditReport): string {
		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PDF Accessibility Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .score { font-size: 2em; color: ${report.executive_summary.overall_score >= 80 ? '#28a745' : '#dc3545'}; }
        .section { margin: 20px 0; }
        .issue { background: #fff3cd; padding: 10px; margin: 5px 0; border-left: 4px solid #ffc107; }
        .fix { background: #d4edda; padding: 10px; margin: 5px 0; border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PDF Accessibility Audit Report</h1>
        <p><strong>Document:</strong> ${report.executive_summary.document_name}</p>
        <p><strong>WCAG Level:</strong> ${report.executive_summary.wcag_level}</p>
        <p><strong>Overall Score:</strong> <span class="score">${report.executive_summary.overall_score}%</span></p>
        <p><strong>Compliance Status:</strong> ${report.executive_summary.compliance_status}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <ul>
            <li>Total Issues Found: ${report.executive_summary.total_issues}</li>
            <li>Total Fixes Applied: ${report.executive_summary.total_fixes}</li>
            <li>Audit Date: ${new Date(report.executive_summary.audit_date).toLocaleDateString()}</li>
        </ul>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <h3>Immediate Actions</h3>
        <ul>
            ${report.recommendations.immediate_actions.map(action => `<li>${action}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
	}

	private static generateMarkdownReport(report: AccessibilityAuditReport): string {
		return `
# PDF Accessibility Audit Report

## Executive Summary

- **Document:** ${report.executive_summary.document_name}
- **WCAG Level:** ${report.executive_summary.wcag_level}
- **Overall Score:** ${report.executive_summary.overall_score}%
- **Compliance Status:** ${report.executive_summary.compliance_status}
- **Total Issues:** ${report.executive_summary.total_issues}
- **Total Fixes:** ${report.executive_summary.total_fixes}

## Document Analysis

- **File Size:** ${report.document_analysis.file_info.size} bytes
- **Pages:** ${report.document_analysis.file_info.pages}
- **Language:** ${report.document_analysis.file_info.language}

## Immediate Actions Required

${report.recommendations.immediate_actions.map(action => `- ${action}`).join('\n')}

## Best Practices

${report.recommendations.best_practices.map(practice => `- ${practice}`).join('\n')}
`;
	}

	private static generateCSVReport(report: AccessibilityAuditReport): string {
		const headers = ['Category', 'Severity', 'Description', 'WCAG Criteria', 'Status'];
		const rows = [headers.join(',')];

		// Add issues
		Object.entries(report.accessibility_findings.issues_by_severity).forEach(([severity, issues]) => {
			issues.forEach(issue => {
				rows.push([
					issue.type,
					severity,
					`"${issue.description}"`,
					issue.wcagCriteria.join(';'),
					'Issue'
				].join(','));
			});
		});

		// Add fixes
		Object.values(report.improvements_applied.fixes_by_type).flat().forEach(fix => {
			rows.push([
				fix.type,
				'N/A',
				`"${fix.description}"`,
				fix.wcagImprovement.join(';'),
				fix.applied ? 'Fixed' : 'Pending'
			].join(','));
		});

		return rows.join('\n');
	}
}