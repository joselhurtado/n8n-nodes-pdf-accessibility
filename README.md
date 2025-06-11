# n8n-nodes-pdf-remediation

![PDF Accessibility](https://img.shields.io/badge/PDF-Accessibility-blue)
![N8N Community Node](https://img.shields.io/badge/n8n-community--node-ff6d5a)
![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AA-green)
![License](https://img.shields.io/badge/license-MIT-blue)

An N8N community node that provides comprehensive PDF accessibility analysis and remediation capabilities, ensuring WCAG 2.1 AA compliance through AI-powered automation.

## ✨ Features

- 📋 **PDF Validation** - Comprehensive file validation with customizable limits
- 🔍 **AI-Powered Analysis** - Intelligent accessibility analysis using Claude AI
- 🔧 **Automated Remediation** - Apply accessibility improvements automatically
- 📊 **Detailed Reporting** - Generate professional HTML and text reports
- 🎯 **WCAG Compliance** - Target A, AA, or AAA compliance levels
- 🌐 **Multi-language Support** - Support for major European languages
- 🔄 **Flexible Workflows** - Use individual operations or complete workflow

## 🚀 Installation

### Prerequisites

- N8N version 0.198.0 or later
- Node.js 18+ 
- Anthropic API key for AI analysis

### Method 1: N8N Community Nodes

1. In your N8N instance, go to **Settings → Community Nodes**
2. Install package: `n8n-nodes-pdf-remediation`
3. Restart N8N

### Method 2: Manual Installation

```bash
# Navigate to your N8N installation directory
cd ~/.n8n/nodes

# Install the package
npm install n8n-nodes-pdf-remediation

# Restart N8N
```

### Method 3: Docker

```bash
# Add to your Dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-pdf-remediation
```

## 🛠️ Setup

### 1. Configure Anthropic API Credentials

1. Go to **Credentials** in your N8N interface
2. Click **Add Credential** → **Anthropic API**
3. Enter your API key from [Anthropic Console](https://console.anthropic.com/)
4. Test the connection

### 2. Node Configuration

The PDF Accessibility node offers five operation modes:

#### 🔍 **Validate PDF**
Basic validation and content analysis
- File size and page limits
- Content type detection
- Text extraction and analysis

#### 🧠 **Analyze Accessibility** 
AI-powered accessibility analysis
- WCAG compliance assessment
- Improvement recommendations
- Compliance scoring

#### 🔧 **Remediate PDF**
Apply accessibility improvements
- Document title generation
- Language declaration
- Metadata enhancement

#### 📊 **Generate Report**
Create detailed accessibility reports
- HTML and text formats
- Compliance scoring
- Actionable recommendations

#### ⚡ **Full Workflow**
Complete end-to-end processing
- All operations in sequence
- Comprehensive results
- Ready-to-use output

## 📖 Usage Examples

### Basic Validation

```json
{
  "operation": "validatePdf",
  "maxFileSize": 20,
  "maxPages": 10,
  "allowScanned": false
}
```

### Complete Workflow

```json
{
  "operation": "fullWorkflow",
  "model": "claude-3-5-sonnet-20241022",
  "wcagLevel": "AA",
  "autoTitle": true,
  "setLanguage": "en-US",
  "reportFormat": "both"
}
```

### Batch Processing

Use N8N's **Split in Batches** node to process multiple PDFs:

```
HTTP Request (Upload) → Split in Batches → PDF Accessibility → Merge
```

## 🎯 Configuration Options

### Validation Options
- **Maximum File Size**: 1-100 MB (default: 20 MB)
- **Maximum Pages**: 1-50 pages (default: 10)
- **Allow Scanned Documents**: Enable for OCR content (lower accuracy)
- **Allow Form Documents**: Enable for fillable PDFs
- **Minimum Text Length**: Required characters (default: 100)

### AI Analysis Options
- **AI Model**: Claude 3.5 Sonnet (recommended) or Claude 3 Haiku (faster)
- **WCAG Level**: A, AA (recommended), or AAA
- **Analysis Depth**: Standard or comprehensive

### Remediation Options
- **Auto-Generate Title**: Extract title from content
- **Document Language**: Set primary language (8 supported languages)
- **Add Metadata**: Include accessibility metadata
- **Output Filename**: Custom naming pattern

### Report Options
- **Format**: HTML, Text, or Both
- **Include Validation**: Show validation details
- **Include Recommendations**: Add AI suggestions
- **Output Format**: Complete, Summary, or Report-only

## 🔧 Workflow Examples

### Simple File Processing

```
Webhook (File Upload) → PDF Accessibility (Full Workflow) → Email
```

### Advanced Pipeline

```
HTTP Request → PDF Accessibility (Validate) → IF (Valid) → 
PDF Accessibility (Analyze) → PDF Accessibility (Remediate) → 
PDF Accessibility (Report) → Email + Store
```

### Batch Processing with Error Handling

```
Schedule → HTTP Request (Get Files) → Split in Batches → 
PDF Accessibility (Full Workflow) → [Success] Email Results
                                 → [Error] Log Error + Notify
```

## 📊 Output Data Structure

### Validation Output
```json
{
  "valid": true,
  "pageCount": 5,
  "textLength": 2847,
  "wordCount": 421,
  "fileSize": 156234,
  "fileName": "document.pdf",
  "validationDetails": {
    "fileSize": true,
    "pageCount": true,
    "hasReadableText": true,
    "notScanned": true,
    "noForms": true,
    "romanCharsOnly": true
  }
}
```

### Analysis Output
```json
{
  "suggestedTitle": "Annual Accessibility Report 2024",
  "language": "en-US",
  "complianceScore": 85,
  "criteriaAddressed": [
    "1.1.1 Non-text Content",
    "2.4.2 Page Titled",
    "3.1.1 Language of Page"
  ],
  "remainingIssues": [
    "Manual review needed for color contrast"
  ]
}
```

### Full Workflow Output
```json
{
  "processingComplete": true,
  "validation": { /* validation results */ },
  "analysis": { /* analysis results */ },
  "remediation": { /* remediation results */ },
  "report": { /* report data */ },
  "processingTimestamp": "2024-01-01T12:00:00.000Z"
}
```

## ⚠️ Limitations

### Supported Content
- ✅ Text-based PDFs only
- ✅ Roman character languages
- ✅ Standard document structures
- ❌ Scanned documents (optional, lower accuracy)
- ❌ Fillable forms (optional)
- ❌ Complex graphics/charts
- ❌ Non-Roman scripts (Arabic, Chinese, etc.)

### Processing Limits
- **File Size**: Maximum 100 MB
- **Pages**: Maximum 50 pages
- **Processing Time**: 30-180 seconds depending on complexity
- **Batch Size**: Recommended 10 documents per batch

### AI Analysis
- Requires Anthropic API key and credits
- Processing cost: ~$0.10-0.30 per document
- Internet connection required
- Rate limits apply (see Anthropic documentation)

## 🔒 Security & Privacy

- 📁 **No Data Storage**: Files processed in memory only
- 🔐 **Secure Credentials**: API keys encrypted by N8N
- 🌐 **API Communication**: HTTPS only to Anthropic
- 🗑️ **Auto Cleanup**: Temporary data automatically cleared
- 📋 **Compliance**: Follows data protection best practices

## 🚨 Troubleshooting

### Common Issues

**"PDF parsing failed"**
- Ensure PDF is not corrupted or password-protected
- Check file size and page limits
- Verify PDF contains readable text

**"AI API Error"**
- Verify Anthropic API credentials
- Check API quota and billing
- Ensure internet connectivity

**"Remediation failed"**
- PDF may have security restrictions
- File corruption or unsupported features
- Try with a simpler PDF first

**"File validation failed"**
- Check file size (must be under limit)
- Verify PDF format (not image or other format)
- Ensure document contains text content

### Debug Mode

Enable debug logging in your N8N instance:
```bash
export N8N_LOG_LEVEL=debug
```

### Getting Help

1. 📚 Check the [documentation](https://github.com/joselhurtado/n8n-nodes-pdf-remediation/wiki)
2. 🐛 Report issues on [GitHub](https://github.com/joselhurtado/n8n-nodes-pdf-remediation/issues)
3. 💬 Join the [N8N Community](https://community.n8n.io/)
4. 📧 Email support: [your-email@domain.com](mailto:your-email@domain.com)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/joselhurtado/n8n-nodes-pdf-remediation.git
cd n8n-nodes-pdf-remediation

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [N8N](https://n8n.io/) for the amazing automation platform
- [Anthropic](https://anthropic.com/) for Claude AI capabilities
- [PDF-lib](https://pdf-lib.js.org/) for PDF manipulation
- The accessibility community for WCAG guidelines

## 📈 Roadmap

- [ ] Advanced structure tagging
- [ ] Color contrast analysis
- [ ] Image OCR and alt-text generation
- [ ] Table accessibility improvements
- [ ] Multi-language expansion
- [ ] Custom compliance templates
- [ ] Batch processing optimization
- [ ] Real-time collaboration features

---

**Made with ❤️ by [Jose Hurtado](https://github.com/josehurtado)**

*Empowering digital accessibility through automation*