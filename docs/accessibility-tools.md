# Accessibility Tools Documentation

This document provides detailed information about the 5 integrated accessibility tools that power the enhanced PDF accessibility automation.

---

## 🖼️ **Image Alt-Text Tool**

### Purpose
AI-powered generation of descriptive alt-text for images in PDF documents.

### WCAG Coverage
- **1.1.1 Non-text Content** (Level A)

### How It Works
1. **Image Detection** - Scans PDF for embedded images
2. **Context Analysis** - Examines surrounding text for context clues
3. **AI Generation** - Uses LLM to create descriptive alt-text
4. **Quality Validation** - Ensures alt-text meets WCAG guidelines

### Configuration
```javascript
{
  "customOperations": ["alttext"]
}
```

### Detection Criteria
The tool activates when documents contain:
- Embedded images (JPG, PNG, GIF, etc.)
- Charts and diagrams
- Logos and branding elements
- Decorative graphics

### AI Prompting Strategy
- **Context-aware**: Considers surrounding text and document purpose
- **Concise**: Keeps alt-text under 125 characters when possible
- **Meaningful**: Describes content purpose, not just appearance
- **WCAG-compliant**: Follows accessibility best practices

### Output Examples
```json
{
  "toolName": "image_alttext",
  "success": true,
  "issuesFound": [
    {
      "type": "missing_alt_text",
      "severity": "high",
      "description": "Image on page 3 lacks descriptive alt-text",
      "location": "Page 3, position (120, 350)",
      "wcagCriteria": ["1.1.1"],
      "suggestion": "Add descriptive alt-text explaining the chart's data visualization"
    }
  ],
  "fixesApplied": [
    {
      "type": "alt_text_generation",
      "description": "Added descriptive alt-text: 'Bar chart showing quarterly sales growth from 2023-2024'",
      "applied": true,
      "wcagImprovement": ["1.1.1"],
      "beforeValue": "",
      "afterValue": "Bar chart showing quarterly sales growth from 2023-2024"
    }
  ],
  "processing_time_ms": 3200
}
```

---

## 📋 **Heading Structure Tool**

### Purpose
Analyzes and optimizes document heading hierarchy for logical navigation structure.

### WCAG Coverage
- **1.3.1 Info and Relationships** (Level A)
- **2.4.6 Headings and Labels** (Level AA)
- **2.4.10 Section Headings** (Level AAA)

### How It Works
1. **Heading Detection** - Identifies text formatted as headings
2. **Hierarchy Analysis** - Evaluates heading level progression (H1→H2→H3)
3. **Gap Identification** - Finds skipped levels or illogical structure
4. **Structure Optimization** - Suggests proper heading hierarchy

### Configuration
```javascript
{
  "customOperations": ["headings"]
}
```

### Analysis Criteria
- **Heading Level Progression** - Ensures logical H1→H2→H3 flow
- **Content Organization** - Validates that headings accurately describe sections
- **Navigation Support** - Confirms headings enable effective document navigation

### Common Issues Detected
- Skipped heading levels (H1 directly to H3)
- Multiple H1 tags (should be unique)
- Generic heading text ("Introduction", "Section 1")
- Missing headings for major document sections

### Output Examples
```json
{
  "toolName": "heading_structure",
  "success": true,
  "issuesFound": [
    {
      "type": "heading_structure",
      "severity": "medium",
      "description": "Heading level skipped: H1 followed directly by H3",
      "location": "Page 2, heading 'Data Analysis'",
      "wcagCriteria": ["1.3.1", "2.4.6"],
      "suggestion": "Insert H2 heading or change H3 to H2 for proper hierarchy"
    }
  ],
  "fixesApplied": [
    {
      "type": "heading_optimization",
      "description": "Corrected heading hierarchy: Changed H3 'Data Analysis' to H2",
      "applied": true,
      "wcagImprovement": ["1.3.1", "2.4.6"],
      "beforeValue": "H3: Data Analysis",
      "afterValue": "H2: Data Analysis"
    }
  ],
  "processing_time_ms": 2800
}
```

---

## 📊 **Table Accessibility Tool**

### Purpose
Enhances table accessibility through proper headers, captions, and structural markup.

### WCAG Coverage
- **1.3.1 Info and Relationships** (Level A)
- **1.3.2 Meaningful Sequence** (Level A)

### How It Works
1. **Table Detection** - Identifies tables in PDF content
2. **Structure Analysis** - Examines table headers, rows, and data relationships
3. **Header Optimization** - Ensures proper header markup and associations
4. **Caption Generation** - Creates descriptive table captions when missing

### Configuration
```javascript
{
  "customOperations": ["tables"]
}
```

### Detection Criteria
The tool activates when documents contain:
- Data tables with rows and columns
- Complex tables with merged cells
- Tables missing proper headers
- Tables without descriptive captions

### Accessibility Enhancements
- **Header Association** - Links data cells to appropriate headers
- **Caption Creation** - Provides table summaries and purposes
- **Scope Definition** - Clarifies column/row header relationships
- **Summary Text** - Explains complex table structures

### Output Examples
```json
{
  "toolName": "table_accessibility",
  "success": true,
  "issuesFound": [
    {
      "type": "table_headers",
      "severity": "high",
      "description": "Table on page 4 lacks proper header markup",
      "location": "Page 4, table 'Sales Data'",
      "wcagCriteria": ["1.3.1"],
      "suggestion": "Add proper table headers with scope attributes"
    }
  ],
  "fixesApplied": [
    {
      "type": "table_structure",
      "description": "Added table headers and caption: 'Quarterly sales data by region and product category'",
      "applied": true,
      "wcagImprovement": ["1.3.1"],
      "beforeValue": "Unmarked table with data",
      "afterValue": "Properly structured table with headers and caption"
    }
  ],
  "processing_time_ms": 4100
}
```

---

## 🔗 **Link Text Tool**

### Purpose
Improves link text to be more descriptive and meaningful for screen reader users.

### WCAG Coverage
- **2.4.4 Link Purpose (In Context)** (Level A)
- **2.4.9 Link Purpose (Link Only)** (Level AAA)

### How It Works
1. **Link Detection** - Identifies all links in the document
2. **Context Analysis** - Examines link text and surrounding content
3. **Meaningfulness Assessment** - Evaluates if link purpose is clear
4. **Text Enhancement** - Improves generic or unclear link text

### Configuration
```javascript
{
  "customOperations": ["links"]
}
```

### Common Issues Addressed
- Generic link text ("click here", "read more", "learn more")
- URL-only links (raw URLs without descriptive text)
- Ambiguous links that don't explain destination
- Repetitive link text that doesn't distinguish destinations

### Link Text Guidelines
- **Descriptive** - Clearly indicates link destination or purpose
- **Concise** - Provides essential information without being verbose
- **Unique** - Distinguishes between different links in same context
- **Contextual** - Makes sense when read out of context by screen readers

### Output Examples
```json
{
  "toolName": "link_text",
  "success": true,
  "issuesFound": [
    {
      "type": "link_text",
      "severity": "medium",
      "description": "Generic link text 'click here' doesn't describe destination",
      "location": "Page 5, paragraph 3",
      "wcagCriteria": ["2.4.4"],
      "suggestion": "Replace with descriptive text that explains link purpose"
    }
  ],
  "fixesApplied": [
    {
      "type": "link_improvement",
      "description": "Improved link text from 'click here' to 'download accessibility guidelines PDF'",
      "applied": true,
      "wcagImprovement": ["2.4.4", "2.4.9"],
      "beforeValue": "click here",
      "afterValue": "download accessibility guidelines PDF"
    }
  ],
  "processing_time_ms": 2200
}
```

---

## 📄 **Metadata Enhancer Tool**

### Purpose
Optimizes PDF metadata for accessibility, searchability, and proper document identification.

### WCAG Coverage
- **3.1.1 Language of Page** (Level A)
- **3.1.2 Language of Parts** (Level AA)

### How It Works
1. **Metadata Extraction** - Reads existing PDF metadata
2. **Content Analysis** - Analyzes document content for missing information
3. **Language Detection** - Identifies document language(s)
4. **Metadata Enhancement** - Adds or improves title, author, subject, keywords

### Configuration
```javascript
{
  "customOperations": ["metadata"]
}
```

### Metadata Fields Enhanced
- **Title** - Descriptive document title (not filename)
- **Author** - Document creator or organization
- **Subject** - Brief description of document content
- **Keywords** - Relevant search terms and topics
- **Language** - Primary document language
- **Creator** - Application used to create document
- **Producer** - Accessibility enhancement tool information

### Language Detection
- **Primary Language** - Sets document-level language attribute
- **Secondary Languages** - Identifies multilingual content sections
- **Regional Variants** - Distinguishes between language variants (en-US vs en-GB)

### Output Examples
```json
{
  "toolName": "metadata_enhancer",
  "success": true,
  "issuesFound": [
    {
      "type": "metadata",
      "severity": "low",
      "description": "Document title shows filename instead of descriptive title",
      "location": "Document metadata",
      "wcagCriteria": ["3.1.1"],
      "suggestion": "Add descriptive title that explains document purpose"
    }
  ],
  "fixesApplied": [
    {
      "type": "metadata_optimization",
      "description": "Enhanced metadata: title, language, and keywords added",
      "applied": true,
      "wcagImprovement": ["3.1.1", "3.1.2"],
      "beforeValue": "Title: document.pdf, Language: none",
      "afterValue": "Title: Annual Accessibility Report 2024, Language: en-US"
    }
  ],
  "processing_time_ms": 1500
}
```

---

## 🔧 **Tool Orchestration**

### Intelligent Execution Order
The AccessibilityToolsManager executes tools in optimal order:

1. **Metadata Enhancer** - Sets foundation (language, structure)
2. **Heading Structure** - Establishes document hierarchy
3. **Image Alt-Text** - Handles content descriptions
4. **Table Accessibility** - Structures tabular data
5. **Link Text** - Improves navigation elements

### Performance Characteristics

| Tool | Avg Time | Memory Usage | LLM Calls | Complexity |
|------|----------|--------------|-----------|------------|
| Metadata | 1-2s | Low | 1-2 | Simple |
| Headings | 2-4s | Medium | 2-3 | Medium |
| Images | 3-8s | High | 1 per image | High |
| Tables | 3-6s | Medium | 1 per table | Medium |
| Links | 2-3s | Low | 1-2 | Simple |

### Error Handling
Each tool implements robust error handling:
- **Graceful Degradation** - Continues processing if individual items fail
- **Detailed Logging** - Provides specific error information for debugging
- **Partial Success** - Reports successful improvements even if some items fail
- **Recovery Strategies** - Attempts alternative approaches for complex content

### Quality Assurance
All tools include validation:
- **WCAG Compliance** - Ensures improvements meet accessibility standards
- **Content Preservation** - Maintains original content meaning and structure
- **Performance Monitoring** - Tracks processing time and resource usage
- **Output Validation** - Verifies generated content quality and appropriateness

---

## 🎯 **Tool Selection Strategy**

### Auto-Selection Logic
When using "Intelligent Auto-Processing" mode, tools are selected based on:

1. **Content Analysis** - What types of content are present?
2. **WCAG Level** - What compliance level is targeted?
3. **Document Complexity** - How complex is the content structure?
4. **Performance Requirements** - What are the processing time constraints?

### Manual Selection
For "Custom Workflow" mode, choose tools based on:

**Document Type**:
- **Reports/Research** → Headings + Metadata + Links
- **Marketing Materials** → Images + Links + Metadata  
- **Data Documents** → Tables + Headings + Metadata
- **Presentations** → Images + Headings + Metadata

**Compliance Level**:
- **Level A** → Metadata + Images (if present)
- **Level AA** → All relevant tools for content type
- **Level AAA** → All tools + deep analysis settings

**Processing Speed**:
- **Fast** → Metadata only or 2-3 most relevant tools
- **Balanced** → All applicable tools with standard settings
- **Thorough** → All tools with deep analysis settings

---

**💡 Pro Tip**: Start with "Intelligent Auto-Processing" to understand which tools are most relevant for your documents, then use "Custom Workflow" for fine-tuned control over specific accessibility improvements.