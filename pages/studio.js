import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  CropSquare as RectangleIcon,
  Circle as CircleIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Studio() {
  const router = useRouter();
  const canvasRef = React.useRef(null);
  const [canvas, setCanvas] = React.useState(null);
  const [selectedElement, setSelectedElement] = React.useState(null);
  const [canvasWidth, setCanvasWidth] = React.useState(800);
  const [canvasHeight, setCanvasHeight] = React.useState(600);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = React.useState(false);
  const [generatedJson, setGeneratedJson] = React.useState("");
  const [starterTemplates, setStarterTemplates] = React.useState([]);

  // Element properties
  const [elementProps, setElementProps] = React.useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fontSize: 16,
    fontFamily: "Arial",
    color: "#000000",
    backgroundColor: "#ffffff",
    text: "Sample Text",
    opacity: 1,
  });

  // Available colors for the palette
  const colorPalette = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#808080",
    "#ffa500",
    "#800080",
    "#008000",
    "#000080",
    "#800000",
    "#808000",
  ];

  // Load starter templates
  React.useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch("/starter-templates.json");
        const templates = await response.json();
        setStarterTemplates(templates);
      } catch (error) {
        console.error("Error loading starter templates:", error);
        // Fallback templates
        setStarterTemplates([
          {
            id: "blank",
            name: "Blank Canvas",
            description: "Start from scratch",
            elements: [],
          },
        ]);
      }
    };
    loadTemplates();
  }, []);

  // Initialize Fabric.js canvas
  React.useEffect(() => {
    if (typeof window !== "undefined" && canvasRef.current) {
      const initCanvas = async () => {
        try {
          const fabric = await import("fabric");

          if (!fabric || !fabric.Canvas) {
            throw new Error("Fabric.js Canvas not available");
          }

          const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: "#ffffff",
          });

          console.log(
            "Canvas initialized with dimensions:",
            canvasWidth,
            canvasHeight
          );

          fabricCanvas.on("selection:created", (e) => {
            handleElementSelect(e.selected[0]);
          });

          fabricCanvas.on("selection:updated", (e) => {
            handleElementSelect(e.selected[0]);
          });

          fabricCanvas.on("selection:cleared", () => {
            setSelectedElement(null);
          });

          fabricCanvas.on("object:modified", (e) => {
            updateElementProperties(e.target);
          });

          setCanvas(fabricCanvas);

          return () => {
            fabricCanvas.dispose();
          };
        } catch (error) {
          console.error("Error loading Fabric.js:", error);
        }
      };

      initCanvas();
    }
  }, []);

  // Update canvas dimensions when width/height change
  React.useEffect(() => {
    if (canvas && canvasRef.current) {
      console.log(
        "Updating canvas dimensions:",
        canvasWidth,
        "x",
        canvasHeight
      );
      console.log(
        "Current canvas size:",
        canvas.getWidth(),
        "x",
        canvas.getHeight()
      );

      // Set canvas dimensions using proper Fabric.js methods
      canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });

      // Update the container and canvas element directly
      const canvasContainer = canvas.getElement().parentNode;
      if (canvasContainer) {
        canvasContainer.style.width = canvasWidth + "px";
        canvasContainer.style.height = canvasHeight + "px";
      }

      // Set canvas element attributes
      canvas.getElement().width = canvasWidth;
      canvas.getElement().height = canvasHeight;
      canvas.getElement().style.width = canvasWidth + "px";
      canvas.getElement().style.height = canvasHeight + "px";

      // Force canvas to recalculate and re-render
      canvas.calcOffset();
      canvas.renderAll();

      console.log(
        "Canvas updated to:",
        canvas.getWidth(),
        "x",
        canvas.getHeight()
      );
    }
  }, [canvas, canvasWidth, canvasHeight]);

  const handleElementSelect = (element) => {
    if (element) {
      setSelectedElement(element);
      setElementProps({
        x: Math.round(element.left || 0),
        y: Math.round(element.top || 0),
        width: Math.round(element.width * (element.scaleX || 1)),
        height: Math.round(element.height * (element.scaleY || 1)),
        fontSize: element.fontSize || 16,
        fontFamily: element.fontFamily || "Arial",
        color: element.fill || "#000000",
        backgroundColor: element.backgroundColor || "transparent",
        text: element.text || "",
        opacity: element.opacity || 1,
      });
    }
  };

  const updateElementProperties = (element) => {
    if (element) {
      setElementProps((prev) => ({
        ...prev,
        x: Math.round(element.left || 0),
        y: Math.round(element.top || 0),
        width: Math.round(element.width * (element.scaleX || 1)),
        height: Math.round(element.height * (element.scaleY || 1)),
      }));
    }
  };

  // Add text block
  const addTextBlock = async () => {
    if (canvas && typeof window !== "undefined") {
      try {
        const fabric = await import("fabric");

        const text = new fabric.Textbox("Your text here", {
          left: 50,
          top: 50,
          width: 200,
          fontSize: 16,
          fontFamily: "Arial",
          fill: "#000000",
          editable: true,
        });

        text.elementType = "textblock";
        canvas.add(text);
        canvas.setActiveObject(text);
      } catch (error) {
        console.error("Error adding text block:", error);
      }
    }
  };

  // Add image placeholder
  const addImage = async () => {
    if (canvas && typeof window !== "undefined") {
      try {
        const fabric = await import("fabric");

        const rect = new fabric.Rect({
          left: 50,
          top: 50,
          width: 150,
          height: 100,
          fill: "#e0e0e0",
          stroke: "#cccccc",
          strokeWidth: 2,
          strokeDashArray: [5, 5],
        });

        const text = new fabric.Text("Image Placeholder", {
          left: 125,
          top: 100,
          fontSize: 12,
          fill: "#666666",
          originX: "center",
          originY: "center",
        });

        const group = new fabric.Group([rect, text], {
          left: 50,
          top: 50,
        });

        group.elementType = "fleximage";
        canvas.add(group);
        canvas.setActiveObject(group);
      } catch (error) {
        console.error("Error adding image:", error);
      }
    }
  };

  // Add rectangle
  const addRectangle = async () => {
    if (canvas && typeof window !== "undefined") {
      try {
        const fabric = await import("fabric");

        const rect = new fabric.Rect({
          left: 50,
          top: 50,
          width: 100,
          height: 80,
          fill: "#3f51b5",
          stroke: "#1a237e",
          strokeWidth: 1,
        });

        rect.elementType = "shape";
        rect.shapeType = "rect";
        canvas.add(rect);
        canvas.setActiveObject(rect);
      } catch (error) {
        console.error("Error adding rectangle:", error);
      }
    }
  };

  // Add circle
  const addCircle = async () => {
    if (canvas && typeof window !== "undefined") {
      try {
        const fabric = await import("fabric");

        const circle = new fabric.Circle({
          left: 50,
          top: 50,
          radius: 40,
          fill: "#4caf50",
          stroke: "#2e7d32",
          strokeWidth: 1,
        });

        circle.elementType = "shape";
        circle.shapeType = "circle";
        canvas.add(circle);
        canvas.setActiveObject(circle);
      } catch (error) {
        console.error("Error adding circle:", error);
      }
    }
  };

  // Update selected element property
  const updateProperty = (property, value) => {
    if (selectedElement && canvas) {
      const updates = { [property]: value };

      if (property === "x") updates.left = value;
      if (property === "y") updates.top = value;
      if (property === "color") updates.fill = value;
      if (property === "text") updates.text = value;

      selectedElement.set(updates);
      canvas.renderAll();

      setElementProps((prev) => ({ ...prev, [property]: value }));
    }
  };

  // Delete selected element
  const deleteElement = () => {
    if (selectedElement && canvas) {
      canvas.remove(selectedElement);
      setSelectedElement(null);
    }
  };

  // Export to JSON
  const exportToJson = () => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    const fields = [];
    const pages = [
      {
        width: canvasWidth,
        height: canvasHeight,
        bleed: 0,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    ];
    const styles = {
      colors: colorPalette.map((color, index) => ({
        cmyk: "0,0,0,100",
        name: `Color_${index}`,
        rgb: color,
      })),
      fonts: [
        {
          name: "Arial",
          style: "normal",
          weight: 400,
          ascender: 800,
          descender: -200,
          lineGap: 0,
          ttfurl: "https://fonts.example.com/arial.ttf",
        },
      ],
    };
    const templates = [
      {
        name: "Studio Template",
        description: "Created with Studio visual builder",
        category: "custom",
        print: {
          format: "A4",
          orientation: "portrait",
          dpi: 300,
        },
      },
    ];

    objects.forEach((obj, index) => {
      const field = {
        name: `Element_${index + 1}`,
        x: Math.round(obj.left || 0),
        y: Math.round(obj.top || 0),
        w: Math.round((obj.width || 100) * (obj.scaleX || 1)),
        h: Math.round((obj.height || 100) * (obj.scaleY || 1)),
        editable: true,
      };

      if (obj.elementType === "textblock") {
        field.type = "textblock";
        field.contents = obj.text || "Sample text";
        field.fontSize = obj.fontSize || 16;
        field.fontFamily = obj.fontFamily || "Arial";
        field.color = obj.fill || "#000000";
        field.align = 0; // left align
      } else if (obj.elementType === "fleximage") {
        field.type = "fleximage";
        field.dpi = 300;
        field.displayDPI = 144;
        field.size = "cover";
        field.browse = true;
        field.allowUpload = true;
      } else if (obj.elementType === "shape") {
        field.type = "shape";
        field.shape = obj.shapeType || "rect";
        field.color = obj.fill || "#000000";
      }

      fields.push(field);
    });

    const exportData = {
      fields: [{ pagenr: 1, fields }],
      pages,
      styles,
      templates,
    };

    setGeneratedJson(JSON.stringify(exportData, null, 2));
    setShowExportDialog(true);
  };

  // Load template
  const loadTemplate = async (template) => {
    if (!canvas || typeof window === "undefined") return;

    try {
      const fabric = await import("fabric");

      // Clear existing canvas
      canvas.clear();

      // Load template elements
      template.elements.forEach((element) => {
        let fabricObject;

        switch (element.type) {
          case "textblock":
            fabricObject = new fabric.Textbox(element.text || "Sample Text", {
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || "Arial",
              fill: element.color || "#000000",
              fontWeight: element.fontWeight || "normal",
            });
            fabricObject.elementType = "textblock";
            break;

          case "fleximage":
            const rect = new fabric.Rect({
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fill: "#e0e0e0",
              stroke: "#cccccc",
              strokeWidth: 2,
              strokeDashArray: [5, 5],
            });

            const text = new fabric.Text(element.placeholder || "Image", {
              left: element.x + element.width / 2,
              top: element.y + element.height / 2,
              fontSize: 12,
              fill: "#666666",
              originX: "center",
              originY: "center",
            });

            fabricObject = new fabric.Group([rect, text], {
              left: element.x,
              top: element.y,
            });
            fabricObject.elementType = "fleximage";
            break;

          case "shape":
            if (element.shape === "circle") {
              fabricObject = new fabric.Circle({
                left: element.x,
                top: element.y,
                radius: Math.min(element.width, element.height) / 2,
                fill: element.color || "#3f51b5",
              });
            } else {
              fabricObject = new fabric.Rect({
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fill: element.color || "#3f51b5",
              });
            }
            fabricObject.elementType = "shape";
            fabricObject.shapeType = element.shape || "rect";
            break;

          default:
            return;
        }

        if (fabricObject) {
          canvas.add(fabricObject);
        }
      });

      canvas.renderAll();
      setShowTemplateDialog(false);
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  // Download JSON files
  const downloadJsonFiles = () => {
    if (!generatedJson) return;

    const data = JSON.parse(generatedJson);

    // Download each file separately
    Object.entries(data).forEach(([key, content]) => {
      const blob = new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Design Studio
            <Chip label="New" color="secondary" size="small" sx={{ ml: 2 }} />
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Create stunning templates with our visual drag-and-drop builder
          </Typography>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Tools Panel */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 3, height: "fit-content" }}>
              <Typography variant="h6" gutterBottom>
                Tools
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TextIcon />}
                    onClick={addTextBlock}
                    sx={{
                      height: 60,
                      flexDirection: "column",
                      fontSize: "0.75rem",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    Text
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ImageIcon />}
                    onClick={addImage}
                    sx={{
                      height: 60,
                      flexDirection: "column",
                      fontSize: "0.75rem",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    Image
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<RectangleIcon />}
                    onClick={addRectangle}
                    sx={{
                      height: 60,
                      flexDirection: "column",
                      fontSize: "0.75rem",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    Rectangle
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CircleIcon />}
                    onClick={addCircle}
                    sx={{
                      height: 60,
                      flexDirection: "column",
                      fontSize: "0.75rem",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    Circle
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Canvas Settings */}
              <Typography variant="h6" gutterBottom>
                Canvas Settings
              </Typography>

              <TextField
                label="Canvas Width (px)"
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value))}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                inputProps={{ min: 100, max: 2000 }}
              />

              <TextField
                label="Canvas Height (px)"
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value))}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                inputProps={{ min: 100, max: 2000 }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                Canvas updates automatically when you change dimensions
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Quick Presets:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => {
                        setCanvasWidth(400);
                        setCanvasHeight(600);
                      }}
                    >
                      Business Card
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => {
                        setCanvasWidth(600);
                        setCanvasHeight(800);
                      }}
                    >
                      Flyer
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => {
                        setCanvasWidth(800);
                        setCanvasHeight(600);
                      }}
                    >
                      Landscape
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => {
                        setCanvasWidth(800);
                        setCanvasHeight(800);
                      }}
                    >
                      Square
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Actions */}
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>

              <Button
                variant="contained"
                fullWidth
                startIcon={<UploadIcon />}
                onClick={() => setShowTemplateDialog(true)}
                sx={{ mb: 2 }}
              >
                Load Template
              </Button>

              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={exportToJson}
                sx={{ mb: 2 }}
              >
                Export JSON
              </Button>

              {selectedElement && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<DeleteIcon />}
                  onClick={deleteElement}
                >
                  Delete Selected
                </Button>
              )}
            </Paper>
          </Grid>

          {/* Canvas Area */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Canvas
              </Typography>

              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  overflow: "auto",
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    border: "1px solid #ccc",
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Properties Panel */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 3, height: "fit-content" }}>
              <Typography variant="h6" gutterBottom>
                Properties
              </Typography>

              {selectedElement ? (
                <Box>
                  {/* Position */}
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Position & Size</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="X"
                            type="number"
                            value={elementProps.x}
                            onChange={(e) =>
                              updateProperty("x", Number(e.target.value))
                            }
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Y"
                            type="number"
                            value={elementProps.y}
                            onChange={(e) =>
                              updateProperty("y", Number(e.target.value))
                            }
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Width"
                            type="number"
                            value={elementProps.width}
                            onChange={(e) =>
                              updateProperty("width", Number(e.target.value))
                            }
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Height"
                            type="number"
                            value={elementProps.height}
                            onChange={(e) =>
                              updateProperty("height", Number(e.target.value))
                            }
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {/* Text Properties */}
                  {selectedElement.elementType === "textblock" && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Text Properties</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField
                          label="Text"
                          value={elementProps.text}
                          onChange={(e) =>
                            updateProperty("text", e.target.value)
                          }
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          sx={{ mb: 2 }}
                        />

                        <TextField
                          label="Font Size"
                          type="number"
                          value={elementProps.fontSize}
                          onChange={(e) =>
                            updateProperty("fontSize", Number(e.target.value))
                          }
                          fullWidth
                          size="small"
                          sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth size="small">
                          <InputLabel>Font Family</InputLabel>
                          <Select
                            value={elementProps.fontFamily}
                            onChange={(e) =>
                              updateProperty("fontFamily", e.target.value)
                            }
                          >
                            <MenuItem value="Arial">Arial</MenuItem>
                            <MenuItem value="Times New Roman">
                              Times New Roman
                            </MenuItem>
                            <MenuItem value="Helvetica">Helvetica</MenuItem>
                            <MenuItem value="Georgia">Georgia</MenuItem>
                          </Select>
                        </FormControl>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Color Properties */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Colors</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Color Palette:
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {colorPalette.map((color, index) => (
                          <Grid item key={index}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: color,
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                },
                              }}
                              onClick={() => updateProperty("color", color)}
                            />
                          </Grid>
                        ))}
                      </Grid>

                      <TextField
                        label="Custom Color"
                        type="color"
                        value={elementProps.color}
                        onChange={(e) =>
                          updateProperty("color", e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  Select an element to edit properties
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Export Dialog */}
        <Dialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Export Template JSON</DialogTitle>
          <DialogContent>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your template has been converted to JSON format! You can copy the
              JSON or download separate files.
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={15}
              value={generatedJson}
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: {
                  fontSize: "12px",
                  fontFamily: "monospace",
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExportDialog(false)}>Close</Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedJson);
                // You could add a toast notification here
              }}
              variant="outlined"
            >
              Copy to Clipboard
            </Button>
            <Button
              onClick={downloadJsonFiles}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Download Files
            </Button>
          </DialogActions>
        </Dialog>

        {/* Template Selection Dialog */}
        <Dialog
          open={showTemplateDialog}
          onClose={() => setShowTemplateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a starter template to begin your design or start with a
              blank canvas.
            </Typography>

            <Grid container spacing={2}>
              {starterTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        border: "2px solid #9c27b0",
                        boxShadow: 4,
                        transform: "scale(1.02)",
                      },
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                    }}
                    onClick={() => loadTemplate(template)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: 120,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 1,
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #ddd",
                        }}
                      >
                        {template.id === "blank" ? (
                          <Typography color="text.secondary" variant="caption">
                            Blank Canvas
                          </Typography>
                        ) : (
                          <Typography color="text.secondary" variant="caption">
                            Template Preview
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Back to Home */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
