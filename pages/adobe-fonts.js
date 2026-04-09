import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  CardActions,
  Alert,
  TextField,
  CircularProgress,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import Header from "../components/Header";

export default function AdobeFonts() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fontSet, setFontSet] = React.useState(null);
  const [downloadingIndex, setDownloadingIndex] = React.useState(-1);
  const [downloadingAll, setDownloadingAll] = React.useState(false);
  const [injectedFonts, setInjectedFonts] = React.useState(new Set());

  const typerip = React.useRef(null);

  React.useEffect(() => {
    import("../lib/typerip").then((mod) => {
      typerip.current = mod;
    });
  }, []);

  const injectFontFace = React.useCallback(
    (font, index) => {
      if (injectedFonts.has(index)) return;
      const fontFaceId = `adobe-font-preview-${index}`;
      if (document.getElementById(fontFaceId)) return;

      const style = document.createElement("style");
      style.id = fontFaceId;
      style.textContent = `
        @font-face {
          font-family: '${fontFaceId}';
          src: url('${font.url}') format('woff2');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
      setInjectedFonts((prev) => new Set([...prev, index]));
    },
    [injectedFonts]
  );

  React.useEffect(() => {
    if (!fontSet?.fonts) return;
    fontSet.fonts.forEach((font, i) => injectFontFace(font, i));
  }, [fontSet, injectFontFace]);

  React.useEffect(() => {
    return () => {
      document
        .querySelectorAll('[id^="adobe-font-preview-"]')
        .forEach((el) => el.remove());
    };
  }, []);

  const handleFetch = async () => {
    if (!url.trim()) return;
    if (!typerip.current) {
      setError("Module still loading, please try again in a moment.");
      return;
    }

    setLoading(true);
    setError("");
    setFontSet(null);
    setInjectedFonts(new Set());

    document
      .querySelectorAll('[id^="adobe-font-preview-"]')
      .forEach((el) => el.remove());

    try {
      const result = await typerip.current.fetchFonts(url.trim());
      setFontSet(result);
    } catch (err) {
      setError(err.message || "Failed to fetch fonts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleFetch();
    }
  };

  const handleDownload = async (font, index) => {
    if (!typerip.current) return;
    setDownloadingIndex(index);
    try {
      await typerip.current.downloadFont(font);
    } catch (err) {
      setError(`Failed to download ${font.name}: ${err.message}`);
    } finally {
      setDownloadingIndex(-1);
    }
  };

  const handleDownloadAll = async () => {
    if (!typerip.current || !fontSet?.fonts) return;
    setDownloadingAll(true);
    try {
      await typerip.current.downloadAllFonts(fontSet.fonts);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Adobe Fonts Downloader
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Paste an Adobe Fonts family or collection URL to browse and download
            fonts as TTF files.
          </Typography>

          {/* URL Input */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <TextField
                fullWidth
                label="Adobe Fonts URL"
                placeholder="https://fonts.adobe.com/fonts/source-sans-pro"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleFetch}
                        disabled={loading || !url.trim()}
                        edge="end"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleFetch}
                disabled={loading || !url.trim()}
                sx={{
                  minWidth: 140,
                  height: 56,
                  backgroundColor: "#ff3366",
                  "&:hover": {
                    backgroundColor: "#ff3366",
                    filter: "brightness(0.9)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Fetch Fonts"
                )}
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Supports font family URLs (fonts.adobe.com/fonts/...) and
              collection URLs (fonts.adobe.com/collections/...)
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress size={48} sx={{ color: "#ff3366" }} />
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Fetching font data from Adobe Fonts...
              </Typography>
            </Box>
          )}

          {fontSet && (
            <Box>
              {/* Font Set Header */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {fontSet.name}
                    </Typography>
                    {fontSet.foundry && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Foundry: {fontSet.foundry}
                      </Typography>
                    )}
                    {fontSet.designers?.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Designer
                        {fontSet.designers.length > 1 ? "s" : ""}:{" "}
                        {fontSet.designers.map((d) => d.name).join(", ")}
                      </Typography>
                    )}
                    <Chip
                      label={`${fontSet.fonts.length} style${fontSet.fonts.length !== 1 ? "s" : ""} available`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={
                      downloadingAll ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <DownloadIcon />
                      )
                    }
                    onClick={handleDownloadAll}
                    disabled={downloadingAll || downloadingIndex >= 0}
                    sx={{
                      backgroundColor: "#ff3366",
                      "&:hover": {
                        backgroundColor: "#ff3366",
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    {downloadingAll ? "Downloading..." : "Download All"}
                  </Button>
                </Box>
              </Paper>

              <Divider sx={{ mb: 3 }} />

              {/* Font Cards */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 3,
                }}
              >
                {fontSet.fonts.map((font, index) => (
                  <Card
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      transition:
                        "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {font.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {font.style} &middot; {font.familyName}
                      </Typography>

                      {/* Font Preview */}
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "#fafafa",
                          borderRadius: 1,
                          border: "1px solid #eee",
                          minHeight: 80,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: `'adobe-font-preview-${index}', sans-serif`,
                            fontSize: "1.5rem",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {typeof fontSet.sampleText === "string"
                            ? fontSet.sampleText
                            : "The quick brown fox jumps over the lazy dog"}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={
                          downloadingIndex === index ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <DownloadIcon />
                          )
                        }
                        onClick={() => handleDownload(font, index)}
                        disabled={
                          downloadingIndex >= 0 || downloadingAll
                        }
                        sx={{
                          borderColor: "#ff3366",
                          color: "#ff3366",
                          "&:hover": {
                            borderColor: "#ff3366",
                            backgroundColor: "rgba(255, 51, 102, 0.04)",
                          },
                        }}
                      >
                        {downloadingIndex === index
                          ? "Downloading..."
                          : `Download ${font.name}.ttf`}
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>

              {/* Disclaimer */}
              <Alert severity="info" sx={{ mt: 4 }}>
                <Typography variant="body2">
                  Downloaded fonts are for testing purposes only. If you want to
                  use these fonts in published work, you must purchase a license
                  through Adobe.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
