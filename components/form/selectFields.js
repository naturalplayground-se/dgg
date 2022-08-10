import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder",
];

function getStyles(name, fieldName, theme) {
  //   return {
  //     fontWeight:
  //       fieldName.name.indexOf(name) === -1
  //         ? theme.typography.fontWeightRegular
  //         : theme.typography.fontWeightMedium,
  //   };
  return {
    fontWeight: theme.typography.fontWeightRegular,
  };
}

export default function SelectFields({
  id,
  handleSelectFields,
  designGeneratorJson,
}) {
  const theme = useTheme();
  const [fieldName, setFieldName] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    const selectedFieldArray = [];
    const selectedFieldNamesArray = [];

    designGeneratorJson.map((field) => {
      if (value.includes(field.name)) {
        selectedFieldArray.push(field);
        selectedFieldNamesArray.push(field.name);
      }
    });
    handleSelectFields(selectedFieldArray, id);
    setFieldName(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <div>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel>Select Fields to group</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={fieldName}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selected !== undefined &&
                selected.map((value) => <Chip key={value} label={value} />)}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {designGeneratorJson.map((field, i) => (
            <MenuItem
              key={i}
              value={field.name}
              //   style={getStyles(field.name, fieldName, theme)}
            >
              {field.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
