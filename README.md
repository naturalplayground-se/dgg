# Design Generator Tools

Professional tools for generating, scaling, and repeating design elements in JSON templates, plus importing from IDML files.

## Features

### 1. Repetition Tool

Generate multiple variations of design elements with automatic positioning and naming. Perfect for creating layouts with repeated elements like product cards, team members, or gallery items.

- Automatic positioning (row/column layouts)
- Smart naming with prefix/suffix options
- Dropdown visibility controls
- Master element relationships

### 2. Scaling Tool

Scale your designs between different paper sizes or custom dimensions. All elements, fonts, and spacing are proportionally adjusted while preserving design integrity.

- A4 ↔ A3 paper size scaling
- Custom dimension scaling
- Smart value targeting (+ and - only)
- Preserves proportional calculations

### 3. **NEW: IDML Import Tool**

Import IDML (InDesign Markup Language) files and automatically convert them to your structured JSON format. Transform InDesign layouts into web-to-print templates effortlessly.

- IDML file parsing and extraction
- Automatic field type detection
- Color and font extraction
- Complete JSON structure generation

## IDML Import Process

The IDML Import tool converts Adobe InDesign files into four JSON files required for web-to-print systems:

### Generated Files:

1. **fields.json** - Contains all layout elements (text, images, shapes) with positioning and properties
2. **pages.json** - Defines page dimensions and properties
3. **styles.json** - Includes colors, fonts, and text styles from your design
4. **templates.json** - Template configuration for print settings

### How It Works:

1. **Upload IDML File**: Select an IDML file exported from Adobe InDesign
2. **Parse Structure**: The tool extracts XML structure from the IDML package
3. **Extract Elements**: Identifies text frames, image frames, and shapes
4. **Map to JSON**: Converts InDesign elements to your field types:
   - Text blocks → `textblock` or `textline` fields
   - Images → `fleximage` fields
   - Rectangles/shapes → `shape` fields
   - Colors → colors array
   - Fonts → fonts array
5. **Download**: Get all four JSON files ready for your web-to-print system

### Supported Elements:

- **Text Frames** → Textblock fields with positioning and styling
- **Image Frames** → Fleximage fields with dimensions and settings
- **Rectangles** → Shape fields with rect type
- **Circles/Ovals** → Shape fields with circle type
- **Colors** → Color definitions extracted from document swatches
- **Fonts** → Font definitions with family names and properties

## Installation

```bash
npm install
npm run dev
```

## Usage

1. Navigate to the application in your browser
2. Choose the tool you need:
   - **Repetition**: For creating repeated elements
   - **Scaling**: For resizing designs proportionally
   - **Import**: For converting IDML files to JSON
3. Follow the step-by-step interface for each tool

## Technical Details

### IDML Structure

IDML files are ZIP archives containing XML files that describe:

- Document structure (`designmap.xml`)
- Spreads and pages (`Spreads/`)
- Text content (`Stories/`)
- Styles and formatting (`Resources/Styles.xml`)
- Colors and fonts (`Resources/`)

### Field Type Mapping

The import tool automatically maps InDesign elements to your field types:

```javascript
// Text Frame → Textblock
{
  "name": "Text_1",
  "type": "textblock",
  "x": 100, "y": 200, "w": 300, "h": 150,
  "fontSize": 12,
  "editable": true
}

// Image Frame → Fleximage
{
  "name": "Image_1",
  "type": "fleximage",
  "x": 50, "y": 50, "w": 200, "h": 200,
  "dpi": 300,
  "editable": true
}

// Rectangle → Shape
{
  "name": "Shape_1",
  "type": "shape",
  "shape": "rect",
  "x": 0, "y": 0, "w": 100, "h": 100
}
```

## Examples

See the `/Examples` folder for sample JSON structures and an example IDML file (`TestIndesign.idml`) to test the import functionality.

## Development

Built with:

- Next.js
- Material-UI
- JSZip (for IDML parsing)
- DOMParser (for XML parsing)
