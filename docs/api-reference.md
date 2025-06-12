# API Reference

Complete reference for the PDF Accessibility Enhanced node configuration and output structure.

---

## 📝 **Node Configuration**

### **Processing Mode** (Required)
Controls how the node processes PDF documents.

```typescript
type ProcessingMode = 'auto' | 'analyze' | 'remediate' | 'custom'
```

| Value | Description | Use Case |
|-------|-------------|----------|
| `auto` | AI analyzes and determines optimal workflow automatically | Complete automation, unknown document types |
| `analyze` | Comprehensive accessibility analysis without modification | Understanding issues, audit preparation |
| `remediate` | Apply accessibility improvements with full reporting | Pre-analyzed documents, batch improvements |
| `custom` | User-defined tool selection for specific requirements | Targeted improvements, specific compliance needs |

**Default**: `auto`

---

### **WCAG Compliance Level** (Required)
Target WCAG 2.1 compliance level for accessibility improvements.

```typescript
type WCAGLevel = 'A' | 'AA' | 'AAA'
```

| Level | Description | Criteria Covered |
|-------|-------------|------------------|
| `A` | Minimum accessibility compliance | Essential features only (5 criteria) |
| `AA` | Standard accessibility compliance | Recommended for most documents (8 criteria) |
| `AAA` | Highest accessibility compliance | Comprehensive accessibility (10 criteria) |

**Default**: `AA`

---

### **LLM Provider** (Optional)
Choose or auto-select AI provider for content generation.

```typescript
type LLMProvider = 'auto' | 'anthropic' | 'openai' | 'google'
```

| Provider | Best For | Characteristics |
|----------|----------|-----------------|
| `auto` | Most use cases | AI selects optimal provider based on task complexity |
| `anthropic` | Detailed analysis | Excellent reasoning and detailed accessibility analysis |
| `openai` | Creative content | Great for creative alt-text and content generation |
| `google` | Cost efficiency | Efficient for structured validation and analysis |

**Default**: `auto`

---

### **PDF Input Method** (Required)
How to provide the PDF file to the node.

```typescript
type InputMethod = 'binary' | 'filepath' | 'url' | 'base64'
```

| Method | Description | Configuration |
|--------|-------------|---------------|
| `binary` | From previous nodes (HTTP Request, Google Drive, etc.) | `binaryPropertyName: string` |
| `filepath` | Local file system path | `filePath: string` |
| `url` | Download from URL (including Google Drive) | `url: string` |
| `base64` | Base64 encoded PDF data | `base64Data: string` |

**Default**: `binary`

---

### **Advanced Settings** (Optional)
Collection of advanced configuration options.

```typescript
interface AdvancedSettings {
  depth?: 'basic' | 'full' | 'deep'
  language?: string
  outputFormat?: Array<'pdf' | 'report' | 'summary' | 'log'>
  debug?: boolean
  showCostEstimate?: boolean
}
```

#### Processing Depth
```typescript
type ProcessingDepth = 'basic' | 'full' | 'deep'
```

| Depth | Time | Coverage | Use Case |
|-------|------|----------|----------|
| `basic` | 30-60s | Essential improvements only | Fast processing, batch operations |
| `full` | 60-180s | Thorough analysis and remediation | Most use cases, production workflows |
| `deep` | 180-300s | Extensive analysis with iterations | Critical documents, AAA compliance |

**Default**: `full`

#### Language
```typescript
type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl' | 'pl' | 'sv' | 'da' | 'no' | 'fi'
```

Specify the primary language of the document content for proper WCAG compliance.

**Default**: `en`

#### Output Format
```typescript
type OutputFormat = 'pdf' | 'report' | 'summary' | 'log'
```

| Format | Description | Content |
|--------|-------------|---------|
| `pdf` | Enhanced PDF with accessibility improvements applied | Binary PDF data |
| `report` | Detailed accessibility analysis report | HTML/JSON audit report |
| `summary` | WCAG compliance summary with scores | Executive summary |
| `log` | Detailed log of changes made | Technical implementation log |

**Default**: `['pdf', 'report']`

#### Debug Mode
```typescript
debug: boolean
```

Enable detailed logging for troubleshooting and development.

**Default**: `false`

#### Cost Estimation
```typescript
showCostEstimate: boolean
```

Show estimated LLM costs before processing.

**Default**: `false`

---

### **Custom Operations** (Custom Mode Only)
Array of specific accessibility tools to execute.

```typescript
type CustomOperation = 'structure' | 'alttext' | 'headings' | 'tables' | 'links' | 'metadata' | 'readingorder' | 'contrast'
```

| Operation | Tool | WCAG Coverage |
|-----------|------|---------------|
| `structure` | Document Structure Analysis | 1.3.1, 2.4.1 |
| `alttext` | Image Alt-Text Generation | 1.1.1 |
| `headings` | Heading Optimization | 1.3.1, 2.4.6, 2.4.10 |
| `tables` | Table Accessibility | 1.3.1, 1.3.2 |
| `links` | Link Text Improvement | 2.4.4, 2.4.9 |
| `metadata` | PDF Metadata Enhancement | 3.1.1, 3.1.2 |
| `readingorder` | Reading Order Optimization | 1.3.2 |
| `contrast` | Color Contrast Validation | 1.4.3, 1.4.6 |

**Default**: `['structure', 'metadata']`

---

## 📤 **Output Structure**

### **Intelligent Auto-Processing Output**

```typescript
interface AutoProcessingOutput {
  mode: 'intelligent_auto'
  wcagLevel: WCAGLevel
  documentInfo: DocumentInfo
  workflowPlan: WorkflowPlan
  execution: ExecutionSummary
  accessibilityReport: AccessibilityReport
  auditReport: AuditReport
  visualDiff?: VisualDiff
  exports: ExportFormats
  settings: AdvancedSettings
  timestamp: string
  processingTime: number
  version: string
}
```

#### Document Information
```typescript
interface DocumentInfo {
  fileName: string
  pageCount: number
  fileSize: number
  textLength: number
  hasImages: boolean
  hasTables: boolean
  hasLinks: boolean
  language: string
}
```

#### Workflow Plan
```typescript
interface WorkflowPlan {
  recommendedTools: string[]
  reasoning: string[]
  complexity: 'simple' | 'moderate' | 'complex'
}
```

#### Execution Summary
```typescript
interface ExecutionSummary {
  toolsExecuted: number
  totalIssuesFound: number
  totalFixesApplied: number
  processingTime: number
  success: boolean
}
```

#### Accessibility Report
```typescript
interface AccessibilityReport {
  summary: string
  complianceScore: number
  recommendations: string[]
  detailedFindings: {
    issuesByType: Record<string, number>
    toolPerformance: ToolPerformance[]
  }
}

interface ToolPerformance {
  tool: string
  success: boolean
  issuesFound: number
  fixesApplied: number
  processingTime: number
}
```

#### Audit Report
```typescript
interface AuditReport {
  executive_summary: {
    document_name: string
    audit_date: string
    wcag_level: string
    overall_score: number
    total_issues: number
    total_fixes: number
    compliance_status: 'compliant' | 'partial' | 'non_compliant'
  }
  document_analysis: {
    file_info: DocumentInfo
    content_analysis: {
      has_images: boolean
      has_tables: boolean
      has_links: boolean
      text_length: number
    }
  }
  accessibility_findings: {
    issues_by_severity: {
      critical: AccessibilityIssue[]
      high: AccessibilityIssue[]
      medium: AccessibilityIssue[]
      low: AccessibilityIssue[]
    }
    wcag_compliance: {
      level_a: ComplianceLevel
      level_aa: ComplianceLevel
      level_aaa: ComplianceLevel
    }
  }
  improvements_applied: {
    fixes_by_type: Record<string, AccessibilityFix[]>
    before_after_comparison: {
      before_score: number
      after_score: number
      improvement_percentage: number
    }
  }
  tool_execution_details: ToolExecutionResult[]
  recommendations: {
    immediate_actions: string[]
    long_term_improvements: string[]
    best_practices: string[]
  }
  export_formats: ExportFormats
}

interface ComplianceLevel {
  total: number
  passed: number
  failed: number
}
```

#### Export Formats
```typescript
interface ExportFormats {
  json: string    // Full JSON report for API integration
  html: string    // Professional HTML report for stakeholders
  markdown: string // Markdown format for documentation
  csv: string     // CSV format for data analysis
}
```

---

### **Analysis Only Output**

```typescript
interface AnalysisOutput {
  mode: 'analysis_only'
  wcagLevel: WCAGLevel
  documentInfo: DocumentInfo
  analysis: {
    recommendedTools: string[]
    reasoning: string[]
    estimatedComplexity: 'simple' | 'moderate' | 'complex'
    potentialImprovements: string[]
  }
  compliancePreview: {
    currentEstimate: number
    targetLevel: WCAGLevel
    gapAnalysis: string[]
  }
  settings: AdvancedSettings
  timestamp: string
  processingTime: number
  note: string
}
```

---

### **Tool Execution Results**

```typescript
interface ToolExecutionResult {
  toolName: string
  success: boolean
  issuesFound: AccessibilityIssue[]
  fixesApplied: AccessibilityFix[]
  processing_time_ms: number
  error?: string
}

interface AccessibilityIssue {
  type: 'missing_alt_text' | 'heading_structure' | 'table_headers' | 'link_text' | 'metadata' | 'reading_order' | 'color_contrast'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  wcagCriteria: string[]
  suggestion: string
}

interface AccessibilityFix {
  type: string
  description: string
  applied: boolean
  wcagImprovement: string[]
  beforeValue?: string
  afterValue?: string
}
```

---

## 🔧 **Error Handling**

### Error Output Structure
```typescript
interface ErrorOutput {
  error: string
  mode?: string
  timestamp: string
  debugInfo?: {
    step: string
    details: string
    suggestion: string
  }
}
```

### Common Error Types

#### Input Validation Errors
```typescript
// Binary data missing or invalid
{
  "error": "Invalid PDF input: Binary data not found or corrupted",
  "debugInfo": {
    "step": "input_validation",
    "details": "Expected binary data in property 'data' but found none",
    "suggestion": "Ensure previous node provides PDF data in binary format"
  }
}

// URL access errors
{
  "error": "Failed to download PDF from URL",
  "debugInfo": {
    "step": "url_download", 
    "details": "HTTP 403 Forbidden when accessing PDF URL",
    "suggestion": "Verify URL permissions and authentication"
  }
}
```

#### Processing Errors
```typescript
// LLM provider errors
{
  "error": "LLM provider authentication failed",
  "debugInfo": {
    "step": "llm_authentication",
    "details": "Invalid API key for provider 'anthropic'",
    "suggestion": "Check LLM provider credentials in N8N settings"
  }
}

// Tool execution errors
{
  "error": "Accessibility tool execution failed",
  "debugInfo": {
    "step": "tool_execution",
    "details": "ImageAltTextTool failed: Rate limit exceeded",
    "suggestion": "Reduce processing frequency or upgrade API plan"
  }
}
```

#### Configuration Errors
```typescript
// Invalid mode/settings combination
{
  "error": "Invalid configuration: Custom mode requires customOperations",
  "debugInfo": {
    "step": "configuration_validation",
    "details": "Mode 'custom' specified but customOperations array is empty",
    "suggestion": "Specify at least one operation in customOperations array"
  }
}
```

---

## 📊 **Performance Metrics**

### Processing Time Benchmarks
| Document Type | Pages | Processing Mode | Avg Time | Tools Used |
|---------------|-------|-----------------|----------|------------|
| Simple Text | 1-5 | Auto (Basic) | 30-45s | Metadata, Headings |
| Mixed Content | 5-15 | Auto (Full) | 60-120s | All applicable |
| Image-Heavy | 10-25 | Auto (Deep) | 120-240s | All + iterations |
| Complex Reports | 15-50 | Custom | 90-180s | Selected tools |

### Resource Usage
- **Memory**: 50-200MB per document (varies by size and complexity)
- **CPU**: Moderate during analysis, low during LLM calls
- **Network**: 1-10 API calls per tool (depending on content)

### Cost Estimates (LLM Usage)
| Provider | Simple Doc | Complex Doc | Per 1000 tokens |
|----------|------------|-------------|-----------------|
| Google Gemini | $0.01-0.05 | $0.05-0.15 | $0.001 |
| Anthropic Claude | $0.03-0.08 | $0.08-0.25 | $0.003 |
| OpenAI GPT-4 | $0.05-0.12 | $0.12-0.35 | $0.005 |

---

**💡 Pro Tip**: Use the `showCostEstimate: true` setting to preview costs before processing expensive documents, and consider the `basic` depth setting for cost-sensitive batch operations.