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
  const [designGeneratorJson, setDesignGeneratorJson] = React.useState([]);
  const [textAreaError, setTextAreaError] = React.useState(false);
  const [jsonSuccess, setJsonSuccess] = React.useState(false);
  const [grabJson, setGrabJson] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [functionalityArray, setFunctionalityArray] = React.useState([]);
  const [hasSelectedFields, setHasSelectedFields] = React.useState(false);
  const [filteredTextboxFields, setFilteredTextboxFields] = React.useState([]);

  /**
   * Create refs for functionality rows
   */
  const elementsRef = React.useRef(
    // prettier-ignore
    [{text: "one",},{text: "two",},{text: "three",},{text: "four",},]
    .map(() => React.createRef())
  );

  /**
   * Type of functionality
   */
  const typeItems = [
    { value: "repetition", label: "Repetition" },
    { value: "generateFontSizes", label: "Generate font sizes" },
  ];

  /**
   * Checks if the functionalty has fields selected
   */

  React.useEffect(() => {
    functionalityArray.map((val) => {
      // const tempFilteredTextboxFields = filteredTextboxFields;
      // val.generateFontSizes.type === "textline"
      //   ? setFilteredTextboxFields(...tempFilteredTextboxFields, val)
      //   : "";
      val.layoutObject.selectedFields.length > 0
        ? setHasSelectedFields(true)
        : setHasSelectedFields(false);
    });
    hasSelectedFields;
  }, [functionalityArray]);

  console.log("filteredTextboxFields");
  console.log(filteredTextboxFields);

  /**
   *  Prefix array
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
   *  Functions for "Repetition-functionality"
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

  const yPositionsColumn = (i, layoutObject, y, masterNames) => {
    const maxItems = parseInt(layoutObject.maxItems);
    const name = masterNames[i - 1];

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

  /**
   *  When hitting Grab Jason
   */

  const generateJSON = () => {
    let groupsObject = [];

    const layoutIndex = functionalityArray.findIndex((object) => {
      return object.type === "repetition";
    });

    const masterNames = [];

    if (layoutIndex !== -1) {
      const layoutObject = functionalityArray[layoutIndex].layoutObject;
      const regex = new RegExp(`${layoutObject.prefix}`, "g");
      const regexNumber = new RegExp(`${layoutObject.numbering}`, "g");

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

          //Transform field to string
          const stringField = JSON.stringify(newField);

          //Replace prefix
          const prefixReplacementField =
            layoutObject.prefix !== ""
              ? stringField.replace(regex, `${alphabet[index]}_`)
              : stringField;

          //Replace numbering
          const numberReplacementField =
            layoutObject.numbering !== ""
              ? prefixReplacementField.replace(regexNumber, `${index + 1}`)
              : prefixReplacementField;

          //Transform field to Json again
          const jsonField = JSON.parse(numberReplacementField);

          //If the field are a master-field, adjust postioning
          if (
            layoutObject.direction === "row" &&
            obj.name === layoutObject.master
          ) {
            (jsonField.y = yPositionsRow(
              index,
              layoutObject,
              obj.y,
              masterNames
            )),
              (jsonField.x = xPositionsRow(
                index,
                layoutObject,
                obj.x,
                masterNames
              ));
          }
          if (
            layoutObject.direction === "column" &&
            obj.name === layoutObject.master
          ) {
            (jsonField.y = yPositionsColumn(
              index,
              layoutObject,
              obj.y,
              masterNames
            )),
              (jsonField.x = xPositionsColumn(
                index,
                layoutObject,
                obj.x,
                masterNames
              ));
          }
          newField = jsonField;
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

    // Dropdown - number of groups visible
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

    setGrabJson(newDesignGeneratorJson);
    return JSON.stringify(newDesignGeneratorJson);
  };

  /**
   *  Checks if valid Json
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
    setJsonSuccess(false);

    if (event.target.value.length > 2) {
      if (IsJsonString(event.target.value)) {
        setJsonSuccess(true);
        setTextAreaError(false);
      } else {
        setTextAreaError(true);
        setJsonSuccess(false);
      }
    } else {
      setTextAreaError(false);
    }
  }

  /**
   *  Handles selected fields
   */

  const handleSelectFields = (fields, id) => {
    handleFunctionality(fields, id, "selectedFields");
  };

  /**
   *  Adds functionality row to array - first in line
   */

  const handleAddRows = (event, length) => {
    const rowObject = {
      id: uuidv4(),
      type: "",
      replaceStringObject: { type: "", input1: "", input2: "" },
      generateFontSizes: {
        selectedFields: [],
        numberOfFontSizes: "",
        defaultFontSize: "",
        defaultLineHeight: "",
        fontNumber: "",
      },
      layoutObject: {
        selectedFields: [],
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
        groupsVisibility: false,
        prefix: "",
        numbering: "",
      },
      showHideObject: { input1: "", input2: "", input3: "" },
    };

    const oldArray = functionalityArray;
    setFunctionalityArray([rowObject, ...oldArray]);
    setRows([...rows, length]);
  };

  /**
   *  Removes functionality row from array
   */

  const handleRemoveRow = (event, i) => {
    const rowId =
      elementsRef.current[0].current !== null
        ? elementsRef.current[i].current.id
        : "0";

    if (functionalityArray.length > 0) {
      functionalityArray.map((val, index) => {
        if (val.id === rowId) {
          const array = [...functionalityArray];
          array.splice(index, 1);
          setFunctionalityArray(array);
        }
      });
    }
  };

  /**
   *  Updates type of functionality in array
   */
  const handleUpdateRows = (event, id, cat) => {
    const index = functionalityArray.findIndex((object) => {
      return object.id === id;
    });

    let newArray = [...functionalityArray];

    if (cat === "updateRow") {
      if (index !== -1) {
        newArray[index].type = event.target.value;
        setFunctionalityArray(newArray);
      } else {
        newArray[0].type = event.target.value;
        setFunctionalityArray(newArray);
      }
    }
  };

  /**
   *  Updates values in the functionality row
   */

  const handleFunctionality = (event, id, type) => {
    let newArray = [...functionalityArray];

    const index = functionalityArray.findIndex((object) => {
      return object.id === id;
    });

    if (type === "numberOfFontSizes") {
      newArray[index].generateFontSizes.numberOfFontSizes = event.target.value;
      setFunctionalityArray(newArray);
    }

    if (type === "groupsVisibility") {
      newArray[index].layoutObject.groupsVisibility
        ? (newArray[index].layoutObject.groupsVisibility = false)
        : (newArray[index].layoutObject.groupsVisibility = true);
      setFunctionalityArray(newArray);
    }

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

  // const filteredTextBlockFields = designGeneratorJson[0].fields.filter(
  //   designGeneratorJson[0].fields.map((val) => val.type === "textblock")
  // );

  // console.log("designGeneratorJson[0].fields");
  // console.log(designGeneratorJson[0].fields);

  // console.log("filteredTextBlockFields");
  // console.log(filteredTextBlockFields);

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
      <Box
        sx={{
          mt: 10,
          mb: 10,
          width: "1000px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h4"
          component="p"
          gutterBottom
          sx={
            jsonSuccess
              ? { mb: 1, color: "text.primary" }
              : { mb: 1, color: "text.disabled" }
          }
        >
          Add functionality
        </Typography>
        <Box sx={{ "& > :not(style)": { m: 1 } }}>
          <Fab
            disabled={!jsonSuccess}
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
                  value={val.type}
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

              {/* Repetition */}
              {val.type === "repetition" && (
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
                      selectedFields={val.layoutObject.selectedFields}
                    />
                  </Box>
                  <FormControl sx={{ width: "145px" }}>
                    <InputLabel size="normal" id="master">
                      Master
                    </InputLabel>
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
                      value={val.layoutObject.groups}
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
                      value={val.layoutObject.maxItems}
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
                      value={val.layoutObject.spaceX}
                      onChange={(event) =>
                        handleFunctionality(event, val.id, "spaceX")
                      }
                    />
                  </FormControl>
                  <FormControl sx={{ width: "145px" }}>
                    <TextField
                      id="spaceY"
                      label="Space Y"
                      value={val.layoutObject.spaceY}
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
                        label="Space X from right side of Master element"
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
                        label="Space Y from bottom position of Master element"
                      />
                    </FormGroup>
                  </Box>
                  <Box sx={{ width: "650px" }}>
                    <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
                      <FormControl sx={{ width: "145px", mr: 3 }}>
                        <TextField
                          id="prefix"
                          value={val.layoutObject.prefix}
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
                          value={val.layoutObject.numbering}
                          onChange={(event) =>
                            handleFunctionality(event, val.id, "numbering")
                          }
                        />
                      </FormControl>
                    </FormGroup>
                  </Box>
                  <Box sx={{ width: "650px" }}>
                    <FormControlLabel
                      disabled={val.layoutObject.groups < 2 ? true : false}
                      control={
                        <Checkbox
                          checked={val.layoutObject.groupsVisibility}
                          onChange={(event) =>
                            handleFunctionality(
                              event,
                              val.id,
                              "groupsVisibility"
                            )
                          }
                        />
                      }
                      label="Dropdown - number of groups visible"
                    />
                  </Box>
                </Box>
              )}
              {/* Generate Font-sizes */}

              {val.type === "generateFontSizes" && (
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
                      // designGeneratorJson={filteredTextBlockFields}
                      designGeneratorJson={designGeneratorJson[0].fields}
                      selectedFields={val.layoutObject.selectedFields}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      pb: "2rem",
                      pr: "10px",
                    }}
                  >
                    <FormControl sx={{ width: "200px", pr: "20px" }}>
                      <InputLabel size="normal" id="number">
                        Number of font sizes
                      </InputLabel>
                      <Select
                        id="numberOfFontSizes"
                        value={val.generateFontSizes.numberOfFontSizes}
                        label="Type"
                        onChange={(event) =>
                          handleFunctionality(
                            event,
                            val.id,
                            "numberOfFontSizes"
                          )
                        }
                      >
                        {["3", "5", "7", "9", "11"].map((a, i) => (
                          <MenuItem key={i} value={a} data-id={i}>
                            {a}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ width: "145px" }}>
                      <TextField
                        id="defaultFontSize"
                        label="Default Size"
                        variant="outlined"
                        value={val.generateFontSizes.defaultFontSize}
                        onChange={(event) =>
                          handleFunctionality(event, val.id, "defaultFontSize")
                        }
                      />
                    </FormControl>
                  </Box>
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
        <Button
          disabled={
            jsonSuccess && functionalityArray.length > 0 && hasSelectedFields
              ? false
              : true
          }
          sx={{ p: 1.85, mb: 20 }}
          onClick={() => {
            navigator.clipboard.writeText(generateJSON());
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
