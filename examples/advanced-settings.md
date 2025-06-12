# Advanced Configuration Guide

This guide covers advanced configuration options for the PDF Accessibility Enhanced node.

## 🎯 **Processing Modes**

### Intelligent Auto-Processing
Best for: Complete automation with AI-driven tool selection
```javascript
{
  "mode": "auto",
  "wcagLevel": "AA",
  "llmProvider": "auto",
  "advancedSettings": {
    "depth": "full",
    "outputFormat": ["pdf", "report", "summary"]
  }
}
```

### Analysis Only
Best for: Understanding accessibility issues without making changes
```javascript
{
  "mode": "analyze",
  "wcagLevel": "AAA",
  "advancedSettings": {
    "depth": "deep",
    "debug": true,
    "showCostEstimate": true
  }
}
```

### Remediation Only
Best for: Applying improvements to pre-analyzed documents
```javascript
{
  "mode": "remediate",
  "wcagLevel": "AA",
  "advancedSettings": {
    "depth": "full",
    "outputFormat": ["pdf", "log"]
  }
}
```

### Custom Workflow
Best for: Specific tool selection and targeted improvements
```javascript
{
  "mode": "custom",
  "customOperations": [
    "alttext",      // Image alt-text generation
    "headings",     // Heading structure optimization
    "tables",       // Table accessibility enhancement
    "links",        // Link text improvement
    "metadata",     // PDF metadata optimization
    "readingorder", // Reading order optimization
    "contrast"      // Color contrast validation
  ],
  "wcagLevel": "AA"
}
```

---

## ⚙️ **Advanced Settings Collection**

### Processing Depth Options
Controls the thoroughness of accessibility analysis and remediation:

#### Quick Fixes
```javascript
{
  "advancedSettings": {
    "depth": "basic"
  }
}
```
- **Use when**: Fast processing is priority
- **Time**: 30-60 seconds
- **Coverage**: Essential accessibility improvements only
- **Best for**: Basic compliance, large batch processing

#### Comprehensive (Default)
```javascript
{
  "advancedSettings": {
    "depth": "full"
  }
}
```
- **Use when**: Balanced speed and thoroughness
- **Time**: 60-180 seconds  
- **Coverage**: Thorough accessibility analysis and remediation
- **Best for**: Most use cases, production workflows

#### Deep Analysis
```javascript
{
  "advancedSettings": {
    "depth": "deep"
  }
}
```
- **Use when**: Maximum accuracy is required
- **Time**: 180-300 seconds
- **Coverage**: Extensive analysis with iterative improvements
- **Best for**: Critical documents, AAA compliance

### Language Configuration
Specify document language for proper WCAG compliance:

```javascript
{
  "advancedSettings": {
    "language": "es"  // Spanish
  }
}
```

**Supported Languages**:
- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `nl` - Dutch
- `pl` - Polish
- `sv` - Swedish
- `da` - Danish
- `no` - Norwegian
- `fi` - Finnish

### Output Format Selection
Choose which outputs to generate:

```javascript
{
  "advancedSettings": {
    "outputFormat": [
      "pdf",      // Enhanced PDF with accessibility improvements
      "report",   // Detailed accessibility analysis report
      "summary",  // WCAG compliance summary with scores
      "log"       // Detailed log of changes made
    ]
  }
}
```

**Format Details**:
- **pdf**: The processed PDF with accessibility improvements applied
- **report**: Comprehensive HTML/JSON audit report for stakeholders
- **summary**: Executive summary with compliance scores and recommendations
- **log**: Technical log of all changes and improvements made

### Debug Mode
Enable detailed logging for troubleshooting:

```javascript
{
  "advancedSettings": {
    "debug": true
  }
}
```

**When to use**:
- Troubleshooting processing failures
- Understanding tool execution flow
- Performance optimization
- Custom workflow development

**Output includes**:
- Detailed tool execution logs
- PDF parsing information
- LLM API call details
- Processing time breakdowns

### Cost Estimation
Preview LLM usage costs before processing:

```javascript
{
  "advancedSettings": {
    "showCostEstimate": true
  }
}
```

**Provides**:
- Estimated token usage per LLM provider
- Cost breakdown by accessibility tool
- Total estimated processing cost
- Recommendations for cost optimization

---

## 🔧 **LLM Provider Configuration**

### Auto-Selection (Recommended)
Let AI choose the optimal provider based on task complexity:

```javascript
{
  "llmProvider": "auto"
}
```

**Selection Logic**:
- **Simple tasks** → Google Gemini (cost-effective)
- **Complex analysis** → Anthropic Claude (detailed reasoning)
- **Creative content** → OpenAI GPT (creative alt-text)

### Provider-Specific Configuration

#### Anthropic Claude
Best for: Detailed accessibility analysis and reasoning
```javascript
{
  "llmProvider": "anthropic",
  "credentials": "anthropicApi"
}
```

#### OpenAI GPT
Best for: Creative content generation (alt-text, descriptions)
```javascript
{
  "llmProvider": "openai", 
  "credentials": "openAIApi"
}
```

#### Google Gemini
Best for: Structured validation and cost-effective processing
```javascript
{
  "llmProvider": "google",
  "credentials": "googleApi"
}
```

---

## 🎯 **Input Method Configuration**

### Binary Data (Most Common)
For PDFs from previous nodes (HTTP Request, Google Drive, etc.):

```javascript
{
  "inputMethod": "binary",
  "binaryPropertyName": "data"  // Default property name
}
```

**Auto-detects**:
- Standard Buffer objects
- Google Drive base64 strings
- Serialized Buffer formats
- Raw base64 PDF data

### URL Download
For direct PDF downloads:

```javascript
{
  "inputMethod": "url",
  "url": "https://example.com/document.pdf"
}
```

**Supports**:
- Direct PDF URLs
- Google Drive share links (auto-converts)
- Password-protected URLs (with auth headers)
- Custom headers and authentication

### File Path
For local file system access:

```javascript
{
  "inputMethod": "filepath",
  "filePath": "/path/to/document.pdf"
}
```

**Use cases**:
- Local file processing
- Network mounted drives
- Docker volume access
- Batch processing from directories

### Base64 Data
For API-provided encoded data:

```javascript
{
  "inputMethod": "base64",
  "base64Data": "JVBERi0xLjQKMSAwIG9iago8PAo..."
}
```

---

## 📊 **Performance Optimization**

### For Large PDFs (>10MB)
```javascript
{
  "advancedSettings": {
    "depth": "basic",           // Faster processing
    "outputFormat": ["summary"], // Minimal output
    "debug": false              // Reduce logging overhead
  }
}
```

### For Batch Processing
```javascript
{
  "llmProvider": "google",       // Cost-effective
  "advancedSettings": {
    "depth": "basic",
    "showCostEstimate": false,   // Skip cost calculation
    "outputFormat": ["summary"]  // Minimal output per document
  }
}
```

### For AAA Compliance
```javascript
{
  "wcagLevel": "AAA",
  "advancedSettings": {
    "depth": "deep",             // Thorough analysis
    "outputFormat": ["pdf", "report", "log"],
    "debug": true                // Full audit trail
  }
}
```

---

## 🚨 **Error Handling Configuration**

### Robust Processing
Continue processing even if individual tools fail:

```javascript
{
  "mode": "custom",
  "customOperations": [
    "metadata",     // Always succeeds
    "alttext",      // May fail if no images
    "tables"        // May fail if no tables
  ],
  "advancedSettings": {
    "debug": true   // Capture failure details
  }
}
```

### Fail-Fast Processing
Stop on first error for debugging:

```javascript
{
  "advancedSettings": {
    "debug": true,
    "depth": "basic"  // Reduce complexity for debugging
  }
}
```

---

## 💡 **Best Practices**

### Production Workflows
```javascript
{
  "mode": "auto",
  "wcagLevel": "AA",
  "llmProvider": "auto",
  "advancedSettings": {
    "depth": "full",
    "outputFormat": ["pdf", "report"],
    "debug": false,
    "showCostEstimate": true
  }
}
```

### Development/Testing
```javascript
{
  "mode": "analyze",
  "wcagLevel": "AA", 
  "llmProvider": "auto",
  "advancedSettings": {
    "depth": "basic",
    "debug": true,
    "outputFormat": ["summary"]
  }
}
```

### Critical Documents
```javascript
{
  "mode": "auto",
  "wcagLevel": "AAA",
  "llmProvider": "anthropic",
  "advancedSettings": {
    "depth": "deep",
    "outputFormat": ["pdf", "report", "log"],
    "debug": true
  }
}
```

---

**💡 Remember**: Start with default settings and adjust based on your specific needs. Enable debug mode when troubleshooting and cost estimation for budget planning.