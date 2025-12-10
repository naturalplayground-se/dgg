import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Scaling() {
  const router = useRouter();
  const [designGeneratorJson, setDesignGeneratorJson] = React.useState([]);
  const [textAreaError, setTextAreaError] = React.useState(false);
  const [jsonSuccess, setJsonSuccess] = React.useState(false);
  const [jsonInputValue, setJsonInputValue] = React.useState("");
  const [stylesJsonInputValue, setStylesJsonInputValue] = React.useState("");
  const [stylesJsonError, setStylesJsonError] = React.useState(false);
  const [stylesJsonSuccess, setStylesJsonSuccess] = React.useState(false);
  const [stylesData, setStylesData] = React.useState(null);
  const [scaleType, setScaleType] = React.useState("");
  const [customFromWidth, setCustomFromWidth] = React.useState("");
  const [customFromHeight, setCustomFromHeight] = React.useState("");
  const [customToWidth, setCustomToWidth] = React.useState("");
  const [customToHeight, setCustomToHeight] = React.useState("");
  const [scaledJson, setScaledJson] = React.useState("");
  const [scaledStylesJson, setScaledStylesJson] = React.useState("");
  const [hasStoredJson, setHasStoredJson] = React.useState(false);

  // Load JSON from localStorage on component mount
  React.useEffect(() => {
    const storedJson = localStorage.getItem("designGeneratorJson");
    if (storedJson) {
      try {
        const parsedJson = JSON.parse(storedJson);
        setDesignGeneratorJson(parsedJson);
        setJsonSuccess(true);
        setHasStoredJson(true);
        // Don't pre-fill the input - let user choose to load or paste new
      } catch (e) {
        console.error("Error parsing stored JSON:", e);
      }
    }
  }, []);

  const loadStoredJson = () => {
    if (designGeneratorJson.length > 0) {
      setJsonInputValue(JSON.stringify(designGeneratorJson, null, 2));
      setJsonSuccess(true);
      setTextAreaError(false);
    }
  };

  /**
   * Scaling functions
   */
  const getScaleFactor = () => {
    switch (scaleType) {
      case "a4-to-a3":
        return 1.414; // √2
      case "a3-to-a4":
        return 0.707; // 1/√2
      case "custom":
        if (customFromWidth && customToWidth) {
          return parseFloat(customToWidth) / parseFloat(customFromWidth);
        }
        return 1;
      default:
        return 1;
    }
  };

  const scaleValue = (value, scaleFactor) => {
    if (typeof value === "number") {
      return Math.round(value * scaleFactor * 10) / 10; // Round to 1 decimal
    }

    if (typeof value === "string") {
      let result = value;

      // Handle all numbers at once with specific context checking
      result = result.replace(/(\d+(?:\.\d+)?)/g, (match, number, offset) => {
        const beforeMatch = result.substring(Math.max(0, offset - 5), offset);
        const afterMatch = result.substring(
          offset + match.length,
          offset + match.length + 5
        );

        // Skip if this number follows multiplication (preserve ratios)
        if (/\*\s*$/.test(beforeMatch)) {
          return match;
        }

        // Skip divide-by-2 patterns used for centering (e.g. height / 2)
        if (parseFloat(number) === 2 && /\/\s*$/.test(beforeMatch)) {
          return match;
        }

        // Skip if this number is part of a field/property reference
        if (/[\w.]\s*$/.test(beforeMatch) || /^[\w.]/.test(afterMatch)) {
          return match;
        }

        const num = parseFloat(number);
        const scaled = Math.round(num * scaleFactor * 10) / 10;
        return scaled.toString();
      });

      return result;
    }

    return value;
  };

  const scaleObject = (obj, scaleFactor) => {
    const scaledObj = { ...obj };

    const fieldsToScale = [
      "height",
      "width",
      "x",
      "y",
      "fontSize",
      "lineHeight",
      "maxw",
      "maxh",
      "w",
      "h",
    ];

    fieldsToScale.forEach((field) => {
      if (scaledObj[field] !== undefined) {
        scaledObj[field] = scaleValue(scaledObj[field], scaleFactor);
      }
    });

    // Handle fontSizes array
    if (scaledObj.fontSizes && Array.isArray(scaledObj.fontSizes)) {
      scaledObj.fontSizes = scaledObj.fontSizes.map((fontSizeObj) => ({
        ...fontSizeObj,
        size: scaleValue(fontSizeObj.size, scaleFactor),
        lineHeight: scaleValue(fontSizeObj.lineHeight, scaleFactor),
      }));
    }

    // Skip colors array - leave it untouched
    // (colors array is already preserved by not being in fieldsToScale)

    return scaledObj;
  };

  const generateScaledFieldsJSON = () => {
    const scaleFactor = getScaleFactor();
    const scaledData = JSON.parse(JSON.stringify(designGeneratorJson)); // Deep clone

    if (
      scaledData[0] &&
      scaledData[0].fields &&
      Array.isArray(scaledData[0].fields)
    ) {
      scaledData[0].fields = scaledData[0].fields.map((field) =>
        scaleObject(field, scaleFactor)
      );
    }

    const jsonString = JSON.stringify(scaledData, null, 2);
    setScaledJson(jsonString);
    return jsonString;
  };

  const scaleStyleEntry = (styleObj, scaleFactor) => {
    const styleKeysToScale = [
      "fontSize",
      "lineHeight",
      "paraSpacing",
      "paraSpacingBefore",
      "bulletIndent",
      "indent",
    ];
    const scaledStyle = { ...styleObj };
    styleKeysToScale.forEach((key) => {
      if (scaledStyle[key] !== undefined) {
        scaledStyle[key] = scaleValue(scaledStyle[key], scaleFactor);
      }
    });
    return scaledStyle;
  };

  const generateScaledStylesJSON = () => {
    if (!stylesData || !stylesData.styles) return "";
    const scaleFactor = getScaleFactor();
    const scaledStylesData = JSON.parse(JSON.stringify(stylesData));
    scaledStylesData.styles = scaledStylesData.styles.map((style) =>
      scaleStyleEntry(style, scaleFactor)
    );
    const jsonString = JSON.stringify(scaledStylesData, null, 2);
    setScaledStylesJson(jsonString);
    return jsonString;
  };

  /**
   * Checks if valid fields JSON
   */
  const isFieldsJsonValid = (str) => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed) && parsed[0]?.pagenr === 1) {
        setDesignGeneratorJson(parsed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const isStylesJsonValid = (str) => {
    try {
      const parsed = JSON.parse(str);
      if (parsed?.styles && Array.isArray(parsed.styles)) {
        setStylesData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  async function handleField(event) {
    const inputValue = event.target.value;
    setJsonInputValue(inputValue); // Update input field value
    setJsonSuccess(false);

    if (inputValue.length > 2) {
      if (isFieldsJsonValid(inputValue)) {
        setJsonSuccess(true);
        setTextAreaError(false);
      } else {
        setTextAreaError(true);
        setJsonSuccess(false);
      }
    } else {
      setTextAreaError(false);
      setJsonSuccess(false);
    }
  }

  async function handleStylesField(event) {
    const inputValue = event.target.value;
    setStylesJsonInputValue(inputValue);
    setStylesJsonSuccess(false);

    if (inputValue.length > 2) {
      if (isStylesJsonValid(inputValue)) {
        setStylesJsonSuccess(true);
        setStylesJsonError(false);
      } else {
        setStylesJsonError(true);
        setStylesJsonSuccess(false);
      }
    } else {
      setStylesJsonError(false);
      setStylesJsonSuccess(false);
    }
  }

  const isScalingConfigured = () => {
    return (
      scaleType !== "" &&
      jsonSuccess &&
      stylesJsonSuccess &&
      (scaleType !== "custom" ||
        (customFromWidth !== "" && customToWidth !== ""))
    );
  };

  const handleGenerateScaled = () => {
    generateScaledFieldsJSON();
    generateScaledStylesJSON();
  };

  return (
    <Box>
      <Header />
      <Box sx={{ p: 10, my: 4, width: "1000px", color: "black", mx: "auto" }}>
        {/* Step 1: Paste JSON */}
        <Typography variant="h4" component="p" gutterBottom sx={{ mb: 10 }}>
          1. Paste Designgenerator JSON
        </Typography>

        <Box sx={{ position: "relative", width: "1000px" }}>
          <FormControl sx={{ width: "100%", mb: 10 }}>
            <TextField
              onChange={handleField}
              value={jsonInputValue}
              fullWidth
              label="Paste JSON here"
              multiline
              rows={12}
              error={textAreaError}
              color={textAreaError ? "" : jsonSuccess ? "success" : "primary"}
              helperText={
                textAreaError
                  ? `Not valid JSON`
                  : jsonSuccess
                  ? "Correct JSON"
                  : ""
              }
            />
          </FormControl>

          <FormControl sx={{ width: "100%", mb: 10 }}>
            <TextField
              onChange={handleStylesField}
              value={stylesJsonInputValue}
              fullWidth
              label="Paste Styles JSON here"
              multiline
              rows={12}
              error={stylesJsonError}
              color={
                stylesJsonError ? "" : stylesJsonSuccess ? "success" : "primary"
              }
              helperText={
                stylesJsonError
                  ? `Not valid Styles JSON (must include styles array)`
                  : stylesJsonSuccess
                  ? "Correct Styles JSON"
                  : ""
              }
            />
          </FormControl>
        </Box>

        {/* Step 2: Configure Scaling */}
        <Typography
          variant="h4"
          component="p"
          gutterBottom
          sx={
            jsonSuccess && stylesJsonSuccess
              ? { mb: 5, color: "text.primary" }
              : { mb: 5, color: "text.disabled" }
          }
        >
          2. Configure Scaling
        </Typography>

        <Box
          sx={{
            mb: 10,
            width: "1000px",
            border: jsonSuccess ? "1px solid lightgrey" : "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "2rem",
            backgroundColor: jsonSuccess ? "white" : "#f5f5f5",
          }}
        >
          <FormControl sx={{ width: "200px", mb: 3 }} disabled={!jsonSuccess}>
            <InputLabel id="scaleType">Scale Type</InputLabel>
            <Select
              id="scaleType"
              value={scaleType}
              label="Scale Type"
              onChange={(event) => setScaleType(event.target.value)}
            >
              <MenuItem value="a4-to-a3">A4 → A3</MenuItem>
              <MenuItem value="a3-to-a4">A3 → A4</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          {scaleType === "custom" && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Original Size (points)
              </Typography>
              <Box sx={{ display: "flex", gap: "20px", mb: 3 }}>
                <FormControl sx={{ width: "145px" }}>
                  <TextField
                    id="customFromWidth"
                    label="From Width"
                    variant="outlined"
                    value={customFromWidth}
                    onChange={(event) => setCustomFromWidth(event.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ width: "145px" }}>
                  <TextField
                    id="customFromHeight"
                    label="From Height"
                    variant="outlined"
                    value={customFromHeight}
                    onChange={(event) =>
                      setCustomFromHeight(event.target.value)
                    }
                  />
                </FormControl>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Target Size (points)
              </Typography>
              <Box sx={{ display: "flex", gap: "20px", mb: 3 }}>
                <FormControl sx={{ width: "145px" }}>
                  <TextField
                    id="customToWidth"
                    label="To Width"
                    variant="outlined"
                    value={customToWidth}
                    onChange={(event) => setCustomToWidth(event.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ width: "145px" }}>
                  <TextField
                    id="customToHeight"
                    label="To Height"
                    variant="outlined"
                    value={customToHeight}
                    onChange={(event) => setCustomToHeight(event.target.value)}
                  />
                </FormControl>
              </Box>

              {customFromWidth && customToWidth && (
                <Typography variant="body2" color="text.secondary">
                  Scale Factor:{" "}
                  {(
                    parseFloat(customToWidth) / parseFloat(customFromWidth)
                  ).toFixed(3)}
                </Typography>
              )}
            </Box>
          )}

          {scaleType === "a4-to-a3" && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Scale Factor: 1.414 (A4 210×297mm → A3 297×420mm)
            </Typography>
          )}

          {scaleType === "a3-to-a4" && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Scale Factor: 0.707 (A3 297×420mm → A4 210×297mm)
            </Typography>
          )}
        </Box>

        {/* Step 3: Grab JSON */}
        <Typography
          variant="h4"
          component="p"
          gutterBottom
          sx={
            jsonSuccess && stylesJsonSuccess && isScalingConfigured()
              ? { mb: 5, color: "text.primary" }
              : { mb: 5, color: "text.disabled" }
          }
        >
          3. Grab Scaled JSON
        </Typography>

        <Box
          sx={{
            width: "1000px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Button
            disabled={!isScalingConfigured()}
            sx={{ p: 1.85 }}
            onClick={handleGenerateScaled}
            color="success"
            variant="contained"
            size="large"
          >
            Generate Scaled JSONs
          </Button>

          <Button
            sx={{ p: 1.85 }}
            onClick={() => router.push("/")}
            variant="outlined"
            size="large"
          >
            Back to Main
          </Button>
        </Box>

        {/* Preview scaled JSON - Fields */}
        {scaledJson && (
          <Box sx={{ width: "1000px", mt: 5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Preview Scaled Fields JSON:</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigator.clipboard.writeText(scaledJson)}
              >
                Copy Fields JSON
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={scaledJson}
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: { fontSize: "12px", fontFamily: "monospace" },
              }}
            />
          </Box>
        )}

        {/* Preview scaled JSON - Styles */}
        {scaledStylesJson && (
          <Box sx={{ width: "1000px", mt: 5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Preview Scaled Styles JSON:</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigator.clipboard.writeText(scaledStylesJson)}
              >
                Copy Styles JSON
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={scaledStylesJson}
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: { fontSize: "12px", fontFamily: "monospace" },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
