import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Prefix() {
  const router = useRouter();
  const [designGeneratorJson, setDesignGeneratorJson] = React.useState([]);
  const [stylesJson, setStylesJson] = React.useState({});
  const [textAreaError, setTextAreaError] = React.useState(false);
  const [stylesTextAreaError, setStylesTextAreaError] = React.useState(false);
  const [jsonSuccess, setJsonSuccess] = React.useState(false);
  const [stylesJsonSuccess, setStylesJsonSuccess] = React.useState(false);
  const [jsonInputValue, setJsonInputValue] = React.useState("");
  const [stylesJsonInputValue, setStylesJsonInputValue] = React.useState("");
  const [hasStoredJson, setHasStoredJson] = React.useState(false);
  const [generatedJson, setGeneratedJson] = React.useState("");
  const [generatedStylesJson, setGeneratedStylesJson] = React.useState("");

  // Prefix settings - now supporting multiple replacements
  const [replacements, setReplacements] = React.useState([
    { id: 1, findPrefix: "", replaceType: "", customReplace: "" },
  ]);
  const [nextId, setNextId] = React.useState(2);

  // Load JSON from localStorage on component mount
  React.useEffect(() => {
    const storedJson = localStorage.getItem("designGeneratorJson");
    if (storedJson) {
      try {
        const parsedJson = JSON.parse(storedJson);
        setDesignGeneratorJson(parsedJson);
        setJsonSuccess(true);
        setHasStoredJson(true);
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

  const handleJsonInputChange = (event) => {
    const value = event.target.value;
    setJsonInputValue(value);

    if (value.trim() === "") {
      setTextAreaError(false);
      setJsonSuccess(false);
      setDesignGeneratorJson([]);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setDesignGeneratorJson(parsed);
      setTextAreaError(false);
      setJsonSuccess(true);
    } catch (error) {
      setTextAreaError(true);
      setJsonSuccess(false);
    }
  };

  const handleStylesJsonInputChange = (event) => {
    const value = event.target.value;
    setStylesJsonInputValue(value);

    if (value.trim() === "") {
      setStylesTextAreaError(false);
      setStylesJsonSuccess(false);
      setStylesJson({});
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setStylesJson(parsed);
      setStylesTextAreaError(false);
      setStylesJsonSuccess(true);
    } catch (error) {
      setStylesTextAreaError(true);
      setStylesJsonSuccess(false);
    }
  };

  // Convert number to alphabetical (1=A, 2=B, etc.)
  const numberToAlpha = (num) => {
    return String.fromCharCode(64 + parseInt(num));
  };

  // Handle adding a new replacement
  const addReplacement = () => {
    setReplacements([
      ...replacements,
      { id: nextId, findPrefix: "", replaceType: "", customReplace: "" },
    ]);
    setNextId(nextId + 1);
  };

  // Handle removing a replacement
  const removeReplacement = (id) => {
    if (replacements.length > 1) {
      setReplacements(
        replacements.filter((replacement) => replacement.id !== id)
      );
    }
  };

  // Handle updating a specific replacement
  const updateReplacement = (id, field, value) => {
    setReplacements(
      replacements.map((replacement) =>
        replacement.id === id ? { ...replacement, [field]: value } : replacement
      )
    );
  };

  // Process all string values with prefix replacement (case sensitive)
  const processAllStrings = (obj, findPrefix, replaceWith) => {
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        processAllStrings(item, findPrefix, replaceWith)
      );
    } else if (obj && typeof obj === "object") {
      const processedObj = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          // Replace all occurrences of the prefix in any string value (case sensitive)
          const processedValue = value.replaceAll(findPrefix, replaceWith);
          processedObj[key] = processedValue;
        } else {
          processedObj[key] = processAllStrings(value, findPrefix, replaceWith);
        }
      }
      return processedObj;
    } else if (typeof obj === "string") {
      // Handle string values directly
      return obj.replaceAll(findPrefix, replaceWith);
    }
    return obj;
  };

  // Process pages with automatic page number detection for multiple replacements
  const processPagesWithAutoPageNumbers = (pages, replacements) => {
    return pages.map((page) => {
      if (page.pagenr && page.fields) {
        const alpha = numberToAlpha(page.pagenr);

        let processedFields = page.fields;

        // Apply each replacement sequentially
        replacements.forEach((replacement) => {
          if (
            replacement.findPrefix &&
            replacement.replaceType === "page_number"
          ) {
            const replaceWith = `${alpha}_${replacement.findPrefix}`;
            processedFields = processedFields.map((field) =>
              processAllStrings(field, replacement.findPrefix, replaceWith)
            );
          }
        });

        return {
          ...page,
          fields: processedFields,
        };
      }
      return page;
    });
  };

  // Process all replacements for custom replacements
  const processAllReplacements = (json, replacements) => {
    let processedJson = json;

    replacements.forEach((replacement) => {
      if (
        replacement.findPrefix &&
        replacement.replaceType === "custom" &&
        replacement.customReplace
      ) {
        processedJson = processAllStrings(
          processedJson,
          replacement.findPrefix,
          replacement.customReplace
        );
      }
    });

    return processedJson;
  };

  // Process styles.json to create new styles for fields with updated names
  const processStylesJson = (stylesJson, processedFieldsJson, replacements) => {
    if (!stylesJson.styles || !Array.isArray(stylesJson.styles)) {
      return stylesJson;
    }

    const newStyles = [...stylesJson.styles];
    let nextStyleIndex = newStyles.length;

    // Create a deep copy of the processed fields JSON to avoid mutating the original
    const processedFieldsCopy = JSON.parse(JSON.stringify(processedFieldsJson));

    // Process each page
    processedFieldsCopy.forEach((page) => {
      if (page.pagenr && page.fields) {
        const pageAlpha = numberToAlpha(page.pagenr);

        // Find fields with styles in this page
        page.fields.forEach((field) => {
          if (field.styles && Array.isArray(field.styles)) {
            // For each replacement, create new styles if needed
            replacements.forEach((replacement) => {
              if (
                replacement.findPrefix &&
                replacement.replaceType === "page_number"
              ) {
                // Check if this field name was changed by looking for the page prefix
                if (field.name && field.name.startsWith(`${pageAlpha}_`)) {
                  // Process styles for this field
                  field.styles.forEach((styleIndex, styleArrayIndex) => {
                    if (styleIndex < newStyles.length) {
                      const originalStyle = newStyles[styleIndex];

                      // Check if a style with this colorFrom already exists
                      const existingStyleIndex = newStyles.findIndex(
                        (style) => style.colorFrom === field.name
                      );

                      if (existingStyleIndex !== -1) {
                        // Style already exists, just update the field to reference it
                        field.styles[styleArrayIndex] = existingStyleIndex;
                      } else {
                        // Create new style - only add colorFrom if original had it
                        const newStyle = {
                          ...originalStyle,
                          info: originalStyle.info
                            ? `Page ${page.pagenr} - ${originalStyle.info}`
                            : `Page ${page.pagenr} - Style ${styleIndex}`,
                        };

                        // Only add colorFrom if the original style had it
                        if (originalStyle.colorFrom) {
                          newStyle.colorFrom = field.name; // Use the actual field name
                        }

                        newStyles.push(newStyle);

                        // Update the field's styles array to reference the new style
                        field.styles[styleArrayIndex] = nextStyleIndex;
                        console.log(
                          `Updated field "${field.name}" style index from ${styleIndex} to ${nextStyleIndex}`
                        );
                        nextStyleIndex++;
                      }
                    }
                  });
                }
              } else if (
                replacement.findPrefix &&
                replacement.replaceType === "custom" &&
                replacement.customReplace
              ) {
                // Check if this field name was changed by looking for the custom prefix
                if (
                  field.name &&
                  field.name.startsWith(replacement.customReplace)
                ) {
                  // Process styles for this field
                  field.styles.forEach((styleIndex, styleArrayIndex) => {
                    if (styleIndex < newStyles.length) {
                      const originalStyle = newStyles[styleIndex];

                      // Check if a style with this colorFrom already exists
                      const existingStyleIndex = newStyles.findIndex(
                        (style) => style.colorFrom === field.name
                      );

                      if (existingStyleIndex !== -1) {
                        // Style already exists, just update the field to reference it
                        field.styles[styleArrayIndex] = existingStyleIndex;
                      } else {
                        // Create new style - only add colorFrom if original had it
                        const newStyle = {
                          ...originalStyle,
                          info: originalStyle.info
                            ? `Custom - ${originalStyle.info}`
                            : `Custom - Style ${styleIndex}`,
                        };

                        // Only add colorFrom if the original style had it
                        if (originalStyle.colorFrom) {
                          newStyle.colorFrom = field.name; // Use the actual field name
                        }

                        newStyles.push(newStyle);

                        // Update the field's styles array to reference the new style
                        field.styles[styleArrayIndex] = nextStyleIndex;
                        console.log(
                          `Updated field "${field.name}" style index from ${styleIndex} to ${nextStyleIndex}`
                        );
                        nextStyleIndex++;
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
    });

    return {
      ...stylesJson,
      styles: newStyles,
      updatedFieldsJson: processedFieldsCopy,
    };
  };

  const handleGenerate = () => {
    if (!designGeneratorJson || designGeneratorJson.length === 0) {
      alert("Please provide valid JSON first");
      return;
    }

    // Validate that at least one replacement is configured
    const validReplacements = replacements.filter(
      (r) => r.findPrefix.trim() && r.replaceType
    );
    if (validReplacements.length === 0) {
      alert("Please configure at least one replacement");
      return;
    }

    // Validate custom replacements have replacement text
    const invalidCustom = validReplacements.find(
      (r) => r.replaceType === "custom" && !r.customReplace.trim()
    );
    if (invalidCustom) {
      alert("Please specify replacement text for all custom replacements");
      return;
    }

    try {
      let processedJson = designGeneratorJson;

      // First process all page number replacements
      const pageNumberReplacements = validReplacements.filter(
        (r) => r.replaceType === "page_number"
      );
      if (pageNumberReplacements.length > 0) {
        processedJson = processPagesWithAutoPageNumbers(
          processedJson,
          pageNumberReplacements
        );
      }

      // Then process all custom replacements
      const customReplacements = validReplacements.filter(
        (r) => r.replaceType === "custom"
      );
      if (customReplacements.length > 0) {
        processedJson = processAllReplacements(
          processedJson,
          customReplacements
        );
      }

      // Process styles.json if provided
      let processedStylesJson = null;
      let updatedFieldsJson = processedJson;
      if (stylesJsonSuccess && Object.keys(stylesJson).length > 0) {
        const result = processStylesJson(
          stylesJson,
          processedJson,
          validReplacements
        );
        processedStylesJson = result;
        // Get the updated fields JSON with corrected style indexes
        updatedFieldsJson = result.updatedFieldsJson || processedJson;
      }

      const jsonString = JSON.stringify(updatedFieldsJson, null, 2);
      setGeneratedJson(jsonString);

      if (processedStylesJson) {
        const stylesJsonString = JSON.stringify(processedStylesJson, null, 2);
        setGeneratedStylesJson(stylesJsonString);
      }

      // Copy to clipboard
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          alert("Modified Fields JSON copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy to clipboard:", err);
          alert(
            "Generated JSON is ready! Please copy manually from the output area."
          );
        });
    } catch (error) {
      console.error("Error processing JSON:", error);
      alert("Error processing JSON. Please check your input.");
    }
  };

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/")}
            sx={{ mb: 2 }}
          >
            ← Back to Home
          </Button>
          <Typography variant="h3" component="h1" gutterBottom>
            Prefix Replacement Tool
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Find and replace prefixes in ALL string values throughout your JSON.
            Perfect for converting field references across different pages or
            systems with automatic page numbering or custom replacements.
          </Typography>
        </Box>

        {/* JSON Input Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. Input JSON
          </Typography>

          {hasStoredJson && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={loadStoredJson}
                sx={{ mr: 2 }}
              >
                Load from Studio
              </Button>
              <Typography variant="caption" color="text.secondary">
                Load JSON that was exported from the Studio tool
              </Typography>
            </Box>
          )}

          <TextField
            label="Paste your JSON here"
            multiline
            rows={12}
            value={jsonInputValue}
            onChange={handleJsonInputChange}
            variant="outlined"
            fullWidth
            error={textAreaError}
            helperText={
              textAreaError
                ? "Invalid JSON format"
                : jsonSuccess
                ? "✓ Valid JSON detected"
                : "Paste your design JSON here"
            }
            sx={{
              fontFamily: "monospace",
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>

        {/* Styles JSON Input Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            2. Input Styles JSON (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste your styles.json to automatically update style references when
            field names change. This ensures that styles with "colorFrom"
            references continue to work after prefix replacements.
          </Typography>

          <TextField
            label="Paste your styles.json here (optional)"
            multiline
            rows={8}
            value={stylesJsonInputValue}
            onChange={handleStylesJsonInputChange}
            variant="outlined"
            fullWidth
            error={stylesTextAreaError}
            helperText={
              stylesTextAreaError
                ? "Invalid JSON format"
                : stylesJsonSuccess
                ? "✓ Valid styles JSON detected"
                : "Paste your styles.json here to update style references"
            }
            sx={{
              fontFamily: "monospace",
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>

        {/* Prefix Settings */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h5">
              3. Configure Prefix Replacements
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addReplacement}
              size="small"
            >
              Add Replacement
            </Button>
          </Box>

          {replacements.map((replacement, index) => (
            <Box
              key={replacement.id}
              sx={{
                p: 3,
                mb: 3,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#fafafa",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Replacement {index + 1}
                </Typography>
                {replacements.length > 1 && (
                  <IconButton
                    onClick={() => removeReplacement(replacement.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <TextField
                  label="Find Prefix"
                  value={replacement.findPrefix}
                  onChange={(e) =>
                    updateReplacement(
                      replacement.id,
                      "findPrefix",
                      e.target.value
                    )
                  }
                  variant="outlined"
                  fullWidth
                  placeholder="e.g. R_"
                  helperText="Enter the prefix to search for (case sensitive)"
                />

                <FormControl fullWidth>
                  <InputLabel>Replacement Type</InputLabel>
                  <Select
                    value={replacement.replaceType}
                    label="Replacement Type"
                    onChange={(e) =>
                      updateReplacement(
                        replacement.id,
                        "replaceType",
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="page_number">
                      Page Number (A_, B_, C_...)
                    </MenuItem>
                    <MenuItem value="custom">Custom Replacement</MenuItem>
                  </Select>
                </FormControl>

                {replacement.replaceType === "custom" && (
                  <TextField
                    label="Custom Replacement"
                    value={replacement.customReplace}
                    onChange={(e) =>
                      updateReplacement(
                        replacement.id,
                        "customReplace",
                        e.target.value
                      )
                    }
                    variant="outlined"
                    fullWidth
                    placeholder="e.g. NEW_"
                    helperText={`${replacement.findPrefix} will be replaced with: ${replacement.customReplace}`}
                  />
                )}
              </Box>

              {replacement.findPrefix && replacement.replaceType && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    "{replacement.findPrefix}Logo" →{" "}
                    {replacement.replaceType === "page_number"
                      ? `"A_${replacement.findPrefix}Logo" (Page 1), "B_${replacement.findPrefix}Logo" (Page 2), etc.`
                      : `"${replacement.customReplace}Logo"`}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Generate Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerate}
            disabled={
              !jsonSuccess ||
              replacements.every((r) => !r.findPrefix || !r.replaceType)
            }
            sx={{ mr: 2 }}
          >
            Generate & Copy to Clipboard
          </Button>
        </Box>

        {/* Fields Output */}
        {generatedJson && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              4. Generated Fields JSON
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Updated fields.json with corrected style indexes that reference
              the new styles. Field names have been updated with prefixes and
              style references point to the correct new style indexes.
            </Typography>
            <TextField
              label="Generated Fields JSON (copied to clipboard)"
              multiline
              rows={12}
              value={generatedJson}
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              sx={{
                fontFamily: "monospace",
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Box>
        )}

        {/* Styles Output */}
        {generatedStylesJson && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              5. Generated Styles JSON
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Updated styles.json with new style entries for fields that had
              their names changed. Each new style includes updated "colorFrom"
              references and descriptive "info" text.
            </Typography>
            <TextField
              label="Generated Styles JSON"
              multiline
              rows={12}
              value={generatedStylesJson}
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              sx={{
                fontFamily: "monospace",
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Box>
        )}

        {/* Instructions */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            backgroundColor: "#f8f9fa",
            borderRadius: 2,
            border: "1px solid #e9ecef",
          }}
        >
          <Typography variant="h6" gutterBottom>
            How to Use
          </Typography>
          <Typography variant="body2" component="div">
            <strong>1. Paste JSON:</strong> Input your design JSON that contains
            string values with prefixes
            <br />
            <strong>2. Paste Styles JSON (Optional):</strong> Input your
            styles.json to automatically update style references
            <br />
            <strong>3. Configure:</strong>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>
                <strong>Multiple Replacements:</strong> Add multiple prefix
                replacements to process simultaneously (e.g., "R_" and "L_")
              </li>
              <li>
                <strong>Page Number:</strong> Automatically detects page numbers
                from JSON structure and replaces with alphabetical prefixes
                (Page 1=A_, Page 2=B_)
              </li>
              <li>
                <strong>Custom:</strong> Replace with any custom string you
                specify
              </li>
              <li>
                <strong>Case Sensitive:</strong> All matching is exact and case
                sensitive
              </li>
            </ul>
            <strong>4. Generate:</strong> Click to process and get three
            separate outputs:
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>
                <strong>Fields JSON:</strong> Updated fields.json with corrected
                style indexes
              </li>
              <li>
                <strong>Styles JSON:</strong> Updated styles.json with new
                styles
              </li>
              <li>
                <strong>Combined:</strong> Complete processed design JSON
              </li>
            </ul>
          </Typography>

          <Box
            sx={{ mt: 2, p: 2, backgroundColor: "#fff3cd", borderRadius: 1 }}
          >
            <Typography variant="body2">
              <strong>Example:</strong> Multiple prefixes get replaced
              simultaneously:
              <br />
              • "R_Logo" → "B_R_Logo" (page 2)
              <br />
              • "L_Title" → "B_L_Title" (page 2)
              <br />
              • "R_Page.left + 30" → "B_R_Page.left + 30" (page 2)
              <br />
              <strong>Note:</strong> Processes multiple replacements in one
              operation (case sensitive)
            </Typography>
          </Box>

          <Box
            sx={{ mt: 2, p: 2, backgroundColor: "#d1ecf1", borderRadius: 1 }}
          >
            <Typography variant="body2">
              <strong>Styles Processing:</strong> When you provide styles.json:
              <br />
              • Automatically creates new style entries for fields with changed
              names
              <br />
              • Updates "colorFrom" references to point to new field names
              <br />
              • Adds descriptive "info" text with page context (e.g., "Page 1 -
              Black")
              <br />
              • Ensures color inheritance continues to work after prefix
              replacements
              <br />• Provides three separate outputs: Fields JSON, Styles JSON,
              and Combined JSON
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
