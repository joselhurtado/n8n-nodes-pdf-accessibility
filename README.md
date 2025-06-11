# n8n-nodes-pdf-accessibility

![PDF Accessibility](https://img.shields.io/badge/PDF-Accessibility-blue)
![N8N Community Node](https://img.shields.io/badge/n8n-community--node-ff6d5a)
![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AA-green)
![License](https://img.shields.io/badge/license-MIT-blue)

An N8N community node for comprehensive PDF accessibility analysis and remediation, ensuring WCAG 2.1 AA compliance through AI-powered automation.

## ✨ Features

- 📋 **PDF Validation** - File validation with customizable limits
- 🔍 **AI-Powered Analysis** - Multi-LLM support (Anthropic, OpenAI, Google, Custom APIs)
- 🔧 **Automated Remediation** - Apply accessibility improvements automatically
- 📊 **Detailed Reporting** - Generate professional HTML and text reports
- 🎯 **WCAG Compliance** - Target A, AA, or AAA compliance levels
- 🌐 **Multi-language Support** - Support for major European languages
- 🔄 **Flexible Input Methods** - Binary data, file paths, or base64 encoding

## 🚀 Installation & Setup

### For N8N Docker Users
Add to your `docker-compose.yml` environment section:
```yaml
environment:
  - N8N_NODES_INCLUDE=n8n-nodes-pdf-accessibility
```

Then restart your container:
```bash
docker-compose down && docker-compose up -d
```

### For N8N Local Installation
```bash
npm install n8n-nodes-pdf-accessibility
# Restart N8N after installation
```

### Icon Troubleshooting
If icons don't appear after installation:
1. **Restart N8N** completely
2. **Clear browser cache** (Ctrl+F5 or Cmd+Shift+R)
3. **Check N8N version** (requires N8N >= 1.0.0)
4. **Verify installation** in N8N Community Packages settings

### Supported Environments
- ✅ N8N Docker installations
- ✅ N8N local/npm installations  
- ✅ N8N Cloud (community packages enabled)

## 🛠️ Configuration

### Input Methods
The node supports **three flexible input methods**:

1. **📁 Binary Data** - From previous nodes (HTTP Request, Google Drive, etc.)
2. **🔗 File Path** - Direct file system access with expressions
3. **📄 Base64** - For API-provided encoded data

### LLM Provider Setup
Configure credentials for your chosen provider:

- **Anthropic Claude** - API key from [Anthropic Console](https://console.anthropic.com/)
- **OpenAI GPT** - API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Google Gemini** - API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Custom API** - Configure base URL, authentication, and API format

### Operations

1. **🔍 Validate PDF** - Basic validation and content analysis
2. **🧠 Analyze Accessibility** - AI-powered WCAG compliance assessment
3. **🔧 Remediate PDF** - Apply accessibility improvements
4. **📊 Generate Report** - Create detailed accessibility reports
5. **⚡ Full Workflow** - Complete end-to-end processing

## 📖 Usage Examples

### Complete Workflow Example
```json
{
  "operation": "fullWorkflow",
  "llmProvider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "wcagLevel": "AA",
  "autoTitle": true,
  "setLanguage": "en-US",
  "reportFormat": "both"
}
```

### Simple Workflow
```
HTTP Request (Upload) → PDF Accessibility (Full Workflow) → Email Results
```

### Batch Processing
```
Schedule → HTTP Request → Split in Batches → PDF Accessibility → Email
```

## 📊 Output Structure

### Validation Output
```json
{
  "valid": true,
  "pageCount": 5,
  "textLength": 2847,
  "fileSize": 156234,
  "fileName": "document.pdf"
}
```

### Full Workflow Output
```json
{
  "processingComplete": true,
  "validation": { /* validation results */ },
  "analysis": { /* AI analysis with compliance score */ },
  "remediation": { /* applied improvements */ },
  "report": { /* HTML/text reports */ }
}
```

## ⚠️ Limitations

### Supported Content
- ✅ Text-based PDFs only
- ✅ Roman character languages
- ❌ Scanned documents (optional, lower accuracy)
- ❌ Complex graphics/charts

### Processing Limits
- **File Size**: Maximum 100 MB
- **Pages**: Maximum 50 pages
- **Processing Time**: 30-180 seconds
- **Cost**: ~$0.03-0.30 per document (varies by LLM provider)

## 🚨 Troubleshooting

**"PDF parsing failed"**
- Ensure PDF is not corrupted or password-protected
- Check file size and page limits

**"AI API Error"**
- Verify LLM provider API credentials
- Check API quota and billing status

**"Binary data missing"**
- **Binary Method**: Ensure previous node provides PDF data
- **File Path Method**: Check file path exists
- **Base64 Method**: Verify base64 data is valid

**Icons not showing**
- Restart N8N after installation
- Clear browser cache (Ctrl+F5)
- Check N8N logs for errors

## 🔒 Security & Privacy

- 📁 **No Data Storage** - Files processed in memory only
- 🔐 **Secure Credentials** - API keys encrypted by N8N
- 🌐 **HTTPS Only** - Secure API communication
- 🗑️ **Auto Cleanup** - Temporary data automatically cleared

## 🤝 Contributing

Contributions welcome! Check our [GitHub repository](https://github.com/joselhurtado/n8n-nodes-pdf-accessibility) for details.

### Development Setup
```bash
git clone https://github.com/joselhurtado/n8n-nodes-pdf-accessibility.git
cd n8n-nodes-pdf-accessibility
npm install
npm run build
npm test
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [N8N](https://n8n.io/) for the automation platform
- [Anthropic](https://anthropic.com/), [OpenAI](https://openai.com/), [Google](https://ai.google.dev/) for AI capabilities
- [PDF-lib](https://pdf-lib.js.org/) for PDF manipulation

---

**Made with ❤️ by [Jose Hurtado](https://github.com/josehurtado) | Empowering digital accessibility through automation**