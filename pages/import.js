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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import { useRouter } from "next/router";
import Header from "../components/Header";
import JSZip from "jszip";

export default function Import() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [generatedFiles, setGeneratedFiles] = React.useState({
    fields: null,
    pages: null,
    styles: null,
    templates: null,
  });
  const [processingStatus, setProcessingStatus] = React.useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith(".idml")) {
        setSelectedFile(file);
        setError("");
        setSuccess(false);
        setGeneratedFiles({
          fields: null,
          pages: null,
          styles: null,
          templates: null,
        });
      } else {
        setError("Please select an IDML file (.idml extension required)");
        setSelectedFile(null);
      }
    }
  };

  const processIDML = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");
    setProcessingStatus("Reading IDML file...");

    try {
      setProcessingStatus("Extracting IDML contents...");

      // Read the IDML file as a ZIP using the imported JSZip
      const zip = new JSZip();
      const contents = await zip.loadAsync(selectedFile);

      setProcessingStatus("Parsing document structure...");

      // Initialize our output structures
      let fieldsData = [];
      let pagesData = [];
      let stylesData = { colors: [], fonts: [], styles: [] };
      let templatesData = [];

      // Extract page dimensions from designmap.xml
      const designMapFile = contents.files["designmap.xml"];
      if (designMapFile) {
        const designMapContent = await designMapFile.async("string");
        const parser = new DOMParser();
        const designMapDoc = parser.parseFromString(
          designMapContent,
          "text/xml"
        );

        // Extract page info (simplified - would need more robust parsing)
        pagesData.push({
          pagenr: 1,
          width: 595.276, // A4 default - would extract from actual document
          height: 841.89,
          spread: false,
          pagecolor: "#fff",
        });
      }

      setProcessingStatus("Extracting colors and fonts...");

      // Extract styles from Preferences.xml and Styles.xml
      const stylesFile = contents.files["Resources/Styles.xml"];
      if (stylesFile) {
        const stylesContent = await stylesFile.async("string");
        const parser = new DOMParser();
        const stylesDoc = parser.parseFromString(stylesContent, "text/xml");

        // Extract colors (simplified parsing)
        const colorElements = stylesDoc.querySelectorAll("Color");
        colorElements.forEach((colorEl, index) => {
          const name = colorEl.getAttribute("Name") || `Color_${index}`;
          const colorSpace = colorEl.getAttribute("Space") || "RGB";

          if (name !== "Black" && name !== "Paper") {
            stylesData.colors.push({
              cmyk: "0,0,0,0",
              name: name,
              rgb: "#000000", // Would extract actual color values
            });
          }
        });

        // Add default colors
        stylesData.colors.unshift(
          {
            cmyk: "0,0,0,100",
            name: "Black",
            rgb: "#000000",
          },
          {
            cmyk: "0,0,0,0",
            name: "Paper",
            rgb: "#ffffff",
          }
        );
      }

      setProcessingStatus("Processing text and layout elements...");

      // Extract fonts from Fonts.xml
      const fontsFile = contents.files["Resources/Fonts.xml"];
      if (fontsFile) {
        const fontsContent = await fontsFile.async("string");
        const parser = new DOMParser();
        const fontsDoc = parser.parseFromString(fontsContent, "text/xml");

        // Extract font information (simplified)
        const fontElements = fontsDoc.querySelectorAll("Font");
        fontElements.forEach((fontEl, index) => {
          const fontName = fontEl.getAttribute("FontFamily") || `Font_${index}`;
          stylesData.fonts.push({
            name: fontName,
            style: "normal",
            weight: 400,
            ascender: 800,
            descender: -200,
            lineGap: 0,
            ttfurl: `https://fonts.example.com/${fontName}.ttf`, // Placeholder
          });
        });
      }

      setProcessingStatus("Processing spreads and extracting elements...");

      // First, extract text content from Stories
      const storyFiles = Object.keys(contents.files).filter((name) =>
        name.startsWith("Stories/")
      );

      const storyTexts = {};
      for (const storyFileName of storyFiles) {
        try {
          const storyFile = contents.files[storyFileName];
          const storyContent = await storyFile.async("string");
          const parser = new DOMParser();
          const storyDoc = parser.parseFromString(storyContent, "text/xml");

          // Extract text content from story
          const textElements = storyDoc.querySelectorAll("Content");
          let fullText = "";
          textElements.forEach((el) => {
            const text = el.textContent || "";
            if (text.trim()) {
              fullText += text + " ";
            }
          });

          // Store by story ID for later reference
          const storyId = storyFileName.replace(/^Stories\/|\.xml$/g, "");
          storyTexts[storyId] = fullText.trim();
        } catch (err) {
          console.warn(`Could not parse story file ${storyFileName}:`, err);
        }
      }

      // Process spreads to extract layout elements
      const spreadFiles = Object.keys(contents.files).filter((name) =>
        name.startsWith("Spreads/")
      );

      let textFrameCounter = 0;
      let imageFrameCounter = 0;
      let shapeCounter = 0;

      for (const spreadFileName of spreadFiles) {
        const spreadFile = contents.files[spreadFileName];
        const spreadContent = await spreadFile.async("string");
        const parser = new DOMParser();
        const spreadDoc = parser.parseFromString(spreadContent, "text/xml");

        // Extract text frames -> textblock fields
        const textFrames = spreadDoc.querySelectorAll("TextFrame");
        console.log(
          `Found ${textFrames.length} text frames in ${spreadFileName}`
        );

        textFrames.forEach((frame, index) => {
          // Debug: Log all attributes to see what's available
          console.log(
            `Text frame ${index} attributes:`,
            Array.from(frame.attributes).map(
              (attr) => `${attr.name}="${attr.value}"`
            )
          );

          let bounds = frame.getAttribute("GeometricBounds");

          // Try alternative attribute names
          if (!bounds) {
            bounds =
              frame.getAttribute("ItemGeometry") ||
              frame.getAttribute("PathGeometry") ||
              frame.getAttribute("VisibleBounds") ||
              frame.getAttribute("GeometryPathType");
            console.log(
              `Text frame ${index}: trying alternative bounds = ${bounds}`
            );
          }

          // Try to find bounds in child elements
          if (!bounds) {
            const pathGeometry = frame.querySelector(
              "PathGeometry, ItemGeometry, Properties"
            );
            if (pathGeometry) {
              bounds =
                pathGeometry.getAttribute("GeometricBounds") ||
                pathGeometry.getAttribute("VisibleBounds") ||
                pathGeometry.getAttribute("PathBounds");
              console.log(
                `Text frame ${index}: found bounds in child element = ${bounds}`
              );
            }
          }

          // Try to extract from nested elements
          if (!bounds) {
            const properties = frame.querySelector("Properties");
            if (properties) {
              console.log(
                `Text frame ${index} Properties attributes:`,
                Array.from(properties.attributes).map(
                  (attr) => `${attr.name}="${attr.value}"`
                )
              );
              bounds = properties.getAttribute("GeometricBounds");
            }
          }

          // NEW: Try to extract from ItemTransform matrix
          let x = 0,
            y = 0,
            w = 100,
            h = 20; // Default dimensions
          if (!bounds) {
            const itemTransform = frame.getAttribute("ItemTransform");
            if (itemTransform) {
              console.log(
                `Text frame ${index}: ItemTransform = ${itemTransform}`
              );
              const transformParts = itemTransform.split(" ").map(Number);
              if (transformParts.length >= 6) {
                // Transform matrix: [scaleX skewY skewX scaleY translateX translateY]
                const [scaleX, skewY, skewX, scaleY, translateX, translateY] =
                  transformParts;
                x = translateX;
                y = translateY;

                // For text frames, we need to estimate size or look for other clues
                // Check if there are any path points or try to get dimensions from story content
                const pathGeometry = frame.querySelector("PathGeometry");
                if (pathGeometry) {
                  const pathPointsArray =
                    pathGeometry.querySelector("PathPointArray");
                  if (pathPointsArray) {
                    const pathPoints =
                      pathPointsArray.querySelectorAll("PathPointType");
                    if (pathPoints.length >= 4) {
                      // Extract bounds from path points
                      const points = Array.from(pathPoints)
                        .map((point) => {
                          const anchor = point.getAttribute("Anchor");
                          if (anchor) {
                            const [px, py] = anchor.split(" ").map(Number);
                            return { x: px, y: py };
                          }
                          return null;
                        })
                        .filter(Boolean);

                      if (points.length >= 2) {
                        const xs = points.map((p) => p.x);
                        const ys = points.map((p) => p.y);
                        const minX = Math.min(...xs);
                        const minY = Math.min(...ys);
                        const maxX = Math.max(...xs);
                        const maxY = Math.max(...ys);

                        x = translateX + minX;
                        y = translateY + minY;
                        w = maxX - minX;
                        h = maxY - minY;

                        console.log(
                          `Text frame ${index}: Extracted from path points - x=${x}, y=${y}, w=${w}, h=${h}`
                        );
                      }
                    }
                  }
                }

                // If we still don't have good dimensions, use defaults based on content
                if (w <= 1 || h <= 1) {
                  w = 200; // Default text frame width
                  h = 30; // Default text frame height
                }

                // Create bounds string for compatibility with existing logic
                bounds = `${y} ${x} ${y + h} ${x + w}`;
                console.log(
                  `Text frame ${index}: Created bounds from transform = ${bounds}`
                );
              }
            }
          }

          console.log(`Text frame ${index}: final bounds = ${bounds}`);

          if (bounds) {
            try {
              textFrameCounter++;
              const boundsParts = bounds.split(" ");
              console.log(`Text frame ${index}: bounds parts = ${boundsParts}`);

              if (boundsParts.length >= 4) {
                const [y1, x1, y2, x2] = boundsParts.map(Number);

                console.log(
                  `Parsed bounds: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`
                );

                // Try to extract text content from the frame
                let textContent = "Sample text content";

                // First, try to get story reference
                const storyRef = frame.getAttribute("ParentStory");
                if (storyRef && storyTexts[storyRef]) {
                  textContent = storyTexts[storyRef];
                  console.log(
                    `Found story text: ${textContent.substring(0, 50)}...`
                  );
                } else {
                  // Fallback: try to extract from local content
                  const contentElements = frame.querySelectorAll("Content");
                  if (contentElements.length > 0) {
                    textContent =
                      Array.from(contentElements)
                        .map((el) => el.textContent || "")
                        .join(" ")
                        .trim() || textContent;
                    console.log(
                      `Found local text: ${textContent.substring(0, 50)}...`
                    );
                  }
                }

                // Try to get text properties
                const characterElements = frame.querySelectorAll(
                  "CharacterStyleRange"
                );
                let fontSize = 12;
                let fontFamily = "";

                if (characterElements.length > 0) {
                  const firstChar = characterElements[0];
                  const properties = firstChar.querySelector("Properties");
                  if (properties) {
                    const appliedFont = properties.getAttribute("AppliedFont");
                    const pointSize = properties.getAttribute("PointSize");
                    if (pointSize) fontSize = Math.round(parseFloat(pointSize));
                    if (appliedFont)
                      fontFamily = appliedFont.replace(/\t.*/, ""); // Remove style suffix
                  }
                }

                const textField = {
                  name: `Text_${textFrameCounter}`,
                  title: `Text Block ${textFrameCounter}`,
                  type: "textblock",
                  contents: textContent,
                  x: Math.round(x1),
                  y: Math.round(y1),
                  w: Math.round(x2 - x1),
                  h: Math.round(y2 - y1),
                  fontSize: fontSize,
                  fontNr: 0, // Will map to fonts array index
                  color: 0, // Will map to colors array index
                  editable: true,
                  editui: "text",
                  align: 1, // Left align by default
                  kern: true,
                  spacing: 0,
                  hideable: false,
                };

                console.log(`Adding text field:`, textField);
                fieldsData.push(textField);
              } else {
                console.log(
                  `Text frame ${index}: invalid bounds format (expected 4 values, got ${boundsParts.length})`
                );
              }
            } catch (err) {
              console.error(`Error processing text frame ${index}:`, err);
            }
          } else {
            console.log(`Text frame ${index} has no bounds`);
          }
        });

        // Extract rectangles with images -> fleximage fields
        const imageFrames = spreadDoc.querySelectorAll("Rectangle");
        console.log(
          `Found ${imageFrames.length} rectangles in ${spreadFileName}`
        );

        imageFrames.forEach((frame, index) => {
          // Debug: Log all attributes to see what's available
          console.log(
            `Rectangle ${index} attributes:`,
            Array.from(frame.attributes).map(
              (attr) => `${attr.name}="${attr.value}"`
            )
          );

          let bounds = frame.getAttribute("GeometricBounds");

          // Try alternative attribute names
          if (!bounds) {
            bounds =
              frame.getAttribute("ItemGeometry") ||
              frame.getAttribute("PathGeometry") ||
              frame.getAttribute("VisibleBounds") ||
              frame.getAttribute("GeometryPathType");
            console.log(
              `Rectangle ${index}: trying alternative bounds = ${bounds}`
            );
          }

          // Try to find bounds in child elements
          if (!bounds) {
            const pathGeometry = frame.querySelector(
              "PathGeometry, ItemGeometry, Properties"
            );
            if (pathGeometry) {
              bounds =
                pathGeometry.getAttribute("GeometricBounds") ||
                pathGeometry.getAttribute("VisibleBounds") ||
                pathGeometry.getAttribute("PathBounds");
              console.log(
                `Rectangle ${index}: found bounds in child element = ${bounds}`
              );
            }
          }

          // NEW: Try to extract from ItemTransform matrix
          let x = 0,
            y = 0,
            w = 100,
            h = 100; // Default dimensions for rectangles
          if (!bounds) {
            const itemTransform = frame.getAttribute("ItemTransform");
            if (itemTransform) {
              console.log(
                `Rectangle ${index}: ItemTransform = ${itemTransform}`
              );
              const transformParts = itemTransform.split(" ").map(Number);
              if (transformParts.length >= 6) {
                // Transform matrix: [scaleX skewY skewX scaleY translateX translateY]
                const [scaleX, skewY, skewX, scaleY, translateX, translateY] =
                  transformParts;
                x = translateX;
                y = translateY;

                // For rectangles, try to get dimensions from path points
                const pathGeometry = frame.querySelector("PathGeometry");
                if (pathGeometry) {
                  const pathPointsArray =
                    pathGeometry.querySelector("PathPointArray");
                  if (pathPointsArray) {
                    const pathPoints =
                      pathPointsArray.querySelectorAll("PathPointType");
                    if (pathPoints.length >= 4) {
                      // Extract bounds from path points
                      const points = Array.from(pathPoints)
                        .map((point) => {
                          const anchor = point.getAttribute("Anchor");
                          if (anchor) {
                            const [px, py] = anchor.split(" ").map(Number);
                            return { x: px, y: py };
                          }
                          return null;
                        })
                        .filter(Boolean);

                      if (points.length >= 2) {
                        const xs = points.map((p) => p.x);
                        const ys = points.map((p) => p.y);
                        const minX = Math.min(...xs);
                        const minY = Math.min(...ys);
                        const maxX = Math.max(...xs);
                        const maxY = Math.max(...ys);

                        x = translateX + minX;
                        y = translateY + minY;
                        w = maxX - minX;
                        h = maxY - minY;

                        console.log(
                          `Rectangle ${index}: Extracted from path points - x=${x}, y=${y}, w=${w}, h=${h}`
                        );
                      }
                    }
                  }
                }

                // If we still don't have good dimensions, use defaults
                if (w <= 1 || h <= 1) {
                  w = 100; // Default rectangle width
                  h = 100; // Default rectangle height
                }

                // Create bounds string for compatibility with existing logic
                bounds = `${y} ${x} ${y + h} ${x + w}`;
                console.log(
                  `Rectangle ${index}: Created bounds from transform = ${bounds}`
                );
              }
            }
          }

          console.log(`Rectangle ${index}: final bounds = ${bounds}`);

          if (bounds) {
            try {
              // Check if this rectangle contains an image (has Image child or link)
              const hasImageChild = frame.querySelector("Image");
              const hasLinkChild = frame.querySelector("Link");
              const hasEPS = frame.querySelector("EPS");
              const hasPDF = frame.querySelector("PDF");
              const hasWMF = frame.querySelector("WMF");
              const contentType = frame.getAttribute("ContentType");
              const hasLocalDisplaySetting = frame.hasAttribute(
                "LocalDisplaySetting"
              );
              const hasGraphicLine = frame.querySelector("GraphicLine");

              console.log(`Rectangle ${index} checks:`, {
                hasImageChild: !!hasImageChild,
                hasLinkChild: !!hasLinkChild,
                hasEPS: !!hasEPS,
                hasPDF: !!hasPDF,
                hasWMF: !!hasWMF,
                contentType,
                hasLocalDisplaySetting,
                hasGraphicLine: !!hasGraphicLine,
              });

              const hasImage =
                hasImageChild ||
                hasLinkChild ||
                hasEPS ||
                hasPDF ||
                hasWMF ||
                contentType === "GraphicType" ||
                hasLocalDisplaySetting ||
                hasGraphicLine;

              const boundsParts = bounds.split(" ");
              console.log(`Rectangle ${index}: bounds parts = ${boundsParts}`);

              if (boundsParts.length >= 4) {
                const [y1, x1, y2, x2] = boundsParts.map(Number);
                console.log(
                  `Rectangle ${index} parsed bounds: x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`
                );

                if (hasImage) {
                  imageFrameCounter++;
                  console.log(`Processing as image frame ${imageFrameCounter}`);

                  // Try to extract image source information
                  let imageSrc = "https://assets.example.com/placeholder.pdf";
                  const imageElement = frame.querySelector("Image");
                  const linkElement = frame.querySelector("Link");

                  if (linkElement) {
                    const linkResource =
                      linkElement.getAttribute("LinkResourceURI") ||
                      linkElement.getAttribute("StoredState");
                    if (linkResource) {
                      imageSrc = linkResource; // This would be the original image path
                    }
                  }

                  const imageField = {
                    name: `Image_${imageFrameCounter}`,
                    title: `Image ${imageFrameCounter}`,
                    type: "fleximage",
                    dpi: 300,
                    displayDPI: 150,
                    editable: true,
                    browse: true,
                    allowUpload: true,
                    hideable: false,
                    editui: "browse",
                    size: "cover",
                    x: Math.round(x1),
                    y: Math.round(y1),
                    w: Math.round(x2 - x1),
                    h: Math.round(y2 - y1),
                    srcpdf: imageSrc,
                    options: [
                      {
                        displayDPI: 72,
                        dpi: 300,
                        selected: true,
                        srcpdf: imageSrc,
                        fit: false,
                      },
                    ],
                  };

                  console.log(`Adding image field:`, imageField);
                  fieldsData.push(imageField);
                } else {
                  // This is a shape rectangle (only if it has fill/stroke properties)
                  const fillColor = frame.getAttribute("FillColor");
                  const strokeColor = frame.getAttribute("StrokeColor");
                  const hasProperties = frame.querySelector("Properties");

                  console.log(`Rectangle ${index} shape checks:`, {
                    fillColor,
                    strokeColor,
                    hasProperties: !!hasProperties,
                  });

                  const hasFill = fillColor || strokeColor || hasProperties;

                  if (hasFill) {
                    shapeCounter++;
                    console.log(`Processing as shape ${shapeCounter}`);

                    const shapeField = {
                      name: `Shape_${shapeCounter}`,
                      title: `Rectangle ${shapeCounter}`,
                      type: "shape",
                      shape: "rect",
                      x: Math.round(x1),
                      y: Math.round(y1),
                      w: Math.round(x2 - x1),
                      h: Math.round(y2 - y1),
                      color: 0, // Will map to color index
                      editable: true,
                    };

                    console.log(`Adding shape field:`, shapeField);
                    fieldsData.push(shapeField);
                  } else {
                    console.log(
                      `Rectangle ${index} has no fill/stroke, skipping`
                    );
                  }
                }
              } else {
                console.log(
                  `Rectangle ${index}: invalid bounds format (expected 4 values, got ${boundsParts.length})`
                );
              }
            } catch (err) {
              console.error(`Error processing rectangle ${index}:`, err);
            }
          } else {
            console.log(`Rectangle ${index} has no bounds`);
          }
        });

        // Extract oval shapes -> circle fields
        const ovals = spreadDoc.querySelectorAll("Oval");
        console.log(`Found ${ovals.length} ovals in ${spreadFileName}`);

        ovals.forEach((oval, index) => {
          const bounds = oval.getAttribute("GeometricBounds");
          if (bounds) {
            shapeCounter++;
            const [y1, x1, y2, x2] = bounds.split(" ").map(Number);

            fieldsData.push({
              name: `Circle_${shapeCounter}`,
              title: `Circle ${shapeCounter}`,
              type: "shape",
              shape: "circle",
              x: Math.round(x1),
              y: Math.round(y1),
              w: Math.round(x2 - x1),
              h: Math.round(y2 - y1),
              color: 0,
              editable: true,
            });
          }
        });

        // Extract polygon shapes -> shape fields
        const polygons = spreadDoc.querySelectorAll("Polygon");
        polygons.forEach((polygon, index) => {
          const bounds = polygon.getAttribute("GeometricBounds");
          if (bounds) {
            shapeCounter++;
            const [y1, x1, y2, x2] = bounds.split(" ").map(Number);

            fieldsData.push({
              name: `Shape_${shapeCounter}`,
              title: `Polygon ${shapeCounter}`,
              type: "shape",
              shape: "rect", // Default to rect for complex shapes
              x: Math.round(x1),
              y: Math.round(y1),
              w: Math.round(x2 - x1),
              h: Math.round(y2 - y1),
              color: 0,
              editable: true,
            });
          }
        });
      }

      console.log(
        `Extracted elements: ${textFrameCounter} text frames, ${imageFrameCounter} images, ${shapeCounter} shapes`
      );
      console.log(`Total fields in array before wrapping:`, fieldsData.length);
      console.log(`Fields data:`, fieldsData);

      setProcessingStatus("Generating final JSON structure...");

      // Create templates data
      templatesData.push({
        name: "Standard Template",
        filenameSuffix: "_imported",
        printPresetCode: "PRINTER_RGB_X4",
      });

      // Wrap fields in page structure
      const finalFieldsData = [
        {
          pagenr: 1,
          fields: fieldsData,
        },
      ];

      console.log(`Final fields data structure:`, finalFieldsData);

      setProcessingStatus(
        `Import completed! Found ${textFrameCounter} text blocks, ${imageFrameCounter} images, and ${shapeCounter} shapes.`
      );

      setGeneratedFiles({
        fields: JSON.stringify(finalFieldsData, null, 2),
        pages: JSON.stringify(pagesData, null, 2),
        styles: JSON.stringify(stylesData, null, 2),
        templates: JSON.stringify(templatesData, null, 2),
      });

      setSuccess(true);
    } catch (err) {
      console.error("IDML processing error:", err);
      setError(`Error processing IDML file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    Object.entries(generatedFiles).forEach(([key, content]) => {
      if (content) {
        downloadFile(content, `${key}.json`);
      }
    });
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              IDML Import Tool
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Transform your InDesign layouts into web-to-print JSON templates
            </Typography>
          </Box>

          {/* Upload Section */}
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              1. Select IDML File
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Choose an IDML file exported from Adobe InDesign to convert into
              your JSON template structure.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept=".idml"
                style={{ display: "none" }}
                id="idml-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="idml-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Select IDML File
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

          {/* Processing Section */}
          {selectedFile && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                2. Process IDML
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Click to analyze the IDML file and generate your JSON template
                files.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={processIDML}
                disabled={isProcessing || !selectedFile}
                sx={{ mb: 2 }}
              >
                {isProcessing ? "Processing..." : "Convert to JSON"}
              </Button>

              {isProcessing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {processingStatus}
                  </Typography>
                </Box>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  IDML file successfully converted! Download your JSON files
                  below.
                </Alert>
              )}
            </Paper>
          )}

          {/* Results Section */}
          {success && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                3. Download Generated Files
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your IDML has been converted into the four required JSON files
                for your web-to-print system.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={downloadAll}
                  sx={{ mr: 2 }}
                >
                  Download All Files
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>
              </Box>

              {/* File Previews */}
              <Box>
                {Object.entries(generatedFiles).map(
                  ([key, content]) =>
                    content && (
                      <Accordion key={key} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">
                            {key}.json
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(content, `${key}.json`);
                              }}
                              sx={{ ml: 2 }}
                            >
                              Download
                            </Button>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TextField
                            fullWidth
                            multiline
                            rows={10}
                            value={content}
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                              style: {
                                fontSize: "12px",
                                fontFamily: "monospace",
                              },
                            }}
                          />
                        </AccordionDetails>
                      </Accordion>
                    )
                )}
              </Box>
            </Paper>
          )}

          {/* Information Section */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                How IDML Import Works
              </Typography>
              <Typography variant="body1" paragraph>
                This tool reads IDML files (InDesign Markup Language) and
                extracts design elements to generate the four JSON files
                required for your web-to-print system:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>fields.json</strong> - Contains all layout elements
                  (text, images, shapes) with positioning and properties
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>pages.json</strong> - Defines page dimensions and
                  properties
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>styles.json</strong> - Includes colors, fonts, and
                  text styles from your design
                </Typography>
                <Typography component="li" variant="body2">
                  <strong>templates.json</strong> - Template configuration for
                  print settings
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
