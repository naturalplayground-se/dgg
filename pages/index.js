import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function Index() {
  const [type, setType] = React.useState("");
  const [field1, setField1] = React.useState("");
  const [fieldCount, setFieldCount] = React.useState("");
  const [fieldCountError, setFieldCountError] = React.useState(false);
  const [dynamicPrefix, setDynamicPrefix] = React.useState(null);

  const [textAreaFieldCount, setTextAreaFieldCount] = React.useState([1]);
  const [textAreaError, setTextAreaError] = React.useState(false);
  const [jsonSuccess, setJsonSuccess] = React.useState(false);
  const [textField, setTextField] = React.useState(null);
  const [parsedTextField, setParsedTextField] = React.useState(null);
  const [layout, setLayout] = React.useState("column");
  const [masterPosition, setMasterPosition] = React.useState(null);
  const [masterPositionId, setMasterPositionId] = React.useState(null);
  const [keyPosition, setKeyPosition] = React.useState(null);

  const [xPos, setXPos] = React.useState(null);
  const [yPos, setYPos] = React.useState(null);
  const [distance, setDistance] = React.useState(null);
  const [maxItems, setMaxItems] = React.useState(null);
  const [marginRight, setMarginRight] = React.useState(null);
  const [marginBottom, setMarginBottom] = React.useState(null);

  React.useEffect(() => {
    if (jsonSuccess) {
      const isParsed = JSON.parse(`[${textField}]`);
      setParsedTextField(isParsed);
    }
  }, [textField]);

  React.useEffect(() => {
    if (parsedTextField !== null) {
      const indexMaster = parsedTextField.findIndex(
        (textField) => textField.name == `${masterPosition}`
      );
      setKeyPosition(indexMaster);
    }
  }, [masterPosition]);

  const prefix = [
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

  const arrayNames = [];
  const dynamicTextfield = (i) => {
    if (textField !== null) {
      const regex = new RegExp(dynamicPrefix, "g");
      const replaced = textField.replace(regex, `${prefix[i]}_`);
      const parsed = JSON.parse(`[${replaced}]`);

      if (masterPosition !== null) {
        //
        // COLUMN
        //
        if (layout === "column") {
          Object.values(parsed).forEach((field, index) => {
            index === keyPosition
              ? ((field.y = yPositionsColumn(i, arrayNames[i - 1])),
                (field.x = xPositionsColumn(i)),
                arrayNames.push(field.name))
              : "";
          });
          //
          // ROW
          //
        } else {
          Object.values(parsed).forEach((field, index) => {
            index === keyPosition
              ? ((field.y = yPositionsColumn(i, arrayNames[i - 1])),
                (field.x = xPositionsRow(i, arrayNames[i - 1])),
                arrayNames.push(field.name))
              : "";
          });
        }
      }
      console.log("parsed");
      console.log(parsed);

      return parsed;
    } else {
      return "";
    }
  };

  const yPositionsColumn = (i, name) => {
    if (
      i === 0 ||
      i === maxItems + 1 ||
      i === maxItems * 2 + 1 ||
      i === maxItems * 3 + 1 ||
      i === maxItems * 4 + 1 ||
      i === maxItems * 5 + 1
    ) {
      return yPos;
    } else return `${name}.bottom + ${marginBottom ? marginBottom : 200}`;
  };

  const xPositionsColumn = (i) => {
    if (xPos !== null) {
      if (i < maxItems) {
        return xPos;
      }
      if (i < maxItems * 2) {
        return xPos + marginRight;
      }
      if (i < maxItems * 3) {
        return xPos + marginRight * 2;
      }
      if (i <= maxItems * 4) {
        return xPos + marginRight * 3;
      }
      if (i <= maxItems * 5) {
        return xPos + marginRight * 4;
      }
    } else {
      return 666;
    }
  };

  const xPositionsRow = (i, name) => {
    if (xPos !== null) {
      if (
        i === 0 ||
        i === maxItems ||
        i === maxItems * 2 ||
        i === maxItems * 3 ||
        i === maxItems * 4 ||
        i === maxItems * 5 ||
        i === maxItems * 6 ||
        i === maxItems * 7 ||
        i === maxItems * 8
      ) {
        return xPos;
      } else {
        return `${name}.left + ${marginRight ? marginRight : 200}`;
      }
    } else {
      return 666;
    }
  };

  // const columnPositions = (i) => {
  //   const columnXPositions = (i) => {
  //     if (i <= maxItems) {
  //       return xPos;
  //     }
  //     if (i <= maxItems * 2) {
  //       return xPos + distance;
  //     }
  //     if (i <= maxItems * 3) {
  //       return xPos + distance * 2;
  //     }
  //     if (i <= maxItems * 4) {
  //       return xPos + distance * 3;
  //     }
  //     if (i <= maxItems * 5) {
  //       return xPos + distance * 4;
  //     }
  //   };

  //   const masterObj = parsedTextField.find((x) => x.name === masterPosition);

  //   const columnYPositions = (i) => {
  //     if (
  //       i === 0 ||
  //       i === maxItems ||
  //       i === maxItems * 2 ||
  //       i === maxItems * 3 ||
  //       i === maxItems * 4 ||
  //       i === maxItems * 5
  //     ) {
  //       return yPos;
  //     } else return prefix[i - 1] + `${masterObj.y}`;
  //     // else return prefix[i - 1] + "_Pris.bottom + 15.8";
  //   };
  // };

  const generateClusters = () => {
    let clusters = [];

    for (let i = 0; i < fieldCount; i++) {
      // const modifiedCluster = `${JSON.stringify(dynamicTextfield(i))},`;

      const stringObject = `${JSON.stringify(dynamicTextfield(i))
        .substring(1)
        .slice(0, -1)},`;

      clusters.push(stringObject);
    }

    const merged = clusters.join("");

    return merged;
  };

  function IsJsonString(str) {
    const withBrackets1 = `[${str}]`;

    try {
      JSON.parse(withBrackets1);
    } catch (e) {
      return false;
    }

    return true;
  }

  async function handleField(event) {
    setJsonSuccess(false);

    if (event.target.value.length > 2) {
      if (IsJsonString(event.target.value)) {
        setJsonSuccess(true);
        setTextAreaError(false);
        setTextField(event.target.value);
      } else {
        setTextField(null);
        setTextAreaError(true);

        setJsonSuccess(false);
      }
    } else {
      setTextAreaError(false);
    }
    setField1(event.target.value);
  }

  const handleFieldCount = (event) => {
    /^[0-9]*$/.test(event.target.value)
      ? setFieldCountError(false)
      : setFieldCountError(true);

    setFieldCount(event.target.value);
  };

  const handleDynamicPrefix = (event) => {
    if (event.target.value.length > 1) {
      setDynamicPrefix(event.target.value);
    } else {
      setDynamicPrefix(null);
    }
  };

  const handleType = (event) => {
    setType(event.target.value);
  };

  const handleMasterPosition = (event) => {
    setMasterPosition(event.target.value);
    // setMasterPositionId(event.target.value[0].index);
  };

  const handleLayout = (event) => {
    setLayout(event.target.value);
  };

  const handleXPos = (event) => {
    setXPos(parseInt(event.target.value));
  };

  const handleYPos = (event) => {
    setYPos(parseInt(event.target.value));
  };

  const handleMaxItems = (event) => {
    setMaxItems(parseInt(event.target.value));
  };

  const handleMarginRight = (event) => {
    setMarginRight(parseInt(event.target.value));
  };
  const handleMarginBottom = (event) => {
    setMarginBottom(parseInt(event.target.value));
  };

  return (
    <Box sx={{ p: 10, my: 4, width: "300px", color: "black" }}>
      <Typography variant="h3" component="p" gutterBottom sx={{ mb: 10 }}>
        Designgenerator Generator
      </Typography>
      <FormControl sx={{ width: "1000px", mb: 3 }}>
        <TextField
          onChange={handleField}
          fullWidth
          label="Klistra in din JSON-kod från Designgeneratorn"
          multiline
          rows={12}
          error={textAreaError}
          color={textAreaError ? "" : jsonSuccess ? "success" : "primary"}
          helperText={
            textAreaError
              ? `Not a valid JSON format`
              : jsonSuccess
              ? "Correct JSON"
              : ""
          }
        />
      </FormControl>

      <Box
        sx={{
          width: "1000px",
          border: "1px solid lightgrey",
          borderRadius: "4px",
          padding: "2rem 2rem 2rem 1rem",
          mb: 10,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Typography
          sx={{ pr: 6, color: "#686868de", mt: -2 }}
          variant="body1"
          color="info"
        >
          1
        </Typography>
        <FormControl sx={{ width: "200px" }}>
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={type}
            label="Type"
            onChange={handleType}
          >
            <MenuItem value={"index"}>Add group index</MenuItem>
            <MenuItem value={"replace"}>Replace string</MenuItem>
            <MenuItem value={"position"}>Positioning</MenuItem>
          </Select>
        </FormControl>

        {/* Add group index */}

        {type === "index" && (
          <>
            <FormControl sx={{ width: "200px", ml: 3 }}>
              <TextField
                // onChange={handleDynamicPrefix}
                id="outlined-basic"
                label="Prefix"
                variant="outlined"
              />
            </FormControl>
          </>
        )}

        {/* Replace String */}

        {type === "replace" && (
          <>
            <FormControl sx={{ width: "200px", ml: 3 }}>
              <TextField
                // onChange={handleDynamicPrefix}
                id="outlined-basic"
                label="Find"
                variant="outlined"
              />
            </FormControl>

            <FormControl sx={{ width: "200px", ml: 3 }}>
              <TextField
                // onChange={handleDynamicPrefix}
                id="outlined-basic"
                label="Replace"
                variant="outlined"
              />
            </FormControl>
          </>
        )}

        {/* Master position */}

        {type === "position" && parsedTextField !== undefined && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <FormControl sx={{ width: "250px", ml: 3 }}>
              <InputLabel id="demo-simple-select-label">Master</InputLabel>
              <Select
                labelId="masterPos3"
                id="masterPos"
                value={masterPosition ? masterPosition : ""}
                label="Type"
                onChange={handleMasterPosition}
              >
                {parsedTextField.map((a, i) => (
                  <MenuItem key={a.name} value={a.name} data-id={i}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",

                flexWrap: "wrap",
              }}
            >
              <FormControl sx={{ width: "150px", ml: 3, mb: 3 }}>
                <InputLabel id="layout1">Layout</InputLabel>
                <Select
                  labelId="demo-layout"
                  id="dgg-layout"
                  value={layout}
                  label="Type"
                  onChange={handleLayout}
                >
                  <MenuItem value={"column"}>Column</MenuItem>
                  <MenuItem value={"row"}>Row</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ width: "150px", ml: 3 }}>
                <TextField
                  // onChange={handleDynamicPrefix}
                  id="outlined-basic"
                  label="Start X"
                  variant="outlined"
                  onChange={handleXPos}
                />
              </FormControl>
              <FormControl sx={{ width: "150px", ml: 3 }}>
                <TextField
                  // onChange={handleDynamicPrefix}
                  id="outlined-basic"
                  label="Start Y"
                  variant="outlined"
                  onChange={handleYPos}
                />
              </FormControl>
              <FormControl sx={{ width: "150px", ml: 3 }}>
                <TextField
                  // onChange={handleDynamicPrefix}
                  id="outlined-basic"
                  label={`Max items in ${layout}`}
                  variant="outlined"
                  onChange={handleMaxItems}
                />
              </FormControl>
              <FormControl sx={{ width: "150px", ml: 3 }}>
                <TextField
                  // onChange={handleDynamicPrefix}
                  id="outlined-basic"
                  label="Margin Right"
                  variant="outlined"
                  onChange={handleMarginRight}
                />
              </FormControl>
              <FormControl sx={{ width: "150px", ml: 3 }}>
                <TextField
                  // onChange={handleDynamicPrefix}
                  id="outlined-basic"
                  label="Margin Bottom"
                  variant="outlined"
                  onChange={handleMarginBottom}
                />
              </FormControl>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: "800px",
          display: "flex",
          flexDirection: "row",
          "& > :not(style)": { mr: 3, width: "200px" },
          mb: 20,
        }}
        noValidate
        autoComplete="off"
      >
        <FormControl sx={{ width: "200px", ml: 3 }}>
          <TextField
            disabled={
              jsonSuccess && !fieldCountError && fieldCount.length > 0
                ? false
                : true
            }
            onChange={handleDynamicPrefix}
            id="outlined-basic"
            label="String"
            variant="outlined"
          />
        </FormControl>
        <FormControl sx={{ width: "150px", ml: 3 }}>
          <TextField
            disabled={jsonSuccess ? false : true}
            onChange={handleFieldCount}
            id="outlined-basic"
            label="Number of groups"
            variant="outlined"
            helperText={fieldCountError ? `Please, type in a number` : ""}
            color={fieldCountError ? "error" : "success"}
          />
        </FormControl>

        <Button
          disabled={
            jsonSuccess && !fieldCountError && dynamicPrefix !== null
              ? false
              : true
          }
          sx={{ p: 1.85, mb: 20 }}
          onClick={() => {
            navigator.clipboard.writeText(generateClusters());
          }}
          color="success"
          variant="contained"
          size="large"
        >
          Grab the JSON
        </Button>
      </Box>
    </Box>
  );
}
