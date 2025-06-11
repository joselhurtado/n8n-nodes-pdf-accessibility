import { AccessibilityReport, AccessibilityAnalysis, PdfValidationResult } from '../interfaces';
import { PdfUtils } from '../utils/pdfUtils';

export class ReportFormatter {
	/**
	 * Generates a comprehensive HTML report
	 */
	static generateHtmlReport(report: AccessibilityReport): string {
		const { documentInfo, analysis, validation, remediation } = report;

		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Accessibility Report - ${documentInfo.originalFileName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 15px 0;
            font-size: 2.2em;
            font-weight: 300;
        }
        .score-badge {
            display: inline-block;
            background: ${this.getScoreColor(report.complianceScore)};
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.3em;
            margin-top: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #e9ecef;
            transition: transform 0.2s ease;
        }
        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .info-card h3 {
            margin: 0 0 10px 0;
            color: #667eea;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .info-card .value {
            font-size: 1.8em;
            font-weight: bold;
            color: #333;
        }
        .section {
            margin: 30px 0;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.4em;
            display: flex;
            align-items: center;
        }
        .section h2::before {
            font-size: 1.3em;
            margin-right: 12px;
        }
        .improvement {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
            transition: background-color 0.2s ease;
        }
        .improvement:hover {
            background: #c3e6cb;
        }
        .improvement::before {
            content: '✅';
            margin-right: 12px;
            font-size: 1.2em;
            flex-shrink: 0;
        }
        .issue {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
        }
        .issue::before {
            content: '⚠️';
            margin-right: 12px;
            font-size: 1.2em;
            flex-shrink: 0;
        }
        .criteria-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
            margin: 20px 0;
        }
        .criteria-item {
            background: #e3f2fd;
            padding: 12px 15px;
            border-radius: 8px;
            font-size: 0.95em;
            border-left: 4px solid #2196F3;
            transition: background-color 0.2s ease;
        }
        .criteria-item:hover {
            background: #bbdefb;
        }
        .validation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .validation-item {
            padding: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .validation-pass {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .validation-fail {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .status-icon {
            font-size: 1.2em;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 25px;
            background: #f1f3f4;
            border-radius: 10px;
            font-size: 0.9em;
            color: #666;
            border: 1px solid #e0e0e0;
        }
        .footer strong {
            color: #333;
        }
        @media (max-width: 768px) {
            .info-grid, .criteria-list, .validation-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 1.8em;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 PDF Accessibility Report</h1>
            <p><strong>Document:</strong> ${documentInfo.originalFileName}</p>
            <p><strong>Processed:</strong> ${new Date(documentInfo.processingDate).toLocaleString()}</p>
            <div class="score-badge">Compliance Score: ${report.complianceScore}%</div>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>📄 Page Count</h3>
                <div class="value">${documentInfo.pageCount}</div>
            </div>
            <div class="info-card">
                <h3>📁 Original Size</h3>
                <div class="value">${PdfUtils.formatFileSize(documentInfo.originalSize)}</div>
            </div>
            ${documentInfo.remediatedSize ? `
            <div class="info-card">
                <h3>🔧 Remediated Size</h3>
                <div class="value">${PdfUtils.formatFileSize(documentInfo.remediatedSize)}</div>
            </div>
            ` : ''}
            <div class="info-card">
                <h3>🔧 Improvements</h3>
                <div class="value">${this.countImprovements(analysis)}</div>
            </div>
        </div>

        <div class="section">
            <h2 style="--emoji: '✅';">Validation Results</h2>
            <div class="validation-grid">
                ${this.generateValidationItems(validation)}
            </div>
        </div>

        <div class="section">
            <h2 style="--emoji: '🏗️';">Structural Improvements</h2>
            ${this.generateImprovementList(analysis.structuralChanges)}
        </div>

        <div class="section">
            <h2 style="--emoji: '🖼️';">Image Accessibility</h2>
            ${this.generateImprovementList(analysis.altTextAdded)}
        </div>

        <div class="section">
            <h2 style="--emoji: '📊';">Table Enhancements</h2>
            ${this.generateImprovementList(analysis.tableImprovements)}
        </div>

        <div class="section">
            <h2 style="--emoji: '🔗';">Link Accessibility</h2>
            ${this.generateImprovementList(analysis.linkDescriptions)}
        </div>

        <div class="section">
            <h2 style="--emoji: '📋';">WCAG 2.1 AA Criteria Addressed</h2>
            <div class="criteria-list">
                ${analysis.criteriaAddressed.map(criteria => 
                    `<div class="criteria-item">${criteria}</div>`
                ).join('')}
            </div>
            ${analysis.criteriaAddressed.length === 0 ? 
                '<p><em>No specific WCAG criteria were identified for automated remediation.</em></p>' : ''}
        </div>

        ${analysis.remainingIssues.length > 0 ? `
        <div class="section">
            <h2 style="--emoji: '⚠️';">Remaining Issues</h2>
            ${analysis.remainingIssues.map(issue => 
                `<div class="issue">${issue}</div>`
            ).join('')}
        </div>
        ` : ''}

        ${analysis.recommendations.length > 0 ? `
        <div class="section">
            <h2 style="--emoji: '💡';">Additional Recommendations</h2>
            ${analysis.recommendations.map(rec => 
                `<div class="improvement">${rec}</div>`
            ).join('')}
        </div>
        ` : ''}

        ${remediation ? `
        <div class="section">
            <h2 style="--emoji: '🔧';">Remediation Summary</h2>
            <div class="improvement">
                Successfully applied ${remediation.improvementsApplied.length} accessibility improvements
            </div>
            <div class="improvement">
                Generated accessible version: ${remediation.remediatedFileName}
            </div>
            <div class="improvement">
                Processing completed at: ${new Date(remediation.processingTimestamp).toLocaleString()}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p><strong>Important Note:</strong> This automated accessibility remediation addresses common WCAG 2.1 AA compliance issues. For complex documents, specialized content, or critical accessibility requirements, manual review by a certified accessibility expert is strongly recommended.</p>
            <p><strong>Limitations:</strong> This service does not process scanned documents, fillable forms, or documents with complex graphics. Color contrast and advanced structure tagging may require manual adjustment.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p>Generated by <strong>N8N PDF Accessibility Service</strong> • Powered by Claude AI</p>
        </div>
    </div>
</body>
</html>`;
	}

	/**
	 * Generates a plain text report
	 */
	static generateTextReport(report: AccessibilityReport): string {
		const { documentInfo, analysis, validation, remediation } = report;

		return `PDF ACCESSIBILITY REMEDIATION REPORT

Document: ${documentInfo.originalFileName}
Processed: ${new Date(documentInfo.processingDate).toLocaleString()}
Compliance Score: ${report.complianceScore}%

DOCUMENT INFORMATION:
- Page Count: ${documentInfo.pageCount}
- Original Size: ${PdfUtils.formatFileSize(documentInfo.originalSize)}
${documentInfo.remediatedSize ? `- Remediated Size: ${PdfUtils.formatFileSize(documentInfo.remediatedSize)}` : ''}
- Total Improvements: ${this.countImprovements(analysis)}

VALIDATION RESULTS:
- File Size: ${validation.validationDetails.fileSize ? 'PASS' : 'FAIL'}
- Page Count: ${validation.validationDetails.pageCount ? 'PASS' : 'FAIL'}
- Readable Text: ${validation.validationDetails.hasReadableText ? 'PASS' : 'FAIL'}
- Not Scanned: ${validation.validationDetails.notScanned ? 'PASS' : 'FAIL'}
- No Forms: ${validation.validationDetails.noForms ? 'PASS' : 'FAIL'}
- Roman Characters: ${validation.validationDetails.romanCharsOnly ? 'PASS' : 'FAIL'}

IMPROVEMENTS APPLIED:

Structural Changes:
${analysis.structuralChanges.map(change => `• ${change}`).join('\n')}

Image Accessibility:
${analysis.altTextAdded.map(alt => `• ${alt}`).join('\n')}

Table Enhancements:
${analysis.tableImprovements.map(table => `• ${table}`).join('\n')}

Link Accessibility:
${analysis.linkDescriptions.map(link => `• ${link}`).join('\n')}

WCAG 2.1 AA Criteria Addressed:
${analysis.criteriaAddressed.map(criteria => `• ${criteria}`).join('\n')}

${analysis.remainingIssues.length > 0 ? `
REMAINING ISSUES:
${analysis.remainingIssues.map(issue => `• ${issue}`).join('\n')}
` : ''}

${analysis.recommendations.length > 0 ? `
ADDITIONAL RECOMMENDATIONS:
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}
` : ''}

${remediation ? `
REMEDIATION SUMMARY:
- Status: ${remediation.success ? 'SUCCESS' : 'FAILED'}
- Generated File: ${remediation.remediatedFileName}
- Processing Time: ${new Date(remediation.processingTimestamp).toLocaleString()}
- Improvements Applied: ${remediation.improvementsApplied.length}
` : ''}

---
IMPORTANT NOTES:
• This automated process addresses common accessibility issues
• Manual review by accessibility experts recommended for critical documents
• Scanned documents, forms, and complex graphics require specialized handling
• Color contrast and advanced tagging may need manual verification

Generated by N8N PDF Accessibility Service
Powered by Claude AI`;
	}

	/**
	 * Helper methods
	 */
	private static getScoreColor(score: number): string {
		if (score >= 90) return '#28a745'; // Green
		if (score >= 75) return '#ffc107'; // Yellow
		if (score >= 60) return '#fd7e14'; // Orange
		return '#dc3545'; // Red
	}

	private static countImprovements(analysis: AccessibilityAnalysis): number {
		return [
			...analysis.structuralChanges,
			...analysis.altTextAdded,
			...analysis.tableImprovements,
			...analysis.linkDescriptions,
		].length;
	}

	private static generateValidationItems(validation: PdfValidationResult): string {
		const items = [
			{ label: 'File Size', passed: validation.validationDetails.fileSize },
			{ label: 'Page Count', passed: validation.validationDetails.pageCount },
			{ label: 'Readable Text', passed: validation.validationDetails.hasReadableText },
			{ label: 'Not Scanned', passed: validation.validationDetails.notScanned },
			{ label: 'No Forms', passed: validation.validationDetails.noForms },
			{ label: 'Roman Characters', passed: validation.validationDetails.romanCharsOnly },
		];

		return items.map(item => 
			`<div class="validation-item ${item.passed ? 'validation-pass' : 'validation-fail'}">
				<span>${item.label}</span>
				<span class="status-icon">${item.passed ? '✅' : '❌'}</span>
			</div>`
		).join('');
	}

	private static generateImprovementList(improvements: string[]): string {
		if (improvements.length === 0) {
			return '<p><em>No improvements were needed in this category.</em></p>';
		}
		return improvements.map(improvement => 
			`<div class="improvement">${improvement}</div>`
		).join('');
	}
}