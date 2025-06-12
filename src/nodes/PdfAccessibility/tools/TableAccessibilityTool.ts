import { 
	AccessibilityToolInterface, 
	PdfAnalysisContext, 
	ToolExecutionResult, 
	AccessibilityIssue, 
	AccessibilityFix 
} from './AccessibilityToolsManager';

interface TableInfo {
	index: number;
	page: number;
	rows: number;
	columns: number;
	hasHeaders: boolean;
	hasCaption: boolean;
	caption?: string;
	headers: string[];
	sampleData: string[][];
	isDataTable: boolean;
	isLayoutTable: boolean;
	contextText: string;
}

interface TableAnalysis {
	tables: TableInfo[];
	totalDataTables: number;
	totalLayoutTables: number;
	tablesWithoutHeaders: TableInfo[];
	tablesWithoutCaptions: TableInfo[];
	complexTables: TableInfo[];
}

export class TableAccessibilityTool implements AccessibilityToolInterface {
	getName(): string {
		return 'table_accessibility';
	}

	getDescription(): string {
		return 'Analyzes tables for proper headers, captions, and accessibility structure';
	}

	getSupportedWCAGCriteria(): string[] {
		return [
			'1.3.1', // Info and Relationships (Level A)
			'1.3.2', // Meaningful Sequence (Level A)
			'2.4.6', // Headings and Labels (Level AA)
		];
	}

	canProcess(context: PdfAnalysisContext): boolean {
		return context.hasTables;
	}

	async execute(context: PdfAnalysisContext, llmProvider?: any): Promise<ToolExecutionResult> {
		const startTime = Date.now();
		const issues: AccessibilityIssue[] = [];
		const fixes: AccessibilityFix[] = [];

		try {
			// Analyze table structure
			const tableAnalysis = await this.analyzeTableStructure(context);
			
			if (tableAnalysis.tables.length === 0) {
				return {
					toolName: this.getName(),
					success: true,
					issuesFound: [],
					fixesApplied: [],
					processing_time_ms: Date.now() - startTime,
				};
			}

			// Identify accessibility issues
			const tableIssues = this.identifyTableIssues(tableAnalysis, context);
			issues.push(...tableIssues);

			// Generate fixes if LLM provider is available
			if (llmProvider && issues.length > 0) {
				const tableFixes = await this.generateTableFixes(tableAnalysis, context, llmProvider);
				fixes.push(...tableFixes);
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

	private async analyzeTableStructure(context: PdfAnalysisContext): Promise<TableAnalysis> {
		const tables = this.extractTableInfo(context);
		
		const totalDataTables = tables.filter(t => t.isDataTable).length;
		const totalLayoutTables = tables.filter(t => t.isLayoutTable).length;
		const tablesWithoutHeaders = tables.filter(t => t.isDataTable && !t.hasHeaders);
		const tablesWithoutCaptions = tables.filter(t => t.isDataTable && !t.hasCaption);
		const complexTables = tables.filter(t => this.isComplexTable(t));

		return {
			tables,
			totalDataTables,
			totalLayoutTables,
			tablesWithoutHeaders,
			tablesWithoutCaptions,
			complexTables,
		};
	}

	private extractTableInfo(context: PdfAnalysisContext): TableInfo[] {
		const tables: TableInfo[] = [];
		const text = context.textContent;

		// Look for table patterns in text
		// Note: patterns available for future enhancement
		// const tablePatterns = [
		//     /table\s*\d+/gi,
		//     /\|\s*[^|]+\s*\|/g, // Pipe-separated tables
		//     /\t[^\t]+\t/g,     // Tab-separated tables
		// ];

		let tableCount = 0;
		
		// Detect pipe-separated tables
		const lines = text.split('\n');
		let currentTable: string[] = [];
		let inTable = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			if (this.looksLikeTableRow(line)) {
				if (!inTable) {
					inTable = true;
					currentTable = [];
				}
				currentTable.push(line);
			} else if (inTable && currentTable.length > 1) {
				// End of table found
				const tableInfo = this.parseTableFromLines(currentTable, tableCount, i);
				if (tableInfo) {
					tables.push(tableInfo);
					tableCount++;
				}
				inTable = false;
				currentTable = [];
			} else if (inTable) {
				inTable = false;
				currentTable = [];
			}
		}

		// Check for remaining table
		if (inTable && currentTable.length > 1) {
			const tableInfo = this.parseTableFromLines(currentTable, tableCount, lines.length);
			if (tableInfo) {
				tables.push(tableInfo);
			}
		}

		return tables.slice(0, 10); // Limit to first 10 tables
	}

	private looksLikeTableRow(line: string): boolean {
		// Heuristics for detecting table rows
		const pipeCount = (line.match(/\|/g) || []).length;
		const tabCount = (line.match(/\t/g) || []).length;
		
		return pipeCount >= 2 || tabCount >= 2 || this.hasTableKeywords(line);
	}

	private hasTableKeywords(line: string): boolean {
		const tableKeywords = ['total', 'sum', 'count', 'average', 'percentage', '%', '$'];
		const lowerLine = line.toLowerCase();
		return tableKeywords.some(keyword => lowerLine.includes(keyword));
	}

	private parseTableFromLines(lines: string[], index: number, lineNumber: number): TableInfo | null {
		if (lines.length < 2) return null;

		const separator = lines[0].includes('|') ? '|' : '\t';
		const rows: string[][] = [];

		for (const line of lines) {
			const cells = line.split(separator).map(cell => cell.trim()).filter(cell => cell.length > 0);
			if (cells.length > 1) {
				rows.push(cells);
			}
		}

		if (rows.length < 2) return null;

		const columns = Math.max(...rows.map(row => row.length));
		const firstRow = rows[0];
		const hasHeaders = this.detectTableHeaders(firstRow, rows);
		
		return {
			index,
			page: Math.ceil(lineNumber / 50), // Rough page estimation
			rows: rows.length,
			columns,
			hasHeaders,
			hasCaption: false, // Would need PDF structure analysis
			headers: hasHeaders ? firstRow : [],
			sampleData: rows.slice(hasHeaders ? 1 : 0, 4), // First few data rows
			isDataTable: this.isDataTable(rows),
			isLayoutTable: !this.isDataTable(rows),
			contextText: this.getTableContext(lines),
		};
	}

	private detectTableHeaders(firstRow: string[], allRows: string[][]): boolean {
		// Heuristics for detecting if first row contains headers
		if (firstRow.length === 0) return false;

		// Check if first row has header-like words
		const headerWords = ['name', 'type', 'date', 'value', 'description', 'id', 'category', 'status'];
		const hasHeaderWords = firstRow.some(cell => 
			headerWords.some(word => cell.toLowerCase().includes(word))
		);

		// Check if first row is different from data rows (less numeric)
		const firstRowNumeric = firstRow.filter(cell => /^\d+(\.\d+)?$/.test(cell.trim())).length;
		const dataRowsNumeric = allRows.slice(1, 3).map(row => 
			row.filter(cell => /^\d+(\.\d+)?$/.test(cell.trim())).length
		);
		const avgDataNumeric = dataRowsNumeric.length > 0 ? 
			dataRowsNumeric.reduce((a, b) => a + b, 0) / dataRowsNumeric.length : 0;

		return hasHeaderWords || (firstRowNumeric < avgDataNumeric && avgDataNumeric > 0);
	}

	private isDataTable(rows: string[][]): boolean {
		// Determine if this is a data table vs layout table
		if (rows.length < 2) return false;

		// Check for numeric data
		let numericCells = 0;
		let totalCells = 0;

		for (const row of rows.slice(0, 5)) { // Check first 5 rows
			for (const cell of row) {
				totalCells++;
				if (/^\d+(\.\d+)?%?$/.test(cell.trim()) || /^\$\d+/.test(cell.trim())) {
					numericCells++;
				}
			}
		}

		// If more than 30% of cells are numeric, likely a data table
		return totalCells > 0 && (numericCells / totalCells) > 0.3;
	}

	private isComplexTable(table: TableInfo): boolean {
		// Complex tables have many columns, rows, or nested structure
		return table.columns > 5 || table.rows > 10 || 
			   table.headers.some(header => header.includes('|') || header.includes('\t'));
	}

	private getTableContext(lines: string[]): string {
		return lines.slice(0, 3).join(' ').substring(0, 200);
	}

	private identifyTableIssues(analysis: TableAnalysis, _context: PdfAnalysisContext): AccessibilityIssue[] {
		const issues: AccessibilityIssue[] = [];

		// Tables without headers
		for (const table of analysis.tablesWithoutHeaders) {
			issues.push({
				type: 'table_headers',
				severity: 'high',
				description: `Table ${table.index + 1} on page ${table.page} lacks proper headers`,
				location: `Page ${table.page}`,
				wcagCriteria: ['1.3.1'],
				suggestion: 'Add header row to identify column contents for screen reader users',
			});
		}

		// Tables without captions
		for (const table of analysis.tablesWithoutCaptions) {
			issues.push({
				type: 'table_headers',
				severity: 'medium',
				description: `Table ${table.index + 1} on page ${table.page} lacks descriptive caption`,
				location: `Page ${table.page}`,
				wcagCriteria: ['1.3.1', '2.4.6'],
				suggestion: 'Add caption describing the table\'s purpose and content',
			});
		}

		// Complex tables needing additional structure
		for (const table of analysis.complexTables) {
			issues.push({
				type: 'table_headers',
				severity: 'medium',
				description: `Complex table ${table.index + 1} may need additional accessibility markup`,
				location: `Page ${table.page}`,
				wcagCriteria: ['1.3.1'],
				suggestion: 'Complex tables may need header associations and summary information',
			});
		}

		return issues;
	}

	private async generateTableFixes(
		analysis: TableAnalysis,
		context: PdfAnalysisContext,
		llmProvider: any
	): Promise<AccessibilityFix[]> {
		const fixes: AccessibilityFix[] = [];

		// Generate headers for tables without them
		for (const table of analysis.tablesWithoutHeaders) {
			try {
				const generatedHeaders = await this.generateTableHeaders(table, context, llmProvider);
				fixes.push({
					type: 'table_header_generation',
					description: `Generated headers for table ${table.index + 1}`,
					applied: false,
					wcagImprovement: ['1.3.1'],
					beforeValue: 'No headers',
					afterValue: generatedHeaders.join(' | '),
				});
			} catch (error) {
				console.warn(`Failed to generate headers for table ${table.index + 1}:`, error);
			}
		}

		// Generate captions for tables without them
		for (const table of analysis.tablesWithoutCaptions) {
			try {
				const generatedCaption = await this.generateTableCaption(table, context, llmProvider);
				fixes.push({
					type: 'table_caption_generation',
					description: `Generated caption for table ${table.index + 1}`,
					applied: false,
					wcagImprovement: ['1.3.1', '2.4.6'],
					beforeValue: 'No caption',
					afterValue: generatedCaption,
				});
			} catch (error) {
				console.warn(`Failed to generate caption for table ${table.index + 1}:`, error);
			}
		}

		return fixes;
	}

	private async generateTableHeaders(
		table: TableInfo,
		_context: PdfAnalysisContext,
		_llmProvider: any
	): Promise<string[]> {
		// Mock implementation - would use LLM in real scenario
		const sampleData = table.sampleData[0] || [];
		return sampleData.map((_, index) => {
			if (index === 0) return 'Item';
			if (sampleData.some(cell => /^\d+(\.\d+)?$/.test(cell))) return 'Value';
			if (sampleData.some(cell => cell.includes('%'))) return 'Percentage';
			if (sampleData.some(cell => cell.includes('$'))) return 'Amount';
			return `Column ${index + 1}`;
		});
	}

	private async generateTableCaption(
		table: TableInfo,
		_context: PdfAnalysisContext,
		_llmProvider: any
	): Promise<string> {
		// Mock implementation - would use LLM in real scenario
		const contextWords = table.contextText.toLowerCase();
		
		if (contextWords.includes('financial') || contextWords.includes('budget')) {
			return `Financial data table with ${table.rows} rows and ${table.columns} columns`;
		} else if (contextWords.includes('result') || contextWords.includes('data')) {
			return `Data table showing results with ${table.rows} entries`;
		} else if (contextWords.includes('comparison')) {
			return `Comparison table with ${table.columns} categories`;
		} else {
			return `Table ${table.index + 1}: Data organized in ${table.rows} rows and ${table.columns} columns`;
		}
	}
}