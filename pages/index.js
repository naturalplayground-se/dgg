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
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export default function Index() {
  const [type, setType] = React.useState("");
  const [typeArray, setTypeArray] = React.useState([]);
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

  //Replace
  const [replaceType, setReplaceType] = React.useState("");
  const [replaceFind, setReplaceFind] = React.useState(null);

  const [findString, setFindString] = React.useState(null);
  const [alphabetical, setAlpabetical] = React.useState(null);
  const [numerical, setNumerical] = React.useState(null);

  const [xPos, setXPos] = React.useState(null);
  const [yPos, setYPos] = React.useState(null);
  const [distance, setDistance] = React.useState(null);
  const [maxItems, setMaxItems] = React.useState(null);
  const [spaceX, setspaceX] = React.useState(null);
  const [spaceY, setspaceY] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const rowRefs = React.useRef(new Array());
  const [hasPosition, setHasPosition] = React.useState(false);
  const [showHide, setShowHide] = React.useState(false);
  // const [showHideNameArray, setShowHideNameArray] = React.useState([]);

  // const [showHideOptions, setShowHideOptions] = React.useState({});

  const [showHideField, setShowHideField] = React.useState([]);

  const [dynamicSpaceX, setDynamicSpaceX] = React.useState(false);
  const [dynamicSpaceY, setDynamicSpaceY] = React.useState(false);

  const [jason, setJason] = React.useState(false);

  const typeItems = [
    { value: "replace", label: "Replace string" },
    { value: "position", label: "Positioning" },
    { value: "showHide", label: "Generate Show/Hide" },
  ];

  // React.useEffect(() => {
  //   typeArray.length === 0 ? setTypeArray([type]) : "";
  // }, [type]);

  React.useEffect(() => {
    let timer1 = setTimeout(() => setJason(false), 4000);
    return () => {
      clearTimeout(timer1);
    };
  }, [jason]);

  React.useEffect(() => {
    if (jsonSuccess) {
      const isParsed = JSON.parse(`[${textField}]`);
      setParsedTextField(isParsed);
    } else {
      setParsedTextField(null);
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

  React.useEffect(() => {
    if (typeArray.length > 0) {
      const string1 = Object.values(typeArray).map((val) => val.name)[0];
      setHasPosition(string1 === "position");
    } else {
      setHasPosition(false);
    }
  }, [typeArray, rows]);

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
  let newOptionArray = [];

  const dynamicTextfield = (i) => {
    if (textField !== null) {
      const regex = new RegExp(dynamicPrefix, "g");
      const replaced = textField.replace(regex, `${prefix[i]}_`);

      // const alphabeticalRegex = alphabetical
      //   ? new RegExp(alphabetical, "g")
      //   : "";
      // const alphabeticalFilter = alphabetical
      //   ? textField.replace(alphabeticalRegex, `${[i + 1]}`)
      //   : textField;

      // const numericalRegex = numerical ? new RegExp(numerical, "g") : "";
      // const numericalFilter = numerical
      //   ? alphabeticalFilter.replace(numericalRegex, `${[i + 1]}`)
      //   : alphabeticalFilter;

      const numericalRegex = numerical ? new RegExp(numerical, "g") : "";
      const replacedSecond = numerical
        ? replaced.replace(numericalRegex, `${[i + 1]}`)
        : replaced;

      const parsed = JSON.parse(`[${replacedSecond}]`);

      if (masterPosition !== null) {
        if (layout === "column") {
          Object.values(parsed).forEach((field, index) => {
            index === keyPosition
              ? ((field.y = yPositionsColumn(i, arrayNames[i - 1])),
                (field.x = xPositionsColumn(i, arrayNames)),
                arrayNames.push(field.name))
              : "";
          });
        } else {
          Object.values(parsed).forEach((field, index) => {
            index === keyPosition
              ? ((field.y = yPositionsRow(i, arrayNames)),
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

  const generateShowHide = (i, names) => {
    const hideItems = names.length - i - 1;
    const last = i === names.length - 1;

    const showNames = names;
    const hideNames = names;

    const showArray = [];
    showNames.slice(0, i + 1).map((val) => {
      showArray.push(`${val},`);
    });

    const hideArray = [];
    hideNames.slice(-hideItems).map((val) => {
      hideArray.push(`${val},`);
    });

    const showArrayStripped = showArray.join("").substring(1).slice(0, -2);
    const hideArrayStripped = hideArray.join("").substring(1).slice(0, -2);

    const dropdownObject = {
      title: i + 1,
      selected: i === 0 ? true : false,
      show: [showArrayStripped],
      hide: last ? ["fieldX"] : [hideArrayStripped],
    };

    return dropdownObject;
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
    } else
      return `${name}.${dynamicSpaceY ? "bottom" : "top"} + ${
        spaceY ? spaceY : 200
      }`;
  };

  const xPositionsColumn = (i, arrayNames) => {
    const newMaxItems = maxItems ? maxItems : 200;

    if (xPos !== null) {
      if (i <= newMaxItems - 1) {
        return xPos;
      }
      if (i > newMaxItems - 1) {
        return `${arrayNames[i - newMaxItems]}.${
          dynamicSpaceX ? "right" : "left"
        } + ${spaceX ? spaceX : 200}`;
      }
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
        return `${name}.${dynamicSpaceX ? "right" : "left"} + ${
          spaceX ? spaceX : 200
        }`;
      }
    } else {
      return 666;
    }
  };

  const yPositionsRow = (i, arrayNames) => {
    const newMaxItems = maxItems ? maxItems : 200;
    if (yPos !== null) {
      if (i <= newMaxItems - 1) {
        return yPos;
      }
      if (i > newMaxItems - 1) {
        return `${arrayNames[i - newMaxItems]}.${
          dynamicSpaceY ? "bottom" : "top"
        } + ${spaceY ? spaceY : 200}`;
      }
    } else {
      return 666;
    }
  };

  const generateClusters = () => {
    let clusters = [];
    let clusterObject = [];

    for (let i = 0; i < fieldCount; i++) {
      const stringObject = `${JSON.stringify(dynamicTextfield(i))
        .substring(1)
        .slice(0, -1)},`;

      clusters.push(stringObject);
      clusterObject.push(dynamicTextfield(i));
    }

    if (showHide) {
      const clusterNames = [];
      clusterObject.map((val, i) =>
        clusterNames.push(val.map((value) => `"${value.name}"`))
      );

      const clusterOptions = [];
      for (let i = 0; i < fieldCount; i++) {
        clusterOptions.push(generateShowHide(i, clusterNames));
      }

      const showHideObject = {
        name: "select",
        title: "Välj i listan",
        type: "select",
        options: clusterOptions,
        editui: "selectlist",
        editable: true,
      };

      const showHideObjectString = JSON.stringify(showHideObject).replace(
        /\\/g,
        ""
      );

      setShowHideField(showHideObjectString);
    }

    const mergedWithShowHide = [showHideField].concat(clusters.join(""));

    const merged = clusters.join("");

    grabJason();

    // return showHide ? mergedWithShowHide : merged;
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

  const handleType = (event, i) => {
    let selectedTypes = [...typeArray];
    let thisType = { ...typeArray[i] };
    thisType.name = `${event.target.value}`;
    selectedTypes[i] = thisType;
    setTypeArray(selectedTypes);

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

  const handleDynamicSpaceX = (event) => {
    setDynamicSpaceX(!dynamicSpaceX);
  };

  const handleDynamicSpaceY = (event) => {
    setDynamicSpaceY(!dynamicSpaceY);
  };

  const handleAddRows = (event, length) => {
    setRows([...rows, length]);
    // if (typeArray.length === 0) {
    //   setTypeArray([`${type}`]);
    // }
  };

  const handleRemoveRow = (event, i) => {
    const array = [...rows];
    array.splice(i, 1);
    setRows(array);
    const newTypearray = [...typeArray];
    newTypearray.splice(i, 1);
    setTypeArray(newTypearray);
  };

  const grabJason = () => {
    setJason(true);
  };
  const handleReplaceType = (event) => {
    setReplaceType(event.target.value);
  };

  const handleReplaceFind = (event) => {
    setReplaceFind(event.target.value);
    if (replaceType === "string") {
      setFindString(event.target.value);
      setAlpabetical(null);
      setNumerical(null);
    }
    if (replaceType === "alphabetical") {
      setAlpabetical(event.target.value);
      setFindString(null);
      setNumerical(null);
    }
    if (replaceType === "numerical") {
      setNumerical(event.target.value);
      setAlpabetical(null);
      setFindString(null);
    } else {
      return "";
    }
  };

  return (
    <Box sx={{ p: 10, my: 4, width: "300px", color: "black" }}>
      <Typography variant="h3" component="p" gutterBottom sx={{ mb: 10 }}>
        Designgenerator Generator [WIP]
      </Typography>
      <Box sx={{ position: "relative", width: "1000px" }}>
        <FormControl sx={{ width: "100%", mb: 10 }}>
          <TextField
            onChange={handleField}
            fullWidth
            label="Paste JSON fields from Designgeneratorn (no square brackets)."
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
        {jsonSuccess && (
          <Box
            sx={{
              width: "100%",
              pointerEvents: "none",
              position: "absolute",
              right: -78,
              bottom: 105,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <img
              src={jason ? "/brandon2.png" : "/brandon1.png"}
              width="200px"
              height="200px"
              alt=""
            />
          </Box>
        )}
      </Box>

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
          onClick={(event) => handleAddRows(event, rows.length)}
        >
          <AddIcon fontSize="large" />
        </IconButton>
      </Box>

      {rows &&
        rows.map((val, i) => {
          return (
            <Box
              key={i}
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
                  onClick={(event) => handleRemoveRow(event, i)}
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
                <InputLabel id="type">Type</InputLabel>
                <Select
                  value={
                    typeArray.length
                      ? typeArray.length <= i
                        ? type !== null
                          ? ""
                          : ""
                        : typeArray[i].name
                      : type !== null
                      ? ""
                      : ""
                  }
                  name={type}
                  label="Type"
                  onChange={(event) => handleType(event, i)}
                >
                  {typeItems.map((item, i) => (
                    //   /* prettier-ignore */
                    //   (Object.values(item)[0] === "position") ? (
                    //   hasPosition ? "" :   <MenuItem key={i} value={Object.values(item)[0]}>
                    //   {Object.values(item)[1]}
                    // </MenuItem>
                    //   ) : (
                    <MenuItem key={i} value={Object.values(item)[0]}>
                      {Object.values(item)[1]}
                    </MenuItem>
                  ))}
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

              {typeArray[i] !== undefined && typeArray[i].name === "replace" && (
                <>
                  <FormControl sx={{ width: "200px", ml: 3 }}>
                    <InputLabel id="replace-string-type">Type</InputLabel>
                    <Select
                      value={replaceType}
                      name={type}
                      label="Type"
                      onChange={(event) => handleReplaceType(event)}
                    >
                      <MenuItem value="alphabetical">
                        Incremental Alphabetical
                      </MenuItem>
                      <MenuItem value="numerical">
                        Incremental Numerical
                      </MenuItem>
                      <MenuItem value="string">String</MenuItem>
                    </Select>
                  </FormControl>

                  {replaceType !== "" && (
                    <FormControl sx={{ width: "200px", ml: 3 }}>
                      <TextField
                        id="outlined-basic"
                        label="Find"
                        variant="outlined"
                        value={replaceFind}
                        name={replaceFind}
                        onChange={(event) => handleReplaceFind(event)}
                      />
                    </FormControl>
                  )}

                  {replaceType === "string" && (
                    <FormControl sx={{ width: "200px", ml: 3 }}>
                      <TextField
                        id="outlined-basic"
                        label="String"
                        variant="outlined"
                      />
                    </FormControl>
                  )}
                </>
              )}

              {/* Master position */}

              {typeArray[i] !== undefined &&
                typeArray[i].name === "position" &&
                parsedTextField !== null && (
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
                      <Box sx={{ width: "300px", mt: 3, ml: 3 }}>
                        <FormGroup>
                          <FormControlLabel
                            disabled={spaceX ? false : true}
                            control={
                              <Checkbox
                                checked={dynamicSpaceX}
                                onChange={handleDynamicSpaceX}
                              />
                            }
                            label="Dynamic width - Space X"
                          />
                          <FormControlLabel
                            disabled={spaceY ? false : true}
                            control={
                              <Checkbox
                                checked={dynamicSpaceY}
                                onChange={handleDynamicSpaceY}
                              />
                            }
                            label="Dynamic height - Space Y"
                          />
                        </FormGroup>
                      </Box>
                    </Box>
                  </Box>
                )}
              {typeArray[i] !== undefined &&
                typeArray[i].name === "showHide" &&
                parsedTextField !== null &&
                showHide === true && (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      disabled={
                        jsonSuccess &&
                        !fieldCountError &&
                        dynamicPrefix !== null
                          ? false
                          : true
                      }
                      sx={{ p: 1.85, mr: 3 }}
                      onClick={() => {
                        navigator.clipboard.writeText(showHideField);
                      }}
                      color="success"
                      variant="text"
                      size="large"
                    >
                      Grab "Show/Hide" field
                    </Button>
                  </Box>
                )}
            </Box>
          );
        })}

      <Box
        sx={{
          width: "1000px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",

          mb: 20,
        }}
        noValidate
        autoComplete="off"
      >
        <FormControl sx={{ width: "200px", mr: 3, ml: 3 }}>
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
        <FormControl sx={{ width: "200px", mr: 3, ml: 3 }}>
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
        {/* {showHide && (
          <Button
            disabled={
              jsonSuccess && !fieldCountError && dynamicPrefix !== null
                ? false
                : true
            }
            sx={{ p: 1.85, mb: 20, mr: 3 }}
            onClick={() => {
              navigator.clipboard.writeText(generateClusters());
            }}
            color="info"
            variant="contained"
            size="large"
          >
            Grab Show Hide
          </Button>
        )} */}

        <Button
          disabled={
            jsonSuccess && !fieldCountError && dynamicPrefix !== null
              ? false
              : true
          }
          sx={{ p: 1.85, mb: 20 }}
          onClick={() => {
            navigator.clipboard.writeText(generateClusters()),
              setShowHide(true);
          }}
          color="success"
          variant="contained"
          size="large"
        >
          Grab JSON
        </Button>
      </Box>
    </Box>
  );
}
