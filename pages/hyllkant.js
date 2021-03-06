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
  const [layout, setLayout] = React.useState("column");
  const [masterPosition, setMasterPosition] = React.useState(null);
  const [xPos, setXPos] = React.useState(null);
  const [yPos, setYPos] = React.useState(null);
  const [distance, setDistance] = React.useState(null);
  const [maxItems, setMaxItems] = React.useState(null);

  const parsedTextField = JSON.parse(textField);

  // console.log("test");
  // console.log(parsedTextField.find((x) => x.name === masterPosition));

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

  const dynamicTextfield = (i) => {
    if (textField !== null) {
      const regex = new RegExp(dynamicPrefix, "g");
      const replaced = textField.replace(regex, `${prefix[i]}_`);
      const parsed = JSON.parse(replaced);
    } else {
      const parsed = "";
    }

    return {
      parsed,
    };
  };

  const columnPositions = (i) => {
    const columnXPositions = (i) => {
      if (i <= maxItems) {
        return xPos;
      }
      if (i <= maxItems * 2) {
        return xPos + distance;
      }
      if (i <= maxItems * 3) {
        return xPos + distance * 2;
      }
      if (i <= maxItems * 4) {
        return xPos + distance * 3;
      }
      if (i <= maxItems * 5) {
        return xPos + distance * 4;
      }
    };

    const masterObj = parsedTextField.find((x) => x.name === masterPosition);

    const columnYPositions = (i) => {
      if (
        i === 0 ||
        i === maxItems ||
        i === maxItems * 2 ||
        i === maxItems * 3 ||
        i === maxItems * 4 ||
        i === maxItems * 5
      ) {
        return yPos;
      } else return prefix[i - 1] + `${masterObj.y}`;
      // else return prefix[i - 1] + "_Pris.bottom + 15.8";
    };
  };

  const produktNamn = (i) => {
    const xPos = (i) => {
      if (i <= 5) {
        return 43.6;
      }
      if (i <= 11) {
        return 200;
      }
      if (i <= 17) {
        return 356;
      }
      if (i <= 23) {
        return 513;
      }
      if (i <= 29) {
        return 669;
      }
    };

    const yPos = (i) => {
      if (i === 0 || i === 6 || i === 12 || i === 18 || i === 24 || i === 30) {
        return 62;
      } else return prefix[i - 1] + "_Pris.bottom + 15.8";
    };

    return {
      name: `${prefix[i]}_ProduktNamn`,
      title: `${i + 1}. Produktnamn`,
      type: "textline",
      editui: "text",
      contents: `Produktnamn`,
      x: `${xPos(i)}`,
      y: `${yPos(i)}`,
      w: 100,
      maxw: `${prefix[i]}_ProduktNamn.width`,
      h: "auto",
      hideable: false,
      autoShrink: true,
      shrinkLimit: 0.7,
      align: 1,
      fontNr: 3,
      fontSize: 11,
      color: 0,
      editable: true,
      spacing: 0,
      kern: true,
    };
  };

  const produktBeskrivning = (i) => {
    return {
      name: `${prefix[i]}_ProduktBeskrivning`,
      title: `${i + 1}. Produktbeskrivning`,
      type: "textblock",
      contents: "Lorem ipsum dolor sit",
      textareaheight: 50,
      x: `${prefix[i]}_ProduktNamn.left`,
      y: `${prefix[i]}_ProduktNamn.bottom + 3`,
      w: 130.678,
      h: "auto",
      maxw: `${prefix[i]}_ProduktBeskrivning.width`,
      maxRows: 2,
      align: 1,
      fontNr: 2,
      fontSize: 8,
      lineHeight: 9,
      color: 0,
      editable: true,
      editui: "text",
      kern: true,
      spacing: 0,
      hideable: false,
    };
  };
  const ikon = (i) => {
    return {
      name: `${prefix[i]}_Ikon`,
      title: `${i + 1}. Ikon`,
      type: "fleximage",
      valign: "center",
      halign: "center",
      size: "contain",
      editable: true,
      x: `${prefix[i]}_ProduktNamn.left`,
      y: `${prefix[i]}_ProduktNamn.top + 48`,
      w: 16.615,
      h: 11.493,
      editui: "browse",
      browse: true,
      allowUpload: true,
      srcpdf:
        "https://assets.mediaflowpro.com/a/b60145432e0284f17d7ecf9a562a9c7c/ikoner_streck.pdf",
      hideable: true,
      hide: false,
      dpi: 300,
      displayDPI: 300,
      options: [
        {
          selected: true,
          name: "Streck",
          fit: true,
          displayDPI: 300,
          dpi: 300,
          thumbnail:
            "https://assets.mediaflowpro.com/a/bdd50777e75958c5a0973ed4a5ee4b1c/thumb_lines.png",
          srcpdf:
            "https://assets.mediaflowpro.com/a/b60145432e0284f17d7ecf9a562a9c7c/ikoner_streck.pdf",
        },
        {
          name: "Rutor",
          thumbnail:
            "https://assets.mediaflowpro.com/a/eab7687982d085831f799acbefd7f228/thumb_grid.png",
          srcpdf:
            "https://assets.mediaflowpro.com/a/45acfa1737367f362f9c0a5bac22ab90/ikoner_rutor.pdf",
          dpi: 300,
          displayDPI: 300,
          background: "white",
        },
        {
          selected: true,
          name: "Prickar",
          fit: true,
          displayDPI: 300,
          dpi: 300,
          thumbnail:
            "https://assets.mediaflowpro.com/a/a66b6d0584d16cd9b292ac6790fe926e/thumb_prickar.jpg",
          srcpdf:
            "https://assets.mediaflowpro.com/a/7729a71cca29c57dcbebd7f76d059ae0/ikoner_dots.pdf",
        },
        {
          name: "Rektangel",
          thumbnail:
            "https://assets.mediaflowpro.com/a/613561ba0f8142af4d8856e55963134d/thumb_square.jpg",
          srcpdf:
            "https://assets.mediaflowpro.com/a/ebad7afce3bbaf436faee7903843c1fd/ikoner_square.pdf",
          dpi: 300,
          displayDPI: 300,
          background: "white",
        },
      ],
    };
  };

  const eanKod = (i) => {
    return {
      name: `${prefix[i]}_EanKod`,
      title: `${i + 1}. EAN-kod`,
      type: "textline",
      editui: "text",
      contents: "0000000000000",
      x: `${prefix[i]}_Ikon.visible ? ${prefix[i]}_ProduktNamn.left + 130.607 - ${prefix[i]}_EanKod.width : ${prefix[i]}_ProduktNamn.left`,
      y: `${prefix[i]}_Ikon.visible ? ${prefix[i]}_ProduktNamn.top + 37: ${prefix[i]}_ProduktNamn.top + 55.3`,
      w: "auto",
      maxw: "80",
      h: "auto",
      hideable: false,
      autoShrink: true,
      shrinkLimit: 0.7,
      align: 2,
      fontNr: 2,
      fontSize: 6,
      color: 0,
      editable: true,
      spacing: 0,
      kern: true,
    };
  };

  const pris = (i) => {
    return {
      name: `${prefix[i]}_Pris`,
      title: `${i + 1}. Pris`,
      type: "textline",
      editui: "text",
      contents: "00",
      x: `${prefix[i]}_ProduktNamn.left + 130.607 - ${prefix[i]}_Pris.width - ${prefix[i]}_PrisTeckenKr.width`,
      y: `${prefix[i]}_ProduktNamn.top + 44`,
      w: "auto",
      maxw: 80,
      h: "auto",
      hideable: false,
      autoShrink: false,
      shrinkLimit: 0.7,
      align: 2,
      fontNr: 3,
      fontSize: 18,
      color: 0,
      editable: true,
      spacing: 0,
      kern: true,
    };
  };
  const prisTeckenKr = (i) => {
    return {
      name: `${prefix[i]}_PrisTeckenKr`,
      title: "EAN kod",
      type: "textline",
      editui: "text",
      contents: ":-",
      x: `${prefix[i]}_ProduktNamn.left + 130.607 - ${prefix[i]}_PrisTeckenKr.width`,
      y: `${prefix[i]}_ProduktNamn.top + 44`,
      w: "auto",
      maxw: `${prefix[i]}_PrisTeckenKr.width`,
      h: "auto",
      hideable: false,
      autoShrink: false,
      shrinkLimit: 0.7,
      align: 2,
      fontNr: 3,
      fontSize: 18,
      color: 0,
      editable: false,
      spacing: 0,
      kern: true,
    };
  };

  const generateCluster = (times) => {
    let cluster = [];

    for (let i = 0; i < times; i++) {
      // const field0 = `${JSON.stringify(dynamicField1(i))},`;
      const df = `${JSON.stringify(dynamicTextfield(i))},`;
      const field1 = `${JSON.stringify(produktNamn(i))},`;
      const field2 = `${JSON.stringify(produktBeskrivning(i))},`;
      const field3 = `${JSON.stringify(ikon(i))},`;
      const field4 = `${JSON.stringify(eanKod(i))},`;
      const field5 = `${JSON.stringify(pris(i))},`;
      const field6 = `${JSON.stringify(prisTeckenKr(i))},`;

      // cluster.push(field0, field1, field2, field3, field4, field5, field6);
      cluster.push(field1, field2, field3, field4, field5, field6);
    }

    const merged = cluster.join("");

    return merged;
  };

  const generateClusters = () => {
    let cluster = [];

    for (let i = 0; i <= fieldCount; i++) {
      const df = `${JSON.stringify(dynamicTextfield(i))},`;
      cluster.push(df);
    }

    const merged = cluster.join("");

    return merged;
  };

  function IsJsonString(str) {
    try {
      JSON.parse(str);
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
  };

  const handleLayout = (event) => {
    setLayout(event.target.value);
  };

  const handleXPos = (event) => {
    setXPos(event.target.value);
  };

  const handleYPos = (event) => {
    setYPos(event.target.value);
  };

  const handleDistance = (event) => {
    setDistance(event.target.value);
  };

  const handleMaxItems = (event) => {
    setMaxItems(event.target.value);
  };

  return (
    <Box sx={{ p: 10, my: 4, width: "300px", color: "black" }}>
      <Typography variant="h3" component="p" gutterBottom>
        Designgenerator Generator
      </Typography>
      <Button
        sx={{ mb: 20 }}
        onClick={() => {
          navigator.clipboard.writeText(generateCluster(30));
        }}
        variant="contained"
      >
        Copy JSON
      </Button>
    </Box>
  );
}
