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
import { v4 as uuidv4 } from "uuid";
import SelectFields from "../components/form/selectFields";
import Fab from "@mui/material/Fab";

export default function Index() {
  const [type, setType] = React.useState("");
  const [typeArray, setTypeArray] = React.useState([]);

  const [designGeneratorJson, setDesignGeneratorJson] = React.useState([]);

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
  // const [replaceType, setReplaceType] = React.useState("");

  // const [replaceType1, setReplaceType1] = React.useState([]);
  // const [replaceFind, setReplaceFind] = React.useState(null);

  // const [findString, setFindString] = React.useState(null);
  const [alphabetical, setAlphabetical] = React.useState(null);
  const [numerical, setNumerical] = React.useState("");

  const [rows, setRows] = React.useState([]);
  const [functionalityArray, setFunctionalityArray] = React.useState([]);

  const [hasPosition, setHasPosition] = React.useState(false);
  const [showHide, setShowHide] = React.useState(false);

  const data = [
    {
      text: "one",
    },
    {
      text: "two",
    },
    {
      text: "three",
    },
    {
      text: "four",
    },
  ];

  const elementsRef = React.useRef(data.map(() => React.createRef()));

  const [showHideField, setShowHideField] = React.useState([]);

  const [dynamicSpaceX, setDynamicSpaceX] = React.useState(false);
  const [dynamicSpaceY, setDynamicSpaceY] = React.useState(false);

  // const [jason, setJason] = React.useState(false);
  const [grabJson, setGrabJson] = React.useState([]);

  const typeItems = [
    { value: "replaceString", label: "Replace" },
    { value: "repetition", label: "Repetition" },
    { value: "showHide", label: "Generate Show/Hide" },
  ];

  // React.useEffect(() => {}, [functionalityArray]);

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
      const string1 = Object.values(functionalityArray).map(
        (val) => val.type
      )[0];
      setHasPosition(string1 === "repetition");
    } else {
      setHasPosition(false);
    }
  }, [typeArray, rows]);

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

  const prefixer = (index, name, prefix1) => {
    if (prefix1 !== "") {
      const newName = name.replace(prefix1, `${alphabet[index]}_`);

      return newName;
    } else {
      return name;
    }
  };

  const arrayNames = [];
  const arrayNames2 = [];

  const dynamicTextfield = (i) => {
    if (textField !== null) {
      const regex = new RegExp(dynamicPrefix, "g");
      const replaced = textField.replace(regex, `${prefix[i]}_`);

      const alphabeticalRegex = alphabetical
        ? new RegExp(alphabetical, "g")
        : "";
      const alphabeticalFilter = alphabetical
        ? textField.replace(alphabeticalRegex, `${prefix[i]}`)
        : textField;

      // const numericalRegex = numerical ? new RegExp(numerical, "g") : "";
      // const numericalFilter = numerical
      //   ? alphabeticalFilter.replace(numericalRegex, `${[i + 1]}`)
      //   : alphabeticalFilter;

      const numericalRegex = numerical ? new RegExp(numerical, "g") : "";
      const replacedSecond = numerical
        ? replaced.replace(numericalRegex, `${[i + 1]}`)
        : replaced;

      const parsed = JSON.parse(`[${replacedSecond}]`);

      Object.values(parsed).forEach((field, index) => {
        index === keyPosition ? arrayNames.push(field.name) : "";
      });

      if (masterPosition !== null) {
        if (layout === "column") {
          Object.values(parsed).forEach((field, index) => {
            index === keyPosition
              ? ((field.y = yPositionsColumn(i, arrayNames[i - 1])),
                (field.x = xPositionsColumn(i, arrayNames)))
              : // arrayNames.push(field.name))
                "";
          });
        } else {
          Object.values(parsed).forEach((field, index) => {
            index === keyPosition
              ? ((field.y = yPositionsRow(i, arrayNames)),
                (field.x = xPositionsRow(i, arrayNames[i - 1])))
              : // arrayNames.push(field.name))
                "";
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
      title: `${i + 1}`,
      selected: i === 0 ? true : false,
      show: [showArrayStripped],
      hide: last ? ["fieldX"] : [hideArrayStripped],
    };

    return dropdownObject;
  };

  const yPositionsColumn = (i, layoutObject, y, masterNames) => {
    const maxItems = parseInt(layoutObject.maxItems);
    const name = masterNames[i - 1];
    // const name = masterNames[i - maxItems];

    if (
      i === 0 ||
      i === maxItems ||
      i === maxItems * 2 ||
      i === maxItems * 3 ||
      i === maxItems * 4 ||
      i === maxItems * 5
    ) {
      return y;
    } else
      return `${name}.${
        layoutObject.dynamicHeightSpaceY ? "bottom" : "top"
      } + ${layoutObject.spaceY ? layoutObject.spaceY : 200}`;
  };

  const xPositionsColumn = (i, layoutObject, x, masterNames) => {
    const maxItems = parseInt(layoutObject.maxItems);
    const name = masterNames[i - maxItems];

    if (i <= maxItems - 1) {
      return x;
    }
    if (i > maxItems - 1) {
      return `${name}.${layoutObject.dynamicWidthSpaceX ? "right" : "left"} + ${
        layoutObject.spaceX ? layoutObject.spaceX : 200
      }`;
    }
  };

  const xPositionsRow = (i, layoutObject, x, masterNames) => {
    const maxItems = parseInt(layoutObject.maxItems);
    const name = masterNames[i - 1];

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
      return x;
    } else {
      return `${name}.${layoutObject.dynamicWidthSpaceX ? "right" : "left"} + ${
        layoutObject.spaceX ? layoutObject.spaceX : 200
      }`;
    }
  };

  const yPositionsRow = (i, layoutObject, y, masterNames) => {
    const maxItems = parseInt(layoutObject.maxItems);
    const name = masterNames[i - maxItems];

    if (i <= maxItems - 1) {
      return y;
    }
    if (i > maxItems - 1) {
      return `${name}.${
        layoutObject.dynamicHeightSpaceY ? "bottom" : "top"
      } + ${layoutObject.spaceY ? layoutObject.spaceY : 200}`;
    }
  };

  const generateJSON = () => {
    let groupsObject = [];

    const layoutIndex = functionalityArray.findIndex((object) => {
      return object.type === "repetition";
    });

    const masterNames = [];

    if (layoutIndex !== -1) {
      const layoutObject = functionalityArray[layoutIndex].layoutObject;
      const regex = new RegExp(`${layoutObject.prefix}`, "g");

      //  Construct a mastername array
      for (let index = 0; index < layoutObject.groups; index++) {
        layoutObject.selectedFields.map((obj, i) => {
          if (obj.name === layoutObject.master) {
            masterNames.push(obj.name.replace(regex, `${alphabet[index]}_`));
          }
        });
      }

      // Loops ("Number of groups") and if the field has been selected as master, applies new positions.

      for (let index = 0; index < layoutObject.groups; index++) {
        const fieldGroup = layoutObject.selectedFields.map((obj, i) => {
          const newField = { ...obj };
          newField.name = obj.name.replace(regex, `${alphabet[index]}_`);

          if (obj.name === layoutObject.master) {
            if (layoutObject.direction === "row") {
              (newField.y = yPositionsRow(
                index,
                layoutObject,
                obj.y,
                masterNames
              )),
                (newField.x = xPositionsRow(
                  index,
                  layoutObject,
                  obj.x,
                  masterNames
                ));
            }
            if (layoutObject.direction === "column") {
              (newField.y = yPositionsColumn(
                index,
                layoutObject,
                obj.y,
                masterNames
              )),
                (newField.x = xPositionsColumn(
                  index,
                  layoutObject,
                  obj.x,
                  masterNames
                ));
            }
          }
          if (obj.name !== layoutObject.master) {
            const stringField = JSON.stringify(newField);
            const replacedField = stringField.replace(
              regex,
              `${alphabet[index]}_`
            );
            const jsonField = JSON.parse(replacedField);
            newField = jsonField;
          }

          return { ...newField };
        });

        groupsObject.push(fieldGroup);
      }
    } else {
      return "";
    }

    const allGroups = groupsObject.flat();
    const selectedFieldNames = [];
    layoutObject.selectedFields.map((field) =>
      selectedFieldNames.push(field.name)
    );

    const newFields = [];
    const firstSelectedField = [];

    designGeneratorJson[0].fields.map((field, i) =>
      selectedFieldNames.indexOf(field.name) === -1
        ? newFields.push(field)
        : firstSelectedField.push(i)
    );

    newFields.splice(firstSelectedField[0], 0, ...allGroups);

    const newDesignGeneratorJson = designGeneratorJson.map((obj) => {
      if (obj.fields) {
        return { ...obj, fields: newFields };
      }

      return obj;
    });

    setGrabJson(newDesignGeneratorJson);

    // grabJason();

    console.log("grabJson");
    console.log(grabJson[0].fields);

    console.log("grabJson.x");
    console.log(grabJson[0].fields[5].x);

    return JSON.stringify(grabJson);
  };

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

  const handleSelectFields = (fields, id) => {
    handleFunctionality(fields, id, "selectedFields");
    // setSelectedFields(fields);
  };

  const handleAddRows = (event, length) => {
    const rowObject = {
      id: uuidv4(),
      type: "",
      replaceStringObject: { type: "", input1: "", input2: "" },
      layoutObject: {
        selectedFields: {},
        groups: "",
        master: "",
        direction: "",
        startX: "",
        startY: "",
        maxItems: "",
        spaceX: "",
        spaceY: "",
        dynamicWidthSpaceX: false,
        dynamicHeightSpaceY: false,
        prefix: "",
        numbering: "",
      },
      showHideObject: { input1: "", input2: "", input3: "" },
    };

    const oldArray = functionalityArray;
    setFunctionalityArray([rowObject, ...oldArray]);
    setRows([...rows, length]);
  };

  const handleRemoveRow = (event, i) => {
    const getRow = 8;

    const rowId =
      elementsRef.current[0].current !== null
        ? elementsRef.current[i].current.id
        : "0";

    if (functionalityArray.length > 0) {
      functionalityArray.map((val, index) => {
        if (val.id === rowId) {
          // if (val.id === `row-${i + 1}`) {
          const array = [...functionalityArray];
          array.splice(index, 1);
          setFunctionalityArray(array);
        }
      });
    }
  };

  const handleUpdateRows = (event, id, cat) => {
    const index = functionalityArray.findIndex((object) => {
      return object.id === id;
    });

    let newArray = [...functionalityArray];
    let thisObject = { ...functionalityArray[index] };

    if (cat === "updateRow") {
      if (index !== -1) {
        newArray[index].type = event.target.value;
        setFunctionalityArray(newArray);
      } else {
        newArray[0].type = event.target.value;
        setFunctionalityArray(newArray);
      }
    }
    if (cat === "replaceString") {
      if (index !== -1) {
        newArray[index].replaceStringObject.type = event.target.value;
        setFunctionalityArray(newArray);
      } else {
        newArray[0].replaceStringObject.type = event.target.value;
        setFunctionalityArray(newArray);
      }
    }
  };

  // const grabJason = () => {
  //   setJason(true);
  // };

  const handleReplace = (event, id, type) => {
    let newArray = [...functionalityArray];

    const index = functionalityArray.findIndex((object) => {
      return object.id === id;
    });

    if (type === "find") {
      newArray[index].replaceStringObject.input1 = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "replace") {
      newArray[index].replaceStringObject.input2 = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "alphabetical" || type === "numerical") {
      newArray[index].replaceStringObject.input1 = event.target.value;
      newArray[index].replaceStringObject.input2 = "";
      setFunctionalityArray(newArray);
    }
  };

  const handleFunctionality = (event, id, type) => {
    let newArray = [...functionalityArray];

    const index = functionalityArray.findIndex((object) => {
      return object.id === id;
    });

    if (type === "selectedFields") {
      newArray[index].layoutObject.selectedFields = event;
      setFunctionalityArray(newArray);
    }

    if (type === "groups") {
      newArray[index].layoutObject.groups = event.target.value;
      setFunctionalityArray(newArray);
    }

    if (type === "master") {
      newArray[index].layoutObject.master = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "direction") {
      newArray[index].layoutObject.direction = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "startX") {
      newArray[index].layoutObject.startX = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "startY") {
      newArray[index].layoutObject.startY = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "maxItems") {
      newArray[index].layoutObject.maxItems = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "spaceX") {
      newArray[index].layoutObject.spaceX = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "spaceY") {
      newArray[index].layoutObject.spaceY = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "dynamicWidthSpaceX") {
      if (newArray[index].layoutObject.dynamicWidthSpaceX) {
        newArray[index].layoutObject.dynamicWidthSpaceX = false;
      } else {
        newArray[index].layoutObject.dynamicWidthSpaceX = true;
      }
      setFunctionalityArray(newArray);
    }
    if (type === "dynamicHeightSpaceY") {
      if (newArray[index].layoutObject.dynamicHeightSpaceY) {
        newArray[index].layoutObject.dynamicHeightSpaceY = false;
      } else {
        newArray[index].layoutObject.dynamicHeightSpaceY = true;
      }
      setFunctionalityArray(newArray);
    }
    if (type === "numbering") {
      newArray[index].layoutObject.numbering = event.target.value;
      setFunctionalityArray(newArray);
    }
    if (type === "prefix") {
      newArray[index].layoutObject.prefix = event.target.value;
      setFunctionalityArray(newArray);
    }
  };

  console.log("functionalityArray");
  console.log(functionalityArray);

  return (
    <Box sx={{ p: 10, my: 4, width: "1000px", color: "black" }}>
      <Typography variant="h4" component="p" gutterBottom sx={{ mb: 10 }}>
        1. Paste Designgenerator JSON
      </Typography>
      <Box sx={{ position: "relative", width: "1000px" }}>
        <FormControl sx={{ width: "100%", mb: 10 }}>
          <TextField
            onChange={handleField}
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
      {/* {jsonSuccess && (
        <Box sx={{ position: "relative", width: "1000px" }}>
          <Typography variant="h4" component="p" gutterBottom sx={{ mb: 10 }}>
            2. Select Fields
          </Typography>
          <SelectFields
            handleSelectFields={handleSelectFields}
            designGeneratorJson={designGeneratorJson[0].fields}
          />
        </Box>
      )} */}
      <Box
        sx={{
          mt: 10,
          mb: 10,
          width: "1000px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h4" component="p" gutterBottom sx={{ mb: 1 }}>
          Add functionality
        </Typography>
        <Box sx={{ "& > :not(style)": { m: 1 } }}>
          <Fab
            color="success"
            aria-label="add"
            onClick={(event) => handleAddRows(event, rows.length)}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {functionalityArray &&
        functionalityArray.map((val, i) => {
          return (
            <Box
              key={i}
              id={val.id}
              ref={elementsRef.current[i]}
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
              <FormControl sx={{ minWidth: "200px" }}>
                <InputLabel id="type">Category</InputLabel>
                <Select
                  value={
                    functionalityArray.length
                      ? functionalityArray.length <= i
                        ? type !== null
                          ? ""
                          : ""
                        : functionalityArray[i].type
                      : type !== null
                      ? ""
                      : ""
                  }
                  name={type}
                  label="Type"
                  onChange={(event) =>
                    handleUpdateRows(event, val.id, "updateRow")
                  }
                >
                  {typeItems.map((item, i) => (
                    <MenuItem key={i} value={Object.values(item)[0]}>
                      {Object.values(item)[1]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Add group index */}
              {type === "index" && (
                <>
                  <FormControl sx={{ width: "145px", ml: 3 }}>
                    <TextField id="index" label="Prefix" variant="outlined" />
                  </FormControl>
                </>
              )}
              {/* Replace */}
              {val.type === "replaceString" && (
                <>
                  <FormControl sx={{ width: "145px", ml: 3 }}>
                    <InputLabel id="replace-string-type">Type</InputLabel>
                    <Select
                      value={val.replaceStringObject.type}
                      onChange={(event) =>
                        handleUpdateRows(event, val.id, "replaceString")
                      }
                    >
                      <MenuItem value={`alphabetical`}>
                        Incremental Alphabetical
                      </MenuItem>
                      <MenuItem value={`numerical`}>
                        Incremental Numerical
                      </MenuItem>
                      <MenuItem value={`string`}>String</MenuItem>
                    </Select>
                  </FormControl>

                  {val.replaceStringObject.type === "alphabetical" && (
                    <FormControl sx={{ width: "145px", ml: 3 }}>
                      <TextField
                        id="Alphabetical-input1"
                        label="Find"
                        variant="outlined"
                        value={val.replaceStringObject.input1}
                        onChange={(event) =>
                          handleReplace(event, val.id, "alphabetical")
                        }
                      />
                    </FormControl>
                  )}

                  {val.replaceStringObject.type === "numerical" && (
                    <FormControl sx={{ width: "145px", ml: 3 }}>
                      <TextField
                        id="Alphabetical-input1"
                        label="Find"
                        variant="outlined"
                        value={val.replaceStringObject.input1}
                        onChange={(event) =>
                          handleReplace(event, val.id, "numerical")
                        }
                      />
                    </FormControl>
                  )}

                  {val.replaceStringObject.type === "string" && (
                    <FormControl sx={{ width: "145px", ml: 3 }}>
                      <TextField
                        id="Find-input1"
                        label="Find"
                        variant="outlined"
                        value={val.replaceStringObject.input1}
                        // name={replaceFind}
                        onChange={(event) =>
                          handleReplace(event, val.id, "find")
                        }
                      />
                    </FormControl>
                  )}

                  {val.replaceStringObject.type === "string" && (
                    <FormControl sx={{ width: "145px", ml: 3 }}>
                      <TextField
                        id="Replace-input2"
                        label="Replace"
                        variant="outlined"
                        value={val.replaceStringObject.input2}
                        onChange={(event) =>
                          handleReplace(event, val.id, "replace")
                        }
                      />
                    </FormControl>
                  )}
                </>
              )}
              {/* Layout */}
              {val.type === "repetition" && parsedTextField !== null && (
                <Box
                  sx={{
                    ml: "20px",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "20px 20px",
                    width: "650px",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      pb: "2rem",
                      pr: "10px",
                    }}
                  >
                    <SelectFields
                      id={val.id}
                      handleSelectFields={handleSelectFields}
                      designGeneratorJson={designGeneratorJson[0].fields}
                    />
                  </Box>
                  <FormControl sx={{ width: "145px" }}>
                    <InputLabel id="master">Master</InputLabel>
                    <Select
                      id="master"
                      value={val.layoutObject.master}
                      label="Type"
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "master")
                      }
                    >
                      {val.layoutObject.selectedFields.length > 0
                        ? val.layoutObject.selectedFields.map((a, i) => (
                            <MenuItem key={i} value={a.name} data-id={i}>
                              {a.name}
                            </MenuItem>
                          ))
                        : ""}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ width: "145px" }}>
                    <TextField
                      id="groups"
                      label="Number of groups"
                      variant="outlined"
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "groups")
                      }
                    />
                  </FormControl>

                  <FormControl sx={{ width: "145px" }}>
                    <InputLabel id="layout1">Direction</InputLabel>
                    <Select
                      id="direction"
                      value={val.layoutObject.direction}
                      label="Type"
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "direction")
                      }
                    >
                      <MenuItem value={"column"}>Column</MenuItem>
                      <MenuItem value={"row"}>Row</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ width: "145px" }}>
                    <TextField
                      id="maxItems"
                      label={`Max groups in ${val.layoutObject.direction}`}
                      variant="outlined"
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "maxItems")
                      }
                    />
                  </FormControl>

                  <FormControl sx={{ width: "145px" }}>
                    <TextField
                      id="spaceX"
                      label="Space X"
                      variant="outlined"
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "spaceX")
                      }
                    />
                  </FormControl>
                  <FormControl sx={{ width: "145px" }}>
                    <TextField
                      id="spaceY"
                      label="Space Y"
                      variant="outlined"
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "spaceY")
                      }
                    />
                  </FormControl>
                  <Box sx={{ width: "650px" }}>
                    <FormGroup>
                      <FormControlLabel
                        disabled={val.layoutObject.spaceX !== "" ? false : true}
                        control={
                          <Checkbox
                            checked={val.layoutObject.dynamicWidthSpaceX}
                            onChange={(event) =>
                              handleFunctionality(
                                event,
                                val.id,
                                "dynamicWidthSpaceX"
                              )
                            }
                          />
                        }
                        label="Dynamic width - Space X"
                      />
                      <FormControlLabel
                        disabled={val.layoutObject.spaceY !== "" ? false : true}
                        control={
                          <Checkbox
                            checked={val.layoutObject.dynamicHeightSpaceY}
                            onChange={(event) =>
                              handleFunctionality(
                                event,
                                val.id,
                                "dynamicHeightSpaceY"
                              )
                            }
                          />
                        }
                        label="Dynamic height - Space Y"
                      />
                    </FormGroup>
                  </Box>
                  <Box sx={{ width: "650px" }}>
                    <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
                      <FormControl sx={{ width: "145px", mr: 3 }}>
                        <TextField
                          id="prefix"
                          label="Prefix replacement"
                          variant="outlined"
                          onChange={(event) =>
                            handleFunctionality(event, val.id, "prefix")
                          }
                        />
                      </FormControl>
                      <FormControl sx={{ width: "145px" }}>
                        <TextField
                          id="numbering"
                          label="Number replacement"
                          variant="outlined"
                          onChange={(event) =>
                            handleFunctionality(event, val.id, "numbering")
                          }
                        />
                      </FormControl>
                    </FormGroup>
                  </Box>
                </Box>
              )}
              {val.type === "showHide" && parsedTextField !== null && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    disabled={
                      jsonSuccess && !fieldCountError && dynamicPrefix !== null
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
        {/* <FormControl sx={{ width: "145px", mr: 3, ml: 3 }}>
          <TextField
            disabled={jsonSuccess ? false : true}
            onChange={handleFieldCount}
            id="outlined-basic"
            label="Number of groups"
            variant="outlined"
            helperText={fieldCountError ? `Please, type in a number` : ""}
            color={fieldCountError ? "error" : "success"}
          />
        </FormControl> */}
        {/* <FormControl sx={{ width: "145px", mr: 3, ml: 3 }}>
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
        </FormControl> */}
        {/* {showHide && (
          <Button
            disabled={
              jsonSuccess && !fieldCountError && dynamicPrefix !== null
                ? false
                : true
            }
            sx={{ p: 1.85, mb: 20, mr: 3 }}
            onClick={() => {
              navigator.clipboard.writeText(generateJSON());
            }}
            color="info"
            variant="contained"
            size="large"
          >
            Grab Show Hide
          </Button>
        )} */}

        <Button
          disabled={jsonSuccess && functionalityArray.length > 0 ? false : true}
          sx={{ p: 1.85, mb: 20 }}
          onClick={() => {
            navigator.clipboard.writeText(generateJSON());
            // setShowHide(true);
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
