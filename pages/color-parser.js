import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "../components/Header";

/**
 * Parse unstructured color text and extract color information
 * Handles various formats like:
 * - "CMYK: 95 : 62 : 50 : 60"
 * - "C 0 M 100 Y 100 K 26"
 * - "RGB: 8 : 49 : 60"
 * - "R 181 G 14 B 11"
 * - "Hex: #08303C" or "#08303C"
 */
const parseColorText = (text) => {
  const lines = text.split("\n");
  const colors = [];
  let currentColor = null;

  const saveCurrentColor = () => {
    if (currentColor && currentColor.name) {
      // Ensure we have at least one color format
      if (currentColor.cmyk || currentColor.rgb || currentColor.hex) {
        // Generate missing values if possible
        if (currentColor.hex && !currentColor.rgb) {
          currentColor.rgb = hexToRgb(currentColor.hex);
        }
        if (currentColor.rgb && !currentColor.hex) {
          currentColor.hex = rgbToHex(currentColor.rgb);
        }
        colors.push({ ...currentColor });
      }
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for color name patterns
    // Pattern 1: Line ending with colon (e.g., "Blå:" or "Ljusblå bakgrund:")
    const nameMatch = line.match(/^([A-Za-zåäöÅÄÖéèêëÉÈÊË\s\-]+):?\s*$/);
    if (nameMatch && !line.match(/CMYK|RGB|Hex|^[CMYK]\s|^[RGB]\s/i)) {
      saveCurrentColor();
      currentColor = {
        name: nameMatch[1].trim(),
        cmyk: null,
        rgb: null,
        hex: null,
        model: "CMYK",
      };
      continue;
    }

    // Check for "För cirklarna:", "För bakgrunden:", "Text:" section headers
    if (line.match(/^(För|Text)\s/i) && line.endsWith(":")) {
      continue;
    }

    // Parse CMYK format: "CMYK: 95 : 62 : 50 : 60" or "CMYK: 95, 62, 50, 60"
    const cmykMatch = line.match(
      /CMYK\s*:\s*(\d+(?:\.\d+)?)\s*[,:]\s*(\d+(?:\.\d+)?)\s*[,:]\s*(\d+(?:\.\d+)?)\s*[,:]\s*(\d+(?:\.\d+)?)/i,
    );
    if (cmykMatch && currentColor) {
      currentColor.cmyk = [
        parseFloat(cmykMatch[1]),
        parseFloat(cmykMatch[2]),
        parseFloat(cmykMatch[3]),
        parseFloat(cmykMatch[4]),
      ];
      currentColor.model = "CMYK";
      continue;
    }

    // Parse CMYK format: "C 0 M 100 Y 100 K 26" (may span multiple lines)
    const cmykAltMatch = line.match(
      /C\s*(\d+(?:\.\d+)?)\s*M?\s*(\d+(?:\.\d+)?)?\s*Y?\s*(\d+(?:\.\d+)?)?\s*K?\s*(\d+(?:\.\d+)?)?/i,
    );
    if (cmykAltMatch && currentColor) {
      // Check if this is a multi-line format (C and M on same line, Y and K might be values)
      const c = parseFloat(cmykAltMatch[1]) || 0;
      let m = parseFloat(cmykAltMatch[2]) || 0;
      let y = parseFloat(cmykAltMatch[3]) || 0;
      let k = parseFloat(cmykAltMatch[4]) || 0;

      // Handle "C 0         R 181" format - check if R is present
      if (line.match(/R\s*\d+/i)) {
        // This line has both C value and R value
        const cOnlyMatch = line.match(/C\s*(\d+)/i);
        if (cOnlyMatch) {
          currentColor.cmyk = currentColor.cmyk || [0, 0, 0, 0];
          currentColor.cmyk[0] = parseFloat(cOnlyMatch[1]);
        }
        const rMatch = line.match(/R\s*(\d+)/i);
        if (rMatch) {
          currentColor.rgb = currentColor.rgb || [0, 0, 0];
          currentColor.rgb[0] = parseInt(rMatch[1]);
        }
        continue;
      }

      currentColor.cmyk = [c, m, y, k];
      currentColor.model = "CMYK";
      continue;
    }

    // Parse M value from "M 100       G 14" format
    const mLineMatch = line.match(/M\s*(\d+)/i);
    if (mLineMatch && currentColor && !line.match(/CMYK/i)) {
      currentColor.cmyk = currentColor.cmyk || [0, 0, 0, 0];
      currentColor.cmyk[1] = parseFloat(mLineMatch[1]);
      const gMatch = line.match(/G\s*(\d+)/i);
      if (gMatch) {
        currentColor.rgb = currentColor.rgb || [0, 0, 0];
        currentColor.rgb[1] = parseInt(gMatch[1]);
      }
      continue;
    }

    // Parse Y and K from "Y 100       B 11" or "K 26        Hex: #..." format
    const yLineMatch = line.match(/Y\s*(\d+)/i);
    if (yLineMatch && currentColor && !line.match(/CMYK/i)) {
      currentColor.cmyk = currentColor.cmyk || [0, 0, 0, 0];
      currentColor.cmyk[2] = parseFloat(yLineMatch[1]);
      const bMatch = line.match(/B\s*(\d+)/i);
      if (bMatch && !line.match(/Hex/i)) {
        currentColor.rgb = currentColor.rgb || [0, 0, 0];
        currentColor.rgb[2] = parseInt(bMatch[1]);
      }
    }

    const kLineMatch = line.match(/K\s*(\d+)/i);
    if (kLineMatch && currentColor && !line.match(/CMYK/i)) {
      currentColor.cmyk = currentColor.cmyk || [0, 0, 0, 0];
      currentColor.cmyk[3] = parseFloat(kLineMatch[1]);
    }

    // Parse RGB format: "RGB: 8 : 49 : 60" or "RGB: 8, 49, 60"
    const rgbMatch = line.match(
      /RGB\s*:\s*(\d+)\s*[,:]\s*(\d+)\s*[,:]\s*(\d+)/i,
    );
    if (rgbMatch && currentColor) {
      currentColor.rgb = [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
      ];
      if (!currentColor.cmyk) {
        currentColor.model = "RGB";
      }
      continue;
    }

    // Parse Hex format: "Hex: #08303C" or "#08303C" or "Hex: #B50E0B"
    const hexMatch = line.match(/#([0-9A-Fa-f]{6})/);
    if (hexMatch && currentColor) {
      currentColor.hex = `#${hexMatch[1].toUpperCase()}`;
      if (!currentColor.cmyk && !currentColor.rgb) {
        currentColor.model = "RGB";
        currentColor.rgb = hexToRgb(currentColor.hex);
      }
      continue;
    }

    // Handle "Vanlig vit." as white
    if (line.match(/vanlig\s+vit/i) && currentColor) {
      currentColor.rgb = [255, 255, 255];
      currentColor.hex = "#FFFFFF";
      currentColor.model = "RGB";
      continue;
    }
  }

  // Don't forget the last color
  saveCurrentColor();

  return colors;
};

/**
 * Convert hex color to RGB array
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

/**
 * Convert RGB array to hex string
 */
const rgbToHex = (rgb) => {
  return (
    "#" +
    rgb
      .map((x) => {
        const hex = Math.max(0, Math.min(255, x)).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
};

/**
 * Convert RGB to CMYK (approximate conversion)
 */
const rgbToCmyk = (rgb) => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return [0, 0, 0, 100];
  }

  const c = ((1 - r - k) / (1 - k)) * 100;
  const m = ((1 - g - k) / (1 - k)) * 100;
  const y = ((1 - b - k) / (1 - k)) * 100;

  return [Math.round(c), Math.round(m), Math.round(y), Math.round(k * 100)];
};

/**
 * Convert CMYK to RGB (approximate conversion)
 */
const cmykToRgb = (cmyk) => {
  const c = cmyk[0] / 100;
  const m = cmyk[1] / 100;
  const y = cmyk[2] / 100;
  const k = cmyk[3] / 100;

  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));

  return [r, g, b];
};

/**
 * Encode colors to ASE (Adobe Swatch Exchange) binary format
 * ASE format specification:
 * - Header: "ASEF" (4 bytes) + version 1.0 (4 bytes) + block count (4 bytes)
 * - Each color block: type (2 bytes) + length (4 bytes) + name (UTF-16BE) + color model + values
 */
const encodeAse = (colors) => {
  const blocks = [];

  // Build color blocks
  for (const color of colors) {
    const block = encodeColorBlock(color);
    blocks.push(block);
  }

  // Calculate total size
  const headerSize = 12; // ASEF + version + block count
  const totalBlockSize = blocks.reduce((sum, b) => sum + b.byteLength, 0);
  const totalSize = headerSize + totalBlockSize;

  // Create buffer
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let offset = 0;

  // Write header: "ASEF"
  view.setUint8(offset++, 0x41); // A
  view.setUint8(offset++, 0x53); // S
  view.setUint8(offset++, 0x45); // E
  view.setUint8(offset++, 0x46); // F

  // Write version: 1.0 (0x00010000)
  view.setUint32(offset, 0x00010000);
  offset += 4;

  // Write block count
  view.setUint32(offset, blocks.length);
  offset += 4;

  // Write blocks
  for (const block of blocks) {
    const blockArray = new Uint8Array(block);
    for (let i = 0; i < blockArray.length; i++) {
      view.setUint8(offset++, blockArray[i]);
    }
  }

  return buffer;
};

/**
 * Encode a single color block for ASE format
 */
const encodeColorBlock = (color) => {
  // Encode name as UTF-16BE with null terminator
  const nameChars = color.name + "\0";
  const nameBytes = [];
  for (let i = 0; i < nameChars.length; i++) {
    const code = nameChars.charCodeAt(i);
    nameBytes.push((code >> 8) & 0xff);
    nameBytes.push(code & 0xff);
  }

  // Name length (including null terminator, in characters)
  const nameLength = nameChars.length;

  // Determine color model and values
  let modelBytes;
  let valueBytes;

  if (color.model === "CMYK" && color.cmyk) {
    // CMYK model: "CMYK" + 4 float32 values (0.0-1.0)
    modelBytes = [0x43, 0x4d, 0x59, 0x4b]; // "CMYK"
    valueBytes = new ArrayBuffer(16);
    const valueView = new DataView(valueBytes);
    valueView.setFloat32(0, color.cmyk[0] / 100, false); // C
    valueView.setFloat32(4, color.cmyk[1] / 100, false); // M
    valueView.setFloat32(8, color.cmyk[2] / 100, false); // Y
    valueView.setFloat32(12, color.cmyk[3] / 100, false); // K
  } else if (color.rgb) {
    // RGB model: "RGB " + 3 float32 values (0.0-1.0)
    modelBytes = [0x52, 0x47, 0x42, 0x20]; // "RGB "
    valueBytes = new ArrayBuffer(12);
    const valueView = new DataView(valueBytes);
    valueView.setFloat32(0, color.rgb[0] / 255, false); // R
    valueView.setFloat32(4, color.rgb[1] / 255, false); // G
    valueView.setFloat32(8, color.rgb[2] / 255, false); // B
  } else {
    // Fallback to black
    modelBytes = [0x52, 0x47, 0x42, 0x20]; // "RGB "
    valueBytes = new ArrayBuffer(12);
    const valueView = new DataView(valueBytes);
    valueView.setFloat32(0, 0, false);
    valueView.setFloat32(4, 0, false);
    valueView.setFloat32(8, 0, false);
  }

  // Color type: 0 = Global, 1 = Spot, 2 = Process
  const colorType = 2; // Process color

  // Calculate block length (name length (2) + name bytes + model (4) + values + color type (2))
  const blockDataLength = 2 + nameBytes.length + 4 + valueBytes.byteLength + 2;

  // Create block buffer
  // Block header: type (2 bytes) + length (4 bytes)
  const blockSize = 2 + 4 + blockDataLength;
  const blockBuffer = new ArrayBuffer(blockSize);
  const blockView = new DataView(blockBuffer);
  let offset = 0;

  // Block type: 0x0001 = Color entry
  blockView.setUint16(offset, 0x0001);
  offset += 2;

  // Block length
  blockView.setUint32(offset, blockDataLength);
  offset += 4;

  // Name length (in characters, including null terminator)
  blockView.setUint16(offset, nameLength);
  offset += 2;

  // Name bytes (UTF-16BE)
  for (let i = 0; i < nameBytes.length; i++) {
    blockView.setUint8(offset++, nameBytes[i]);
  }

  // Color model
  for (let i = 0; i < 4; i++) {
    blockView.setUint8(offset++, modelBytes[i]);
  }

  // Color values
  const valueArray = new Uint8Array(valueBytes);
  for (let i = 0; i < valueArray.length; i++) {
    blockView.setUint8(offset++, valueArray[i]);
  }

  // Color type
  blockView.setUint16(offset, colorType);

  return blockBuffer;
};

/**
 * Sample color text for demonstration
 */
const SAMPLE_TEXT = `Färger (Blå + ljusblå, grön + ljusgrön, rosa + ljusrosa, beige + röd)

För cirklarna:

Blå: 
CMYK: 95 : 62 : 50 : 60
RGB: 8 : 49 : 60
Hex: #08303C 
     
Grön: 
CMYK: 64 : 38 : 74 : 28
RGB: 91 : 110 : 73
Hex: #5B6D48

Rosa: 
CMYK: 30 : 67 : 50 : 28
RGB: 149 : 86 : 87
Hex: #955557

Röd: 
C 0         R 181 
M 100       G 14
Y 100       B 11
K 26        Hex: #B50E0B


För bakgrunden:

Ljusblå:
CMYK: 38 : 25 : 20 : 24
RGB: 142 : 151 : 160
Hex: #8e97a0

Ljusgrön:
CMYK: 25 : 15 : 30 : 11
RGB: 186 : 189 : 171
Hex: #babdab

Ljusrosa: 
CMYK: 12 : 27 : 20 : 11
RGB: 209 : 182 : 180
Hex: #d1b6b4

Ljusbeige: 
CMYK: 12 : 27 : 20 : 11
RGB: 209 : 182 : 180
Hex: #efe5d9


Text:
Svart:
CMYK: 0 : 0 : 0 : 94
RGB: 15 : 15 : 15
Hex: #0f0f0f

Vit:
Vanlig vit.`;

export default function ColorParser() {
  const [inputText, setInputText] = React.useState("");
  const [parsedColors, setParsedColors] = React.useState([]);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [fileName, setFileName] = React.useState("colors");

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    setSuccess(false);
    setError("");
  };

  const handleParse = () => {
    if (!inputText.trim()) {
      setError("Please paste some color information first");
      return;
    }

    try {
      const colors = parseColorText(inputText);
      if (colors.length === 0) {
        setError(
          "No colors could be parsed from the input. Make sure each color has a name followed by CMYK, RGB, or Hex values.",
        );
        return;
      }
      setParsedColors(colors);
      setSuccess(true);
      setError("");
    } catch (err) {
      setError(`Error parsing colors: ${err.message}`);
    }
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setSuccess(false);
    setError("");
  };

  const handleRemoveColor = (index) => {
    setParsedColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColorNameChange = (index, newName) => {
    setParsedColors((prev) =>
      prev.map((color, i) =>
        i === index ? { ...color, name: newName } : color,
      ),
    );
  };

  const handleCmykChange = (index, cmykIndex, value) => {
    setParsedColors((prev) =>
      prev.map((color, i) => {
        if (i !== index) return color;
        const newCmyk = [...(color.cmyk || [0, 0, 0, 0])];
        newCmyk[cmykIndex] = Math.max(0, Math.min(100, parseFloat(value) || 0));
        // Update hex from CMYK via RGB conversion
        const rgb = cmykToRgb(newCmyk);
        return {
          ...color,
          cmyk: newCmyk,
          rgb: rgb,
          hex: rgbToHex(rgb),
          model: "CMYK",
        };
      }),
    );
  };

  const handleRgbChange = (index, rgbIndex, value) => {
    setParsedColors((prev) =>
      prev.map((color, i) => {
        if (i !== index) return color;
        const newRgb = [...(color.rgb || [0, 0, 0])];
        newRgb[rgbIndex] = Math.max(0, Math.min(255, parseInt(value) || 0));
        return {
          ...color,
          rgb: newRgb,
          hex: rgbToHex(newRgb),
          cmyk: rgbToCmyk(newRgb),
          model: "RGB",
        };
      }),
    );
  };

  const handleHexChange = (index, value) => {
    setParsedColors((prev) =>
      prev.map((color, i) => {
        if (i !== index) return color;
        // Clean up hex value
        let hex = value.replace(/[^0-9A-Fa-f#]/g, "");
        if (!hex.startsWith("#")) hex = "#" + hex;
        if (hex.length > 7) hex = hex.substring(0, 7);

        const updated = { ...color, hex: hex.toUpperCase() };
        // Only update RGB/CMYK if we have a valid 6-digit hex
        if (hex.length === 7) {
          updated.rgb = hexToRgb(hex);
          updated.cmyk = rgbToCmyk(updated.rgb);
          updated.model = "RGB";
        }
        return updated;
      }),
    );
  };

  const handleDownloadAse = () => {
    if (parsedColors.length === 0) {
      setError("No colors to export");
      return;
    }

    try {
      const aseBuffer = encodeAse(parsedColors);
      const blob = new Blob([aseBuffer], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "colors"}.ase`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Error generating ASE file: ${err.message}`);
    }
  };

  const handleDownloadJson = () => {
    if (parsedColors.length === 0) {
      setError("No colors to export");
      return;
    }

    const jsonContent = JSON.stringify(parsedColors, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "colors"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText("");
    setParsedColors([]);
    setError("");
    setSuccess(false);
  };

  const getColorPreview = (color) => {
    if (color.hex) {
      return color.hex;
    }
    if (color.rgb) {
      return rgbToHex(color.rgb);
    }
    return "#808080";
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Color Parser
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Parse unstructured color information and generate Adobe Swatch
              Exchange (.ase) files
            </Typography>
          </Box>

          {/* Input Section */}
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              1. Paste Color Information
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Paste your color data in any format. The parser will extract color
              names along with CMYK, RGB, and Hex values.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ContentPasteIcon />}
                onClick={handleLoadSample}
                sx={{ mr: 2 }}
              >
                Load Sample Data
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={12}
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Paste color information here, for example:

Blå: 
CMYK: 95 : 62 : 50 : 60
RGB: 8 : 49 : 60
Hex: #08303C

Grön:
CMYK: 64 : 38 : 74 : 28
RGB: 91 : 110 : 73
Hex: #5B6D48`}
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "14px",
                },
              }}
              aria-label="Color information input"
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleParse}
              disabled={!inputText.trim()}
            >
              Parse Colors
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Successfully parsed {parsedColors.length} color
                {parsedColors.length !== 1 ? "s" : ""}!
              </Alert>
            )}
          </Paper>

          {/* Preview Section */}
          {parsedColors.length > 0 && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                2. Review Parsed Colors
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Review and edit the extracted colors below. Changes to one
                format will automatically update the others.
              </Typography>

              <TableContainer>
                <Table aria-label="Parsed colors table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontSize: 11, py: 0.5, color: "text.secondary" }}
                        width={40}
                      ></TableCell>
                      <TableCell
                        sx={{ fontSize: 11, py: 0.5, color: "text.secondary" }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: 11, py: 0.5, color: "text.secondary" }}
                      >
                        CMYK
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: 11, py: 0.5, color: "text.secondary" }}
                      >
                        RGB
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: 11, py: 0.5, color: "text.secondary" }}
                      >
                        Hex
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: 11, py: 0.5 }}
                        width={40}
                      ></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedColors.map((color, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ py: 0.5 }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor: getColorPreview(color),
                              border: "1px solid #ccc",
                              borderRadius: 0.5,
                            }}
                            aria-label={`Color preview for ${color.name}`}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <TextField
                            value={color.name}
                            onChange={(e) =>
                              handleColorNameChange(index, e.target.value)
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 100,
                              "& .MuiInputBase-input": {
                                fontSize: 12,
                                py: 0.5,
                                px: 1,
                              },
                              "& .MuiOutlinedInput-root": { height: 28 },
                            }}
                            aria-label="Color name"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, verticalAlign: "bottom" }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {["C", "M", "Y", "K"].map((label, cmykIndex) => (
                              <Box
                                key={label}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 10,
                                    color: "text.secondary",
                                    mb: 0.25,
                                    lineHeight: 1,
                                  }}
                                >
                                  {label}
                                </Typography>
                                <TextField
                                  value={color.cmyk ? color.cmyk[cmykIndex] : 0}
                                  onChange={(e) =>
                                    handleCmykChange(
                                      index,
                                      cmykIndex,
                                      e.target.value,
                                    )
                                  }
                                  size="small"
                                  type="number"
                                  inputProps={{ min: 0, max: 100, step: 1 }}
                                  sx={{
                                    width: 40,
                                    "& .MuiInputBase-input": {
                                      fontSize: 11,
                                      py: 0.5,
                                      px: 0.5,
                                      textAlign: "center",
                                      MozAppearance: "textfield",
                                      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                        {
                                          WebkitAppearance: "none",
                                          margin: 0,
                                        },
                                    },
                                    "& .MuiOutlinedInput-root": { height: 26 },
                                  }}
                                  aria-label={`${label} value`}
                                />
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1, verticalAlign: "bottom" }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {["R", "G", "B"].map((label, rgbIndex) => (
                              <Box
                                key={label}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 10,
                                    color: "text.secondary",
                                    mb: 0.25,
                                    lineHeight: 1,
                                  }}
                                >
                                  {label}
                                </Typography>
                                <TextField
                                  value={color.rgb ? color.rgb[rgbIndex] : 0}
                                  onChange={(e) =>
                                    handleRgbChange(
                                      index,
                                      rgbIndex,
                                      e.target.value,
                                    )
                                  }
                                  size="small"
                                  type="number"
                                  inputProps={{ min: 0, max: 255, step: 1 }}
                                  sx={{
                                    width: 44,
                                    "& .MuiInputBase-input": {
                                      fontSize: 11,
                                      py: 0.5,
                                      px: 0.5,
                                      textAlign: "center",
                                      MozAppearance: "textfield",
                                      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                                        {
                                          WebkitAppearance: "none",
                                          margin: 0,
                                        },
                                    },
                                    "& .MuiOutlinedInput-root": { height: 26 },
                                  }}
                                  aria-label={`${label} value`}
                                />
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <TextField
                            value={color.hex || "#000000"}
                            onChange={(e) =>
                              handleHexChange(index, e.target.value)
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              width: 76,
                              "& .MuiInputBase-input": {
                                fontSize: 11,
                                py: 0.5,
                                px: 0.5,
                                fontFamily: "monospace",
                              },
                              "& .MuiOutlinedInput-root": { height: 28 },
                            }}
                            aria-label="Hex value"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Tooltip title="Remove">
                            <IconButton
                              onClick={() => handleRemoveColor(index)}
                              color="error"
                              size="small"
                              sx={{ p: 0.5 }}
                              aria-label={`Remove ${color.name}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Download Section */}
          {parsedColors.length > 0 && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                3. Download
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Export your colors as an Adobe Swatch Exchange (.ase) file for
                use in Adobe applications, or as JSON.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  label="File name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  size="small"
                  sx={{ width: 200, mr: 2 }}
                  aria-label="Output file name"
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadAse}
                >
                  Download .ase
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadJson}
                >
                  Download .json
                </Button>
              </Box>
            </Paper>
          )}

          {/* Information Section */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Supported Formats
              </Typography>
              <Typography variant="body1" paragraph>
                The parser recognizes various color formats:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>CMYK:</strong> "CMYK: 95 : 62 : 50 : 60" or "C 0 M 100
                  Y 100 K 26"
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>RGB:</strong> "RGB: 8 : 49 : 60" or "R 181 G 14 B 11"
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Hex:</strong> "#08303C" or "Hex: #08303C"
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>Names:</strong> Lines ending with colon become color
                  names (e.g., "Blå:")
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Import .ase files in Adobe apps: Window → Swatches → menu → Open
                Swatch Library → Other Library...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
