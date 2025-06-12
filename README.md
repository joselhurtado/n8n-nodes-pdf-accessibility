# n8n-nodes-pdf-accessibility

![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n.io-Workflow%20Automation-FF6D5A.svg) ![npm](https://img.shields.io/npm/v/n8n-nodes-pdf-accessibility) ![npm](https://img.shields.io/npm/dt/n8n-nodes-pdf-accessibility) ![GitHub](https://img.shields.io/github/license/joselhurtado/n8n-nodes-pdf-accessibility)

This is an n8n community node that provides AI-powered PDF accessibility automation. It lets you use WCAG compliance analysis, intelligent remediation, and professional audit reporting in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## 📦 Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes Installation

#### Option 1: n8n Cloud & Desktop App
1. Go to **Settings** → **Community Nodes**
2. Click **Install** and enter: `n8n-nodes-pdf-accessibility`
3. Click **Install** and agree to risks
4. The node will be available after installation

#### Option 2: Self-Hosted n8n
```bash
# Navigate to your n8n installation and install the package
npm install n8n-nodes-pdf-accessibility

# Restart n8n to load the new nodes
```

#### Option 3: Docker
```bash
# Pull docker image with community node pre-installed
docker pull n8nio/n8n

# Or install in existing container
docker exec <container-id> npm install n8n-nodes-pdf-accessibility
docker restart <container-id>
```

## 🚀 Operations

This package provides two powerful nodes:

### PDF Accessibility Enhanced Node
The main node offering intelligent PDF accessibility automation with four processing modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Auto** | AI analyzes content and applies optimal accessibility improvements | Complete automation for unknown documents |
| **Analyze** | Comprehensive accessibility analysis without modification | Understanding issues before improvements |
| **Remediate** | Apply accessibility improvements with detailed reporting | Batch processing of analyzed documents |
| **Custom** | Select specific accessibility tools for targeted improvements | Focused improvements for specific needs |

### PDF Accessibility Node (Legacy)
Simple analysis node for basic WCAG compliance checking.

## 🎯 Node Configuration

### Required Fields

#### Processing Mode
- **Auto**: Complete AI-powered accessibility automation
- **Analyze**: Analysis only without document modification
- **Remediate**: Apply accessibility improvements
- **Custom**: User-defined tool selection

#### WCAG Compliance Level
- **A**: Essential accessibility compliance (5 criteria)
- **AA**: Standard accessibility compliance (recommended)
- **AAA**: Highest accessibility compliance (10 criteria)

#### PDF Input Method
- **Binary Data**: From previous n8n nodes (HTTP Request, Google Drive, etc.)
- **URL**: Download directly from URL (including Google Drive share links)
- **File Path**: Local file system access
- **Base64**: Encoded PDF data from previous nodes

### Optional Configuration

#### LLM Provider
- **Auto**: AI selects optimal provider (recommended)
- **Anthropic (Claude)**: Best for detailed analysis
- **OpenAI (GPT)**: Great for creative content
- **Google (Gemini)**: Cost-effective for structured tasks

#### Advanced Settings
- **Processing Depth**: Basic, Full, or Deep analysis
- **Language**: Primary document language (en, es, fr, de, etc.)
- **Output Format**: PDF, Report, Summary, Log combinations
- **Debug Mode**: Enable detailed logging
- **Cost Estimation**: Preview LLM costs before processing

## 🔧 Credentials

This node supports multiple AI providers. Configure credentials in n8n:

### Anthropic API
```
API Key: Your Anthropic API key
```

### OpenAI API
```
API Key: Your OpenAI API key
```

### Google AI API
```
API Key: Your Google AI Studio API key
```

Credentials are only required when using specific LLM providers. Auto mode will use available credentials intelligently.

## 📊 Usage Examples

### Complete Automation Workflow
```
HTTP Request Node (Upload PDF)
    ↓
PDF Accessibility Enhanced
    ├── Mode: Auto
    ├── WCAG Level: AA
    └── LLM Provider: Auto
    ↓
Send Email (Audit Report)
```

### Google Drive Integration
```
Google Drive Node (Download PDF)
    ↓
PDF Accessibility Enhanced
    ├── Mode: Analyze
    ├── Input: Binary Data
    └── Output: Report + Summary
    ↓
Google Sheets Node (Log Results)
```

### Batch Processing
```
Schedule Trigger
    ↓
Read Binary Files Node
    ↓
Split in Batches Node
    ↓
PDF Accessibility Enhanced
    ├── Mode: Auto
    └── WCAG Level: AA
    ↓
Merge Node
    ↓
Database Node (Save Results)
```

### Custom Tool Selection
```
Webhook Node (PDF Upload)
    ↓
PDF Accessibility Enhanced
    ├── Mode: Custom
    ├── Operations: [alttext, tables, metadata]
    └── WCAG Level: AAA
    ↓
HTTP Response Node (JSON Report)
```

## 📤 Output Structure

### Auto Mode Output
```json
{
  "mode": "intelligent_auto",
  "wcagLevel": "AA",
  "documentInfo": {
    "fileName": "document.pdf",
    "pageCount": 12,
    "hasImages": true,
    "hasTables": true
  },
  "workflowPlan": {
    "recommendedTools": ["image_alttext", "table_accessibility"],
    "reasoning": ["Images require alt-text", "Tables need headers"],
    "complexity": "moderate"
  },
  "execution": {
    "toolsExecuted": 3,
    "totalIssuesFound": 15,
    "totalFixesApplied": 12,
    "success": true
  },
  "accessibilityReport": {
    "complianceScore": 87,
    "recommendations": ["Fix table headers", "Add image alt-text"]
  },
  "exports": {
    "json": "/* Full JSON report */",
    "html": "/* Professional HTML report */",
    "markdown": "/* Documentation format */",
    "csv": "/* Data analysis format */"
  },
  "version": "2.0.1"
}
```

### Analyze Mode Output
```json
{
  "mode": "analysis_only",
  "documentInfo": {
    "fileName": "document.pdf",
    "pageCount": 12,
    "hasImages": true
  },
  "analysis": {
    "recommendedTools": ["image_alttext", "table_accessibility"],
    "estimatedComplexity": "moderate",
    "potentialImprovements": ["Add alt-text", "Enhance tables"]
  },
  "compliancePreview": {
    "currentEstimate": 65,
    "targetLevel": "AA",
    "gapAnalysis": ["Images lack alt-text", "Tables lack headers"]
  }
}
```

## 🛠️ Accessibility Tools

This node includes 5 integrated accessibility tools:

| Tool | WCAG Coverage | Description |
|------|---------------|-------------|
| **Image Alt-Text** | 1.1.1 | AI-generated descriptive alt-text for images |
| **Heading Structure** | 1.3.1, 2.4.6 | Document hierarchy optimization |
| **Table Accessibility** | 1.3.1, 1.3.2 | Headers, captions, and structure |
| **Link Text** | 2.4.4, 2.4.9 | Meaningful link descriptions |
| **Metadata Enhancer** | 3.1.1, 3.1.2 | PDF metadata and language detection |

### Custom Operations
When using Custom mode, specify operations:
- `alttext` - Image alt-text generation
- `headings` - Heading structure optimization
- `tables` - Table accessibility enhancement
- `links` - Link text improvement
- `metadata` - PDF metadata enhancement

## 🔍 Error Handling

### Common Errors

**"Binary data not found"**
- Ensure previous node provides PDF data
- Check binary property name configuration
- Verify file format is PDF

**"LLM provider authentication failed"**
- Check API credentials in n8n settings
- Verify API key permissions and quotas
- Enable debug mode for detailed error info

**"Processing timeout"**
- Large PDFs may need increased timeout
- Try Basic processing depth for faster results
- Consider splitting large documents

## 📚 Resources

- [Complete Documentation](./docs/) - Detailed API reference and examples
- [Accessibility Tools Guide](./docs/accessibility-tools.md) - In-depth tool documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web accessibility standards
- [n8n Community](https://community.n8n.io/) - Get help from the n8n community

## ⚡ Performance

### Processing Times
| Document Type | Pages | Processing Time | Recommended Mode |
|---------------|-------|-----------------|------------------|
| Simple Text | 1-5 | 30-60s | Auto (Basic) |
| Mixed Content | 5-15 | 60-180s | Auto (Full) |
| Image-Heavy | 10-25 | 120-300s | Auto (Deep) |
| Complex Reports | 15-50 | 90-240s | Custom |

### Best Practices
- Use "Basic" depth for batch processing
- Enable cost estimation for expensive operations
- Process during off-peak hours for large documents
- Cache results to avoid re-processing

## 🔒 Security & Privacy

- **No Data Storage**: PDFs processed in memory only
- **Secure Credentials**: API keys encrypted by n8n
- **HTTPS Only**: Secure communication with all providers
- **Auto Cleanup**: Temporary data cleared after processing
- **Audit Trail**: Complete processing logs available

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md) before submitting PRs.

### Development Setup
```bash
git clone https://github.com/joselhurtado/n8n-nodes-pdf-accessibility.git
cd n8n-nodes-pdf-accessibility
npm install
npm run build
npm test
```

## 📝 License

[MIT](LICENSE.md) © [Jose Hurtado](mailto:hello@hurtadojose.com)

## 🆘 Support

- [GitHub Issues](https://github.com/joselhurtado/n8n-nodes-pdf-accessibility/issues) - Bug reports and feature requests
- [n8n Community Forum](https://community.n8n.io/) - General n8n support
- [Email Support](mailto:hello@hurtadojose.com) - Direct support for this node

---

**Built for [n8n](https://n8n.io) • Empowering digital accessibility automation**