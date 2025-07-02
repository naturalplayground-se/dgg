import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import { useRouter } from "next/router";
import Header from "../components/Header";
import SelectFields from "../components/form/selectFields";

export default function Repetition() {
  const router = useRouter();
  const [designGeneratorJson, setDesignGeneratorJson] = React.useState([]);
  const [textAreaError, setTextAreaError] = React.useState(false);
  const [jsonSuccess, setJsonSuccess] = React.useState(false);
  const [jsonInputValue, setJsonInputValue] = React.useState("");
  const [hasStoredJson, setHasStoredJson] = React.useState(false);
  const [generatedJson, setGeneratedJson] = React.useState("");

  // Repetition settings
  const [selectedFields, setSelectedFields] = React.useState([]);
  const [groups, setGroups] = React.useState("");
  const [master, setMaster] = React.useState("");
  const [direction, setDirection] = React.useState("");
  const [maxItems, setMaxItems] = React.useState("");
  const [spaceX, setSpaceX] = React.useState("");
  const [spaceY, setSpaceY] = React.useState("");
  const [dynamicWidthSpaceX, setDynamicWidthSpaceX] = React.useState(false);
  const [dynamicHeightSpaceY, setDynamicHeightSpaceY] = React.useState(false);
  const [groupsVisibility, setGroupsVisibility] = React.useState(false);
  const [prefix, setPrefix] = React.useState("");
  const [numbering, setNumbering] = React.useState("");

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

  /**
   * Alphabet for naming
   */
  const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "X",
    "Y",
    "Z",
    "ZA",
    "ZB",
    "ZC",
    "ZD",
    "ZE",
    "ZF",
    "ZG",
    "ZH",
    "ZI",
    "ZJ",
  ];

  /**
   * Repetition functions
   */
  const generateShowHide = (i, names) => {
    const hideItems = names.length - i - 1;
    const last = i === names.length - 1;
    const showNames = names;
    const hideNames = names;
    const showArray = [];
    showNames.slice(0, i + 1).map((val) => {
      showArray.push(val);
    });
    const hideArray = [];
    hideNames.slice(-hideItems).map((val) => {
      hideArray.push(val);
    });
    const showArrayFlat = showArray.flat();
    const hideArrayFlat = hideArray.flat();
    const dropdownObject = {
      title: `${i + 1}`,
      selected: i === 0 ? true : false,
      show: showArrayFlat,
      hide: last ? ["fieldX"] : hideArrayFlat,
    };
    return dropdownObject;
  };

  const yPositionsColumn = (i, y, masterNames) => {
    const maxItemsInt = parseInt(maxItems);
    const name = masterNames[i - 1];
    if (
      i === 0 ||
      i === maxItemsInt ||
      i === maxItemsInt * 2 ||
      i === maxItemsInt * 3 ||
      i === maxItemsInt * 4 ||
      i === maxItemsInt * 5
    ) {
      return y;
    } else
      return `${name}.${dynamicHeightSpaceY ? "bottom" : "top"} + ${
        spaceY ? spaceY : 200
      }`;
  };

  const xPositionsColumn = (i, x, masterNames) => {
    const maxItemsInt = parseInt(maxItems);
    const name = masterNames[i - maxItemsInt];
    if (i <= maxItemsInt - 1) {
      return x;
    }
    if (i > maxItemsInt - 1) {
      return `${name}.${dynamicWidthSpaceX ? "right" : "left"} + ${
        spaceX ? spaceX : 200
      }`;
    }
  };

  const xPositionsRow = (i, x, masterNames) => {
    const maxItemsInt = parseInt(maxItems);
    const name = masterNames[i - 1];
    if (
      i === 0 ||
      i === maxItemsInt ||
      i === maxItemsInt * 2 ||
      i === maxItemsInt * 3 ||
      i === maxItemsInt * 4 ||
      i === maxItemsInt * 5 ||
      i === maxItemsInt * 6 ||
      i === maxItemsInt * 7 ||
      i === maxItemsInt * 8
    ) {
      return x;
    } else {
      return `${name}.${dynamicWidthSpaceX ? "right" : "left"} + ${
        spaceX ? spaceX : 200
      }`;
    }
  };

  const yPositionsRow = (i, y, masterNames) => {
    const maxItemsInt = parseInt(maxItems);
    const name = masterNames[i - maxItemsInt];
    if (i <= maxItemsInt - 1) {
      return y;
    }
    if (i > maxItemsInt - 1) {
      return `${name}.${dynamicHeightSpaceY ? "bottom" : "top"} + ${
        spaceY ? spaceY : 200
      }`;
    }
  };

  /**
   * Generate JSON with repetition
   */
  const generateJSON = () => {
    let groupsObject = [];
    const regex = new RegExp(`${prefix}`, "g");
    const regexNumber = new RegExp(`${numbering}`, "g");
    const masterNames = [];

    // Construct mastername array
    for (let index = 0; index < groups; index++) {
      selectedFields.map((obj, i) => {
        if (obj.name === master) {
          masterNames.push(obj.name.replace(regex, `${alphabet[index]}_`));
        }
      });
    }

    // Generate groups
    for (let index = 0; index < groups; index++) {
      const fieldGroup = selectedFields.map((obj, i) => {
        const newField = { ...obj };
        const stringField = JSON.stringify(newField);
        const prefixReplacementField =
          prefix !== ""
            ? stringField.replace(regex, `${alphabet[index]}_`)
            : stringField;
        const numberReplacementField =
          numbering !== ""
            ? prefixReplacementField.replace(regexNumber, `${index + 1}`)
            : prefixReplacementField;
        const jsonField = JSON.parse(numberReplacementField);

        if (direction === "row" && obj.name === master) {
          jsonField.y = yPositionsRow(index, obj.y, masterNames);
          jsonField.x = xPositionsRow(index, obj.x, masterNames);
        }
        if (direction === "column" && obj.name === master) {
          jsonField.y = yPositionsColumn(index, obj.y, masterNames);
          jsonField.x = xPositionsColumn(index, obj.x, masterNames);
        }
        return { ...jsonField };
      });
      groupsObject.push(fieldGroup);
    }

    const allGroups = groupsObject.flat();
    const selectedFieldNames = [];
    selectedFields.map((field) => selectedFieldNames.push(field.name));
    const newFields = [];
    const firstSelectedField = [];

    designGeneratorJson[0].fields.map((field, i) =>
      selectedFieldNames.indexOf(field.name) === -1
        ? newFields.push(field)
        : firstSelectedField.push(i)
    );

    // Groups visibility dropdown
    const allFieldNames = [];
    groupsObject.map((val, i) =>
      allFieldNames.push(val.map((value) => `${value.name}`))
    );
    const groupsVisibilityArray = [];
    for (let i = 0; i < allFieldNames.length; i++) {
      groupsVisibilityArray.push(generateShowHide(i, allFieldNames));
    }

    const groupsVisibilityField = {
      name: "select",
      title: "Välj antal",
      type: "select",
      options: groupsVisibilityArray,
      editui: "selectlist",
      editable: true,
    };

    newFields.splice(
      firstSelectedField[0],
      0,
      groupsVisibilityField,
      ...allGroups
    );

    const newDesignGeneratorJson = designGeneratorJson.map((obj) => {
      if (obj.fields) {
        return { ...obj, fields: newFields };
      }
      return obj;
    });

    const jsonString = JSON.stringify(newDesignGeneratorJson, null, 2);
    setGeneratedJson(jsonString);
    return jsonString;
  };

  /**
   * Checks if valid JSON
   */
  function IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    const designGeneratorJson = JSON.parse(str)[0].pagenr === 1;
    designGeneratorJson ? setDesignGeneratorJson(JSON.parse(str)) : "";
    return designGeneratorJson ? true : false;
  }

  async function handleField(event) {
    const inputValue = event.target.value;
    setJsonInputValue(inputValue);
    setJsonSuccess(false);

    if (inputValue.length > 2) {
      if (IsJsonString(inputValue)) {
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

  const handleSelectFields = (fields) => {
    setSelectedFields(fields);
  };

  const isRepetitionConfigured = () => {
    return (
      selectedFields.length > 0 &&
      groups !== "" &&
      master !== "" &&
      direction !== "" &&
      maxItems !== ""
    );
  };

  return (
    <Box>
      <Header />
      <Box sx={{ p: 10, my: 4, width: "1000px", color: "black", mx: "auto" }}>
        {/* Step 1: Paste JSON */}
        <Typography variant="h4" component="p" gutterBottom sx={{ mb: 10 }}>
          1. Paste Designgenerator JSON
        </Typography>

        {hasStoredJson && jsonInputValue === "" && (
          <Box
            sx={{ mb: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              JSON data available from previous step
            </Typography>
            <Button variant="outlined" size="small" onClick={loadStoredJson}>
              Load Previous JSON
            </Button>
          </Box>
        )}

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
        </Box>

        {/* Step 2: Configure Repetition */}
        <Typography
          variant="h4"
          component="p"
          gutterBottom
          sx={
            jsonSuccess
              ? { mb: 5, color: "text.primary" }
              : { mb: 5, color: "text.disabled" }
          }
        >
          2. Configure Repetition
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
          {/* Select Fields */}
          <Box sx={{ mb: 3 }}>
            <SelectFields
              id="repetition-fields"
              handleSelectFields={handleSelectFields}
              designGeneratorJson={
                jsonSuccess ? designGeneratorJson[0].fields : []
              }
              selectedFields={selectedFields}
              type="repetition"
            />
          </Box>

          {/* Settings */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
            <FormControl
              sx={{ width: "145px" }}
              disabled={!jsonSuccess || selectedFields.length === 0}
            >
              <InputLabel>Master</InputLabel>
              <Select
                value={master}
                label="Master"
                onChange={(event) => setMaster(event.target.value)}
              >
                {selectedFields.map((field, i) => (
                  <MenuItem key={i} value={field.name}>
                    {field.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <TextField
                label="Number of groups"
                variant="outlined"
                value={groups}
                onChange={(event) => setGroups(event.target.value)}
              />
            </FormControl>

            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <InputLabel>Direction</InputLabel>
              <Select
                value={direction}
                label="Direction"
                onChange={(event) => setDirection(event.target.value)}
              >
                <MenuItem value="column">Column</MenuItem>
                <MenuItem value="row">Row</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <TextField
                label={`Max groups in ${direction || "direction"}`}
                variant="outlined"
                value={maxItems}
                onChange={(event) => setMaxItems(event.target.value)}
              />
            </FormControl>

            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <TextField
                label="Space X"
                variant="outlined"
                value={spaceX}
                onChange={(event) => setSpaceX(event.target.value)}
              />
            </FormControl>

            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <TextField
                label="Space Y"
                variant="outlined"
                value={spaceY}
                onChange={(event) => setSpaceY(event.target.value)}
              />
            </FormControl>
          </Box>

          {/* Checkboxes */}
          <Box sx={{ mb: 3 }}>
            <FormGroup>
              <FormControlLabel
                disabled={spaceX === "" || !jsonSuccess}
                control={
                  <Checkbox
                    checked={dynamicWidthSpaceX}
                    onChange={(event) =>
                      setDynamicWidthSpaceX(event.target.checked)
                    }
                  />
                }
                label="Space X from right side of Master element"
              />
              <FormControlLabel
                disabled={spaceY === "" || !jsonSuccess}
                control={
                  <Checkbox
                    checked={dynamicHeightSpaceY}
                    onChange={(event) =>
                      setDynamicHeightSpaceY(event.target.checked)
                    }
                  />
                }
                label="Space Y from bottom position of Master element"
              />
            </FormGroup>
          </Box>

          {/* Naming */}
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <TextField
                label="Prefix replacement"
                variant="outlined"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
              />
            </FormControl>
            <FormControl sx={{ width: "145px" }} disabled={!jsonSuccess}>
              <TextField
                label="Number replacement"
                variant="outlined"
                value={numbering}
                onChange={(event) => setNumbering(event.target.value)}
              />
            </FormControl>
          </Box>

          {/* Groups Visibility */}
          <FormControlLabel
            disabled={groups < 2 || !jsonSuccess}
            control={
              <Checkbox
                checked={groupsVisibility}
                onChange={(event) => setGroupsVisibility(event.target.checked)}
              />
            }
            label="Dropdown - number of groups visible"
          />
        </Box>

        {/* Step 3: Grab JSON */}
        <Typography
          variant="h4"
          component="p"
          gutterBottom
          sx={
            jsonSuccess && isRepetitionConfigured()
              ? { mb: 5, color: "text.primary" }
              : { mb: 5, color: "text.disabled" }
          }
        >
          3. Grab Repetition JSON
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
            disabled={!jsonSuccess || !isRepetitionConfigured()}
            sx={{ p: 1.85 }}
            onClick={() => {
              const jsonString = generateJSON();
              navigator.clipboard.writeText(jsonString);
            }}
            color="success"
            variant="contained"
            size="large"
          >
            Copy Repetition JSON to Clipboard
          </Button>

          <Button
            sx={{ p: 1.85 }}
            onClick={() => router.push("/")}
            variant="outlined"
            size="large"
          >
            Back to Home
          </Button>
        </Box>

        {/* Preview generated JSON */}
        {generatedJson && (
          <Box sx={{ width: "1000px", mt: 5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview Repetition JSON:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={generatedJson}
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
