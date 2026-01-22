import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Statistics() {
  const router = useRouter();
  const [inputText, setInputText] = React.useState("");
  const [parsedData, setParsedData] = React.useState([]);
  const [csvOutput, setCsvOutput] = React.useState("");
  const [parseError, setParseError] = React.useState(false);
  const [parseSuccess, setParseSuccess] = React.useState(false);

  const parseStatisticsData = (text) => {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const entries = [];
    // Split by double or triple newlines to get individual template entries
    const sections = text.split(/\n\n+/);

    for (const section of sections) {
      const lines = section.split("\n").map((line) => line.trim());
      if (lines.length === 0 || lines[0].length === 0) continue;

      // Extract template name (first line, remove "(Visa)" if present)
      let templateName = lines[0].replace(/\(Visa\)/g, "").trim();
      if (templateName.length === 0) continue;

      // Initialize entry
      const entry = {
        mallnamn: templateName,
        skapadForst: "",
        antalFiler: 0,
        senastAnvand: "",
      };

      // Parse through lines to find key information
      for (const line of lines) {
        // Extract "Mallen skapades först: YYYY-MM-DD HH:MM:SS"
        const skapadMatch = line.match(/Mallen skapades först:\s*(.+)/);
        if (skapadMatch) {
          entry.skapadForst = skapadMatch[1].trim();
        }

        // Extract "Antal filer genererade av mallen: X"
        const antalMatch = line.match(/Antal filer genererade av mallen:\s*(\d+)/);
        if (antalMatch) {
          entry.antalFiler = parseInt(antalMatch[1], 10);
        }

        // Extract "Senaste filen genererad av mallen: YYYY-MM-DD HH:MM:SS"
        const senastMatch = line.match(/Senaste filen genererad av mallen:\s*(.+)/);
        if (senastMatch) {
          entry.senastAnvand = senastMatch[1].trim();
        }
      }

      // Only add entry if we have at least a template name
      if (entry.mallnamn) {
        entries.push(entry);
      }
    }

    // Sort by "Antal filer" descending
    entries.sort((a, b) => b.antalFiler - a.antalFiler);

    return entries;
  };

  const generateTSV = (data) => {
    if (data.length === 0) {
      return "";
    }

    // Generate tab-separated values (TSV) without headers for easy Excel paste
    // Excel automatically recognizes tabs and splits into columns
    const rows = [];
    for (const entry of data) {
      const row = [
        entry.mallnamn || "",
        entry.skapadForst || "",
        entry.antalFiler || "",
        entry.senastAnvand || "",
      ];
      rows.push(row.join("\t"));
    }

    return rows.join("\n");
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputText(value);
    setParseError(false);
    setParseSuccess(false);
    setParsedData([]);
    setCsvOutput("");

    if (value.trim().length > 0) {
      try {
        const parsed = parseStatisticsData(value);
        if (parsed.length > 0) {
          setParsedData(parsed);
          const tsv = generateTSV(parsed);
          setCsvOutput(tsv);
          setParseSuccess(true);
        } else {
          setParseError(true);
        }
      } catch (error) {
        console.error("Parse error:", error);
        setParseError(true);
      }
    }
  };

  const handleCopyCSV = () => {
    if (csvOutput) {
      navigator.clipboard.writeText(csvOutput);
      // Could add a toast notification here if desired
    }
  };

  return (
    <Box>
      <Header />
      <Box sx={{ p: 10, my: 4, width: "1000px", color: "black", mx: "auto" }}>
        {/* Step 1: Paste Statistics Data */}
        <Typography variant="h4" component="p" gutterBottom sx={{ mb: 10 }}>
          1. Paste Statistics Data
        </Typography>

        <Box sx={{ position: "relative", width: "1000px" }}>
          <TextField
            onChange={handleInputChange}
            value={inputText}
            fullWidth
            label="Paste statistics data here"
            multiline
            rows={15}
            error={parseError}
            color={parseError ? "" : parseSuccess ? "success" : "primary"}
            helperText={
              parseError
                ? "Could not parse data. Please check the format."
                : parseSuccess
                ? `Successfully parsed ${parsedData.length} template(s)`
                : "Paste your statistics data from the Mediaflow system"
            }
            placeholder="A3 med bild (Eskilstuna Kommun)&#10;(Visa)&#10;...&#10;Mallen skapades först: 2023-01-09 14:08:44&#10;Antal filer genererade av mallen: 30&#10;Senaste filen genererad av mallen: 2023-03-13 10:27:07"
          />
        </Box>

        {/* Step 2: Preview and Copy Data */}
        {parseSuccess && (
          <>
            <Typography
              variant="h4"
              component="p"
              gutterBottom
              sx={{ mb: 5, mt: 10, color: "text.primary" }}
            >
              2. Copy Data for Excel
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
                sx={{ p: 1.85 }}
                onClick={handleCopyCSV}
                color="success"
                variant="contained"
                size="large"
              >
                Copy Data to Clipboard
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

            {/* Preview parsed data count */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Found {parsedData.length} template(s), sorted by file count
                (descending)
              </Typography>
            </Box>

            {/* Preview Data */}
            <Box sx={{ width: "1000px", mt: 5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  Preview Data (ready to paste into Excel):
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopyCSV}
                >
                  Copy Data
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={csvOutput}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  style: { fontSize: "12px", fontFamily: "monospace" },
                }}
                helperText="Tab-separated values - paste directly into Excel and it will automatically populate columns"
              />
            </Box>

            {/* Preview parsed data table */}
            <Box sx={{ width: "1000px", mt: 5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Parsed Data Preview:
              </Typography>
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 0.8fr 1.5fr",
                    backgroundColor: "#f5f5f5",
                    borderBottom: "1px solid #e0e0e0",
                    p: 1.5,
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  <Box>Mallnamn</Box>
                  <Box>Skapad först</Box>
                  <Box>Antal filer</Box>
                  <Box>Senast använd</Box>
                </Box>
                {parsedData.slice(0, 10).map((entry, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.5fr 0.8fr 1.5fr",
                      borderBottom:
                        index < Math.min(10, parsedData.length) - 1
                          ? "1px solid #e0e0e0"
                          : "none",
                      p: 1.5,
                      fontSize: "13px",
                      "&:hover": {
                        backgroundColor: "#fafafa",
                      },
                    }}
                  >
                    <Box>{entry.mallnamn}</Box>
                    <Box>{entry.skapadForst || "-"}</Box>
                    <Box sx={{ textAlign: "right" }}>{entry.antalFiler}</Box>
                    <Box>{entry.senastAnvand || "-"}</Box>
                  </Box>
                ))}
                {parsedData.length > 10 && (
                  <Box
                    sx={{
                      p: 1.5,
                      textAlign: "center",
                      color: "text.secondary",
                      fontSize: "13px",
                    }}
                  >
                    ... and {parsedData.length - 10} more template(s)
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
