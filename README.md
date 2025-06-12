# n8n-nodes-pdf-accessibility

AI-powered PDF accessibility automation for n8n workflows.

## Installation

### n8n Cloud & Desktop App
1. Go to Settings → Community Nodes
2. Click Install and enter: `n8n-nodes-pdf-accessibility`
3. Click Install and agree to the risks

### Self-Hosted n8n
```bash
npm install n8n-nodes-pdf-accessibility
# Restart n8n
```

### Docker
```bash
docker exec <container-id> npm install n8n-nodes-pdf-accessibility
docker restart <container-id>
```

## Features

This package provides two nodes for PDF accessibility automation:

**PDF Accessibility Enhanced Node** - Main automation node with 4 processing modes:
- **Auto**: AI analyzes and applies optimal accessibility improvements
- **Analyze**: Comprehensive analysis without document modification
- **Remediate**: Apply improvements with detailed reporting
- **Custom**: User-defined tool selection for specific needs

**PDF Accessibility Node (Legacy)** - Simple analysis for basic WCAG compliance checking

### Built-in Accessibility Tools

- **Image Alt-Text** (WCAG 1.1.1) - AI-generated descriptive alt-text for images
- **Heading Structure** (WCAG 1.3.1, 2.4.6) - Document hierarchy optimization
- **Table Accessibility** (WCAG 1.3.1, 1.3.2) - Headers, captions, and structure enhancement
- **Link Text** (WCAG 2.4.4, 2.4.9) - Meaningful link descriptions
- **Metadata Enhancer** (WCAG 3.1.1, 3.1.2) - PDF metadata and language detection

### WCAG Compliance Levels
- **Level A**: Essential accessibility (5 criteria)
- **Level AA**: Standard compliance (recommended)
- **Level AAA**: Highest accessibility (10 criteria)

## Basic Usage

### Simple Automation Workflow
```
HTTP Request Node (PDF Upload)
    ↓
PDF Accessibility Enhanced
    ├── Mode: Auto
    ├── WCAG Level: AA
    └── LLM Provider: Auto
    ↓
Email Node (Send Report)
```

### Google Drive Integration
```
Google Drive Node (Download PDF)
    ↓
PDF Accessibility Enhanced
    ├── Mode: Analyze
    └── Input: Binary Data
    ↓
Google Sheets Node (Log Results)
```

## Configuration

### Required Settings
- **Processing Mode**: Auto, Analyze, Remediate, or Custom
- **WCAG Level**: A, AA, or AAA compliance target
- **PDF Input**: Binary data, URL, file path, or base64

### Optional Settings
- **LLM Provider**: Auto-select or choose Anthropic, OpenAI, Google
- **Processing Depth**: Basic, Full, or Deep analysis
- **Output Format**: PDF, Report, Summary, Log combinations
- **Language**: Document language (en, es, fr, de, etc.)

## AI Provider Credentials

Configure API credentials in n8n for AI-powered features:

- **Anthropic API**: Your Anthropic Claude API key
- **OpenAI API**: Your OpenAI GPT API key
- **Google AI API**: Your Google AI Studio API key

Auto mode uses available credentials intelligently.

## Output Structure

### Auto Mode Response
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
  }
}
```

## Custom Operations

For Custom mode, specify operations:
- `alttext` - Image alt-text generation
- `headings` - Heading structure optimization
- `tables` - Table accessibility enhancement
- `links` - Link text improvement
- `metadata` - PDF metadata enhancement

## Performance

### Processing Times
- Simple Text (1-5 pages): 30-60s
- Mixed Content (5-15 pages): 60-180s
- Image-Heavy (10-25 pages): 120-300s
- Complex Reports (15-50 pages): 90-240s

### Best Practices
- Use "Basic" depth for batch processing
- Enable cost estimation for large operations
- Process during off-peak hours for large documents
- Cache results to avoid re-processing

## Troubleshooting

### Common Issues

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

## Security & Privacy

- **No Data Storage**: PDFs processed in memory only
- **Secure Credentials**: API keys encrypted by n8n
- **HTTPS Only**: Secure communication with all providers
- **Auto Cleanup**: Temporary data cleared after processing
- **Audit Trail**: Complete processing logs available

## Support

- [GitHub Issues](https://github.com/joselhurtado/n8n-nodes-pdf-accessibility/issues) - Bug reports and feature requests
- [n8n Community Forum](https://community.n8n.io/) - General n8n support
- [Documentation](https://github.com/joselhurtado/n8n-nodes-pdf-accessibility/tree/main/docs) - Complete API reference

## License

MIT © [Jose Hurtado](mailto:hello@hurtadojose.com)

Built for [n8n](https://n8n.io) workflow automation.