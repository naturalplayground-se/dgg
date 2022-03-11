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
import CloseIcon from "@mui/icons-material/Close";

export default function Index() {
  const [type, setType] = React.useState("index");
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
  const [spaceX, setspaceX] = React.useState(null);
  const [spaceY, setspaceY] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const rowRefs = React.useRef(new Array());

  console.log(rows);
  console.log(rowRefs);

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
              ? ((field.y = yPositionsRow(i, arrayNames[i - 1])),
                (field.x = xPositionsRow(i, arrayNames[i - 1])),
                arrayNames.push(field.name))
              : "";
          });
        }
      }

      return parsed;
    } else {
      return "";
    }
  };

  const yPositionsColumn = (i, name) => {
    if (
      i === 0 ||
      i === maxItems ||
      i === maxItems * 2 ||
      i === maxItems * 3 ||
      i === maxItems * 4 ||
      i === maxItems * 5
    ) {
      return yPos;
    } else return `${name}.top + ${spaceY ? spaceY : 200}`;
  };

  const xPositionsColumn = (i) => {
    if (xPos !== null) {
      if (i < maxItems) {
        return xPos;
      }
      if (i < maxItems * 2) {
        return xPos + spaceX;
      }
      if (i < maxItems * 3) {
        return xPos + spaceX * 2;
      }
      if (i <= maxItems * 4) {
        return xPos + spaceX * 3;
      }
      if (i <= maxItems * 5) {
        return xPos + spaceX * 4;
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
        return `${name}.left + ${spaceX ? spaceX : 200}`;
      }
    } else {
      return 666;
    }
  };

  const yPositionsRow = (i) => {
    if (yPos !== null) {
      if (i < maxItems) {
        return yPos;
      }
      if (i < maxItems * 2) {
        return yPos + spaceY;
      }
      if (i < maxItems * 3) {
        return yPos + spaceY * 2;
      }
      if (i <= maxItems * 4) {
        return yPos + spaceY * 3;
      }
      if (i <= maxItems * 5) {
        return yPos + spaceY * 4;
      }
      if (i <= maxItems * 6) {
        return yPos + spaceY * 5;
      }
    } else {
      return 666;
    }
  };

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

  const handlespaceX = (event) => {
    setspaceX(parseInt(event.target.value));
  };
  const handlespaceY = (event) => {
    setspaceY(parseInt(event.target.value));
  };

  const handleRows = (event, length) => {
    setRows([...rows, length]);
  };

  const handleRow = (event, i) => {
    const array = [...rows];
    array.splice(i, 1);
    setRows(array);
  };

  return (
    <Box sx={{ p: 10, my: 4, width: "300px", color: "black" }}>
      <Typography variant="h3" component="p" gutterBottom sx={{ mb: 10 }}>
        Designgenerator Generator
      </Typography>
      <FormControl sx={{ width: "1000px", mb: 10 }}>
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
          display: "flex",
          justifyContent: "flex-end",
          width: "1000px",
          mb: 4,
        }}
      >
        <IconButton
          aria-label="Add row"
          onClick={(event) => handleRows(event, rows.length)}
        >
          <AddIcon fontSize="large" />
        </IconButton>
      </Box>

      {rows &&
        rows.map((val, i) => {
          return (
            <>
              <Box
                sx={{
                  position: "relative",
                  width: "1000px",
                  border: "1px solid lightgrey",
                  borderRadius: "4px",
                  padding: "2rem 2rem 2rem 1rem",
                  mb: 10,
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Box sx={{ position: "absolute", right: "0", top: "0" }}>
                  <IconButton
                    aria-label="Remove row"
                    onClick={(event) => handleRow(event, i)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  sx={{ pr: 6, color: "#686868de", mt: -2 }}
                  variant="body1"
                  color="info"
                >
                  {i + 1}
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
                    {/* {type !== "position" && ( */}
                    <MenuItem value={"position"}>Positioning</MenuItem>
                    {/* )} */}
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
                        id="outlined-basic"
                        label="Find"
                        variant="outlined"
                      />
                    </FormControl>

                    <FormControl sx={{ width: "200px", ml: 3 }}>
                      <TextField
                        id="outlined-basic"
                        label="Replace"
                        variant="outlined"
                      />
                    </FormControl>
                  </>
                )}

                {/* Master position */}

                {type === "position" && parsedTextField !== null && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <FormControl sx={{ width: "250px", ml: 3 }}>
                      <InputLabel id="demo-simple-select-label">
                        Master
                      </InputLabel>
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
                          label="Space X"
                          variant="outlined"
                          onChange={handlespaceX}
                        />
                      </FormControl>
                      <FormControl sx={{ width: "150px", ml: 3 }}>
                        <TextField
                          // onChange={handleDynamicPrefix}
                          id="outlined-basic"
                          label="Space Y"
                          variant="outlined"
                          onChange={handlespaceY}
                        />
                      </FormControl>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* <h3 ref={(element) => rowRefs.current.push(element)} key={i}>
                Row
                <IconButton
                  aria-label="Add row"
                  onClick={(event) => handleRow(event, i)}
                >
                  <CloseIcon fontSize="medium" />
                </IconButton>
              </h3> */}
            </>
          );
        })}

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
