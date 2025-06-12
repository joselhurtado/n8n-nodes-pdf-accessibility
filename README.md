# n8n-nodes-pdf-accessibility

![PDF Accessibility](https://img.shields.io/badge/PDF-Accessibility-blue)
![N8N Community Node](https://img.shields.io/badge/n8n-community--node-ff6d5a)
![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AAA-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-Production%20Ready-success)

**🎯 AI-Powered PDF Accessibility Automation for N8N**

Transform any PDF into a fully accessible, WCAG-compliant document through intelligent automation. This N8N community node provides enterprise-grade accessibility analysis, remediation, and professional audit reporting powered by cutting-edge AI.

## 🚀 Version 2.0.0 - Major Release

**Complete transformation**: From basic analysis tool to comprehensive AI-powered accessibility automation platform.

### ✨ **New in v2.0.0**
- 🤖 **Intelligent Auto-Processing** - AI analyzes content and recommends optimal accessibility improvements
- 🔧 **5 Complete Accessibility Tools** - Image alt-text, heading structure, table accessibility, link text, and metadata enhancement
- 📊 **Advanced Reporting Engine** - Professional audit reports with visual diff and multi-format export
- 🎯 **Enhanced Node Architecture** - Single node with 4 processing modes for maximum flexibility
- 🏗️ **Production-Ready Framework** - Enterprise-grade tool orchestration and error handling

---

## 🌟 **Core Features**

### 🤖 **AI-Powered Accessibility Tools**
| Tool | Purpose | WCAG Coverage |
|------|---------|---------------|
| **Image Alt-Text** | AI-generated descriptive alt-text for images | 1.1.1 Non-text Content |
| **Heading Structure** | Document hierarchy optimization | 1.3.1 Info and Relationships |
| **Table Accessibility** | Header and caption enhancement | 1.3.1 Info and Relationships |
| **Link Text** | Meaningful link description improvement | 2.4.4 Link Purpose |
| **Metadata Enhancer** | Comprehensive PDF metadata optimization | 3.1.1 Language of Page |

### 🎯 **Processing Modes**
1. **🤖 Intelligent Auto-Processing** - AI analyzes and determines optimal workflow automatically
2. **🔍 Analysis Only** - Comprehensive accessibility analysis without modification
3. **🔧 Remediation Only** - Apply accessibility improvements with full reporting
4. **⚙️ Custom Workflow** - User-defined tool selection for specific requirements

### 📊 **Professional Reporting**
- **Compliance Scoring** - Weighted WCAG A/AA/AAA compliance analysis
- **Visual Diff System** - Before/after accessibility improvement comparison
- **Multi-format Export** - JSON, HTML, Markdown, CSV for different use cases
- **Audit Documentation** - Professional reports for stakeholder presentation

---

## 🚀 **Quick Start**

### Installation

#### For N8N Docker Users
```yaml
# docker-compose.yml
environment:
  - N8N_NODES_INCLUDE=n8n-nodes-pdf-accessibility
```

```bash
docker-compose down && docker-compose up -d
```

#### For N8N Local Installation
```bash
npm install n8n-nodes-pdf-accessibility
# Restart N8N after installation
```

### Basic Usage

1. **Add the node** to your N8N workflow
2. **Choose processing mode**:
   - `Intelligent Auto-Processing` for full automation
   - `Analysis Only` to understand accessibility issues
   - `Remediation Only` to apply improvements
   - `Custom Workflow` for specific tool selection
3. **Configure input method** (Binary, URL, File Path, or Base64)
4. **Set WCAG compliance level** (A, AA, or AAA)
5. **Execute** and receive comprehensive accessibility report

---

## 📖 **Detailed Usage**

### Enhanced Node Configuration

#### **Processing Mode Selection**
```javascript
// Intelligent Auto-Processing
{
  "mode": "auto",
  "wcagLevel": "AA",
  "llmProvider": "auto"  // AI selects best provider
}

// Analysis Only
{
  "mode": "analyze", 
  "wcagLevel": "AA",
  "advancedSettings": {
    "depth": "full"  // Quick fixes | Comprehensive | Deep analysis
  }
}

// Custom Workflow
{
  "mode": "custom",
  "customOperations": [
    "alttext",     // Image alt-text generation
    "headings",    // Heading structure optimization
    "tables",      // Table accessibility
    "links",       // Link text improvement
    "metadata"     // PDF metadata enhancement
  ]
}
```

#### **Input Methods**
The node supports flexible PDF input:

1. **📁 Binary Data** - From previous nodes with intelligent format detection
2. **🌐 URL Download** - Direct download from URLs (including Google Drive)
3. **🔗 File Path** - Direct file system access
4. **📄 Base64** - Encoded PDF data

#### **Advanced Settings**
```javascript
{
  "advancedSettings": {
    "depth": "full",              // Processing depth
    "language": "en",             // Document language
    "outputFormat": ["pdf", "report", "summary", "log"],
    "debug": true,                // Enable detailed logging
    "showCostEstimate": true      // Show LLM cost estimates
  }
}
```

### Example Workflows

#### **Complete Accessibility Automation**
```
HTTP Request (PDF Upload) 
  → PDF Accessibility Enhanced (Auto Mode)
  → Email (Audit Report)
```

#### **Google Drive Integration**
```
Google Drive (Download PDF)
  → PDF Accessibility Enhanced (Analysis Mode)
  → Google Sheets (Log Results)
```

#### **URL Processing with Custom Tools**
```
Webhook (PDF URL)
  → PDF Accessibility Enhanced (Custom Mode: Alt-text + Tables)
  → HTTP Response (JSON Report)
```

#### **Batch Processing**
```
Schedule Trigger
  → Read Files (PDF Directory)
  → Split in Batches
  → PDF Accessibility Enhanced (Auto Mode)
  → Save Results to Database
```

---

## 📊 **Output Structure**

### Intelligent Auto-Processing Output
```json
{
  "mode": "intelligent_auto",
  "wcagLevel": "AA",
  "documentInfo": {
    "fileName": "document.pdf",
    "pageCount": 12,
    "fileSize": 1048576,
    "hasImages": true,
    "hasTables": true,
    "hasLinks": true,
    "language": "en"
  },
  "workflowPlan": {
    "recommendedTools": ["image_alttext", "table_accessibility", "metadata_enhancer"],
    "reasoning": ["Document contains images requiring alt-text", "Tables need headers"],
    "complexity": "moderate"
  },
  "execution": {
    "toolsExecuted": 3,
    "totalIssuesFound": 15,
    "totalFixesApplied": 12,
    "processingTime": 8500,
    "success": true
  },
  "accessibilityReport": {
    "summary": "Accessibility analysis complete. Compliance score: 87% for WCAG AA",
    "complianceScore": 87,
    "recommendations": [
      "15 accessibility issues identified across 3 analysis tools",
      "12 improvements successfully applied"
    ],
    "detailedFindings": {
      "issuesByType": {
        "missing_alt_text": 5,
        "table_headers": 3,
        "metadata": 7
      },
      "toolPerformance": [
        {
          "tool": "image_alttext",
          "success": true,
          "issuesFound": 5,
          "fixesApplied": 4,
          "processingTime": 3200
        }
      ]
    }
  },
  "auditReport": {
    "executive_summary": {
      "overall_score": 87,
      "total_issues": 15,
      "total_fixes": 12,
      "compliance_status": "partial"
    },
    "accessibility_findings": {
      "issues_by_severity": {
        "critical": [],
        "high": [/* high priority issues */],
        "medium": [/* medium priority issues */],
        "low": [/* low priority issues */]
      },
      "wcag_compliance": {
        "level_a": { "total": 5, "passed": 5, "failed": 0 },
        "level_aa": { "total": 3, "passed": 2, "failed": 1 },
        "level_aaa": { "total": 2, "passed": 1, "failed": 1 }
      }
    },
    "recommendations": {
      "immediate_actions": [
        "Fix missing table headers for accessibility compliance",
        "Add descriptive alt-text to remaining images"
      ],
      "best_practices": [
        "Use semantic HTML structure in source documents",
        "Maintain AA compliance standards across all documents"
      ]
    }
  },
  "exports": {
    "json": "/* Full JSON report for API integration */",
    "html": "/* Professional HTML report for stakeholders */",
    "markdown": "/* Markdown format for documentation */",
    "csv": "/* CSV format for data analysis */"
  },
  "settings": { /* advanced settings used */ },
  "timestamp": "2024-12-06T23:47:00.000Z",
  "processingTime": 8500,
  "version": "2.0.0"
}
```

### Analysis Only Output
```json
{
  "mode": "analysis_only",
  "documentInfo": {
    "fileName": "document.pdf",
    "pageCount": 12,
    "hasImages": true,
    "hasTables": true,
    "hasLinks": true
  },
  "analysis": {
    "recommendedTools": ["image_alttext", "table_accessibility"],
    "estimatedComplexity": "moderate",
    "potentialImprovements": [
      "Add descriptive alt-text for images",
      "Enhance table headers and captions"
    ]
  },
  "compliancePreview": {
    "currentEstimate": 65,
    "targetLevel": "AA",
    "gapAnalysis": [
      "Images likely lack proper alt-text (WCAG 1.1.1)",
      "Tables may lack proper headers (WCAG 1.3.1)"
    ]
  },
  "wcagLevel": "AA",
  "version": "2.0.0"
}
```

---

## 🔧 **LLM Provider Integration**

### Supported Providers
- **🤖 Auto-Select** - AI chooses optimal provider based on task complexity
- **🔹 Anthropic (Claude)** - Excellent for detailed accessibility analysis
- **🔸 OpenAI (GPT)** - Great for creative content generation  
- **🔻 Google (Gemini)** - Efficient for structured validation tasks

### Provider Configuration
```javascript
// Auto-selection (recommended)
{
  "llmProvider": "auto"
}

// Specific provider
{
  "llmProvider": "anthropic",
  "credentials": "anthropicApi"  // Configure in N8N credentials
}
```

### Cost Estimation
Enable cost estimation to preview LLM usage costs before processing:
```javascript
{
  "advancedSettings": {
    "showCostEstimate": true
  }
}
```

---

## ⚙️ **Advanced Configuration**

### Processing Depth Options
- **Quick Fixes** - Essential accessibility improvements only
- **Comprehensive** - Thorough accessibility analysis and remediation  
- **Deep Analysis** - Extensive analysis with iterative improvements

### Language Support
Supports major languages with proper WCAG compliance:
```javascript
{
  "advancedSettings": {
    "language": "es"  // Spanish, French, German, Italian, Portuguese, etc.
  }
}
```

### Debug Mode
Enable detailed logging for troubleshooting:
```javascript
{
  "advancedSettings": {
    "debug": true
  }
}
```

---

## 📊 **WCAG Compliance Coverage**

### Level A
- ✅ **1.1.1** Non-text Content (Image alt-text)
- ✅ **1.3.1** Info and Relationships (Headings, tables)  
- ✅ **2.4.1** Bypass Blocks (Document structure)
- ✅ **2.4.4** Link Purpose (In Context)
- ✅ **3.1.1** Language of Page (Metadata)

### Level AA  
- ✅ **2.4.6** Headings and Labels
- ✅ **3.1.2** Language of Parts
- ✅ **3.2.4** Consistent Identification

### Level AAA
- ✅ **2.4.9** Link Purpose (Link Only)
- ✅ **2.4.10** Section Headings

---

## 🚨 **Troubleshooting**

### Common Issues

**"Processing failed" or timeout errors**
- Large PDFs may require increased processing time
- Try "Quick Fixes" depth for faster processing
- Ensure LLM provider API is accessible

**"Tool execution failed"**
- Verify LLM provider credentials are configured
- Check API quota and billing status
- Enable debug mode for detailed error information

**"Binary data missing"**
- Ensure previous node provides PDF data in binary format
- For URL method: verify URL points to accessible PDF
- For Google Drive: ensure proper sharing permissions

**Icons not showing**
- Restart N8N completely after installation
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Verify N8N version >= 1.0.0

### Debug Information
Enable debug mode for detailed processing logs:
```javascript
{
  "advancedSettings": {
    "debug": true
  }
}
```

---

## 🔒 **Security & Privacy**

- 🗃️ **No Data Storage** - PDFs processed in memory only
- 🔐 **Secure Credentials** - API keys encrypted by N8N
- 🌐 **HTTPS Only** - Secure communication with LLM providers
- 🗑️ **Auto Cleanup** - Temporary data automatically cleared after processing
- 📋 **Audit Trail** - Complete processing logs for compliance

---

## 🔄 **Migration from v1.x**

### Breaking Changes in v2.0.0
- **Node Structure**: Single enhanced node replaces multiple operation-based workflow
- **Configuration**: New processing modes replace individual operations
- **Output Format**: Comprehensive structured reports replace simple validation output

### Migration Steps
1. **Replace old workflow** with single PDF Accessibility Enhanced node
2. **Configure processing mode** based on previous operations used:
   - Previous "Full Workflow" → "Intelligent Auto-Processing"
   - Previous "Analyze" → "Analysis Only" 
   - Previous "Remediate" → "Remediation Only"
3. **Update output handling** for new structured report format
4. **Review advanced settings** for new configuration options

---

## 🤝 **Contributing**

We welcome contributions! Areas of focus:

### Current Priorities
1. **Performance optimization** for large PDF processing
2. **Additional accessibility tools** (color contrast, reading order)
3. **Enhanced LLM integrations** and cost optimization
4. **Batch processing improvements**

### Development Setup
```bash
git clone https://github.com/joselhurtado/n8n-nodes-pdf-accessibility.git
cd n8n-nodes-pdf-accessibility
npm install
npm run build
npm test
```

### Architecture Overview
- **Enhanced Node** - Main processing orchestrator with 4 modes
- **Accessibility Tools** - Modular tools for specific accessibility improvements
- **Tools Manager** - Orchestration framework with intelligent recommendation
- **Advanced Reporting** - Multi-format audit report generation
- **LLM Integration** - Provider abstraction with auto-selection capability

---

## 📋 **Roadmap**

### Upcoming Features
- 🎨 **Color Contrast Analysis** - Automated color accessibility validation
- 📖 **Reading Order Optimization** - Logical content flow improvement
- 🔄 **Batch Processing** - Multiple PDF processing with progress tracking
- 📱 **Mobile Accessibility** - Touch target and mobile-specific improvements
- 🌐 **Additional Language Support** - Extended language coverage
- ⚡ **Performance Enhancements** - Optimized processing for large documents

---

## 📝 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- [N8N](https://n8n.io/) for the automation platform
- [Anthropic](https://anthropic.com/), [OpenAI](https://openai.com/), [Google](https://ai.google.dev/) for AI capabilities  
- [PDF-lib](https://pdf-lib.js.org/) for PDF manipulation
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) for accessibility standards

---

**🚀 Ready to transform your PDF accessibility workflow?**

[**Get Started →**](#quick-start) | [**View Examples →**](#example-workflows) | [**Report Issues →**](https://github.com/joselhurtado/n8n-nodes-pdf-accessibility/issues)

**Made with ❤️ for digital accessibility | Empowering inclusive document automation**