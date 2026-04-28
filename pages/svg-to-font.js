import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { createTtfFromSvg } from "../lib/svgToTtf";

const PREVIEW_STYLE_ID = "svg-to-font-preview-style";
const DEFAULT_FIELD_SETTINGS = {
  documentWidth: 595,
  documentHeight: 842,
  name: "Svg_Font_A",
  title: "SVG Font A",
  fontNr: 4,
  x: 100,
  y: 100,
  w: 100,
  fontSize: 200,
  color: 0,
};
const MAX_PREVIEW_WIDTH = 720;
const MAX_PREVIEW_HEIGHT = 520;

function toFiniteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeFieldName(name) {
  const normalized = String(name || "")
    .trim()
    .replace(/\s+/g, "_");

  return normalized || DEFAULT_FIELD_SETTINGS.name;
}

export default function SvgToFont() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [svgText, setSvgText] = React.useState("");
  const [generatedFont, setGeneratedFont] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldSettings, setFieldSettings] = React.useState(
    DEFAULT_FIELD_SETTINGS,
  );
  const [fieldCopied, setFieldCopied] = React.useState(false);

  const fieldName = normalizeFieldName(fieldSettings.name);
  const documentWidth = Math.max(
    1,
    toFiniteNumber(fieldSettings.documentWidth, DEFAULT_FIELD_SETTINGS.documentWidth),
  );
  const documentHeight = Math.max(
    1,
    toFiniteNumber(fieldSettings.documentHeight, DEFAULT_FIELD_SETTINGS.documentHeight),
  );
  const previewScale = Math.min(
    1,
    MAX_PREVIEW_WIDTH / documentWidth,
    MAX_PREVIEW_HEIGHT / documentHeight,
  );
  const fontField = React.useMemo(
    () => ({
      name: fieldName,
      title: fieldSettings.title || DEFAULT_FIELD_SETTINGS.title,
      type: "textline",
      editui: "text",
      contents: "A",
      x: toFiniteNumber(fieldSettings.x, DEFAULT_FIELD_SETTINGS.x),
      y: toFiniteNumber(fieldSettings.y, DEFAULT_FIELD_SETTINGS.y),
      w: toFiniteNumber(fieldSettings.w, DEFAULT_FIELD_SETTINGS.w),
      maxw: `${fieldName}.width`,
      h: "auto",
      hideable: false,
      autoShrink: false,
      shrinkLimit: 0.5,
      align: 1,
      fontNr: toFiniteNumber(fieldSettings.fontNr, DEFAULT_FIELD_SETTINGS.fontNr),
      fontSize: toFiniteNumber(
        fieldSettings.fontSize,
        DEFAULT_FIELD_SETTINGS.fontSize,
      ),
      color: toFiniteNumber(fieldSettings.color, DEFAULT_FIELD_SETTINGS.color),
      editable: true,
      spacing: 0,
      kern: true,
    }),
    [fieldName, fieldSettings],
  );
  const fieldJson = React.useMemo(
    () => JSON.stringify(fontField, null, 2),
    [fontField],
  );

  React.useEffect(() => {
    if (!generatedFont) return undefined;

    const style = document.createElement("style");
    style.id = PREVIEW_STYLE_ID;
    style.textContent = `
      @font-face {
        font-family: '${generatedFont.fontFamily}';
        src: url('${generatedFont.url}') format('truetype');
        font-display: block;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById(PREVIEW_STYLE_ID)?.remove();
      URL.revokeObjectURL(generatedFont.url);
    };
  }, [generatedFont]);

  const resetGeneratedFont = () => {
    setGeneratedFont(null);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    resetGeneratedFont();
    setError("");
    setSvgText("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".svg")) {
      setSelectedFile(null);
      setError("Please select an SVG file (.svg extension required).");
      return;
    }

    try {
      const text = await file.text();
      setSelectedFile(file);
      setSvgText(text);
    } catch (err) {
      setSelectedFile(null);
      setError(`Could not read SVG file: ${err.message}`);
    }
  };

  const processSvg = async () => {
    if (!svgText) return;

    resetGeneratedFont();
    setIsProcessing(true);
    setError("");

    try {
      const result = createTtfFromSvg(svgText);
      const blob = new Blob([result.bytes], { type: "font/ttf" });
      const url = URL.createObjectURL(blob);

      setGeneratedFont({
        ...result,
        url,
      });
    } catch (err) {
      setError(err.message || "Could not convert SVG to TTF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFont = () => {
    if (!generatedFont) return;

    const link = document.createElement("a");
    link.href = generatedFont.url;
    link.download = generatedFont.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateFieldSetting = (key, value) => {
    setFieldCopied(false);
    setFieldSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const copyFieldJson = async () => {
    await navigator.clipboard.writeText(fieldJson);
    setFieldCopied(true);
  };

  const downloadFieldJson = () => {
    const blob = new Blob([fieldJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "font-field.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              SVG to TTF Tool
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Import one SVG and create a font where the SVG is the letter A.
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              1. Select SVG File
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Choose a simple vector SVG. Filled paths work best; text, images,
              filters, masks, and unexpanded strokes may not convert cleanly.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept=".svg,image/svg+xml"
                style={{ display: "none" }}
                id="svg-font-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="svg-font-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Select SVG File
                </Button>
              </label>

              {selectedFile && (
                <Chip
                  label={selectedFile.name}
                  color="success"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>

          {selectedFile && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                2. Generate Font
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The generated font contains `.notdef`, space, and uppercase A
                mapped to Unicode U+0041.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={processSvg}
                disabled={isProcessing || !svgText}
                sx={{ mb: 2 }}
              >
                {isProcessing ? "Generating..." : "Convert to TTF"}
              </Button>

              {isProcessing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Converting SVG paths to a TrueType glyph...
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {generatedFont && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                3. Preview and Download
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Preview the generated glyph and download the TTF file.
              </Typography>

              {generatedFont.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  {generatedFont.warnings.join(" ")}
                </Alert>
              )}

              <Box
                sx={{
                  p: 4,
                  mb: 3,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: `'${generatedFont.fontFamily}', sans-serif`,
                    fontSize: { xs: "8rem", md: "12rem" },
                    lineHeight: 1,
                  }}
                >
                  {generatedFont.glyph}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={downloadFont}
                >
                  Download {generatedFont.fileName}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>
              </Box>
            </Paper>
          )}

          {generatedFont && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                4. Generate Font Field
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Set the document size, font index, position, and font size to
                create a paste-ready `font-field.json` textline object.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="Document width"
                  type="number"
                  value={fieldSettings.documentWidth}
                  onChange={(event) =>
                    updateFieldSetting("documentWidth", event.target.value)
                  }
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Document height"
                  type="number"
                  value={fieldSettings.documentHeight}
                  onChange={(event) =>
                    updateFieldSetting("documentHeight", event.target.value)
                  }
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Font number"
                  type="number"
                  value={fieldSettings.fontNr}
                  onChange={(event) =>
                    updateFieldSetting("fontNr", event.target.value)
                  }
                  helperText="Index from the app after uploading the TTF"
                />
                <TextField
                  label="Color index"
                  type="number"
                  value={fieldSettings.color}
                  onChange={(event) =>
                    updateFieldSetting("color", event.target.value)
                  }
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Field name"
                  value={fieldSettings.name}
                  onChange={(event) =>
                    updateFieldSetting("name", event.target.value)
                  }
                />
                <TextField
                  label="Title"
                  value={fieldSettings.title}
                  onChange={(event) =>
                    updateFieldSetting("title", event.target.value)
                  }
                />
                <TextField
                  label="X position"
                  type="number"
                  value={fieldSettings.x}
                  onChange={(event) => updateFieldSetting("x", event.target.value)}
                />
                <TextField
                  label="Y position"
                  type="number"
                  value={fieldSettings.y}
                  onChange={(event) => updateFieldSetting("y", event.target.value)}
                />
                <TextField
                  label="Width"
                  type="number"
                  value={fieldSettings.w}
                  onChange={(event) => updateFieldSetting("w", event.target.value)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Font size"
                  type="number"
                  value={fieldSettings.fontSize}
                  onChange={(event) =>
                    updateFieldSetting("fontSize", event.target.value)
                  }
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                Document Preview
              </Typography>
              <Box
                sx={{
                  mb: 3,
                  overflow: "auto",
                  p: 2,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: documentWidth * previewScale,
                    height: documentHeight * previewScale,
                    mx: "auto",
                    backgroundColor: "#fff",
                    border: "1px solid #bbb",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      left: fontField.x * previewScale,
                      top: fontField.y * previewScale,
                      width: fontField.w * previewScale,
                      color: "#000",
                      fontFamily: `'${generatedFont.fontFamily}', sans-serif`,
                      fontSize: fontField.fontSize * previewScale,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    A
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                font-field.json
              </Typography>
              <TextField
                label="Generated font-field.json"
                fullWidth
                multiline
                rows={14}
                value={fieldJson}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  style: {
                    fontSize: "12px",
                    fontFamily: "monospace",
                  },
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button variant="contained" onClick={downloadFieldJson}>
                  Download font-field.json
                </Button>
                <Button variant="outlined" onClick={copyFieldJson}>
                  {fieldCopied ? "Copied!" : "Copy JSON"}
                </Button>
              </Box>
            </Paper>
          )}

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                How SVG to TTF Works
              </Typography>
              <Typography variant="body1" paragraph>
                This tool converts the uploaded SVG paths into one TrueType
                glyph and assigns that glyph to the letter A. Use the downloaded
                font with normal CSS `@font-face` rules or in applications that
                accept TTF uploads.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For reliable results, export the artwork as filled paths from
                Illustrator, Inkscape, Figma, or another vector editor before
                uploading.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
