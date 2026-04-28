import * as React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import Header from "../components/Header";

const CloudShape = styled("div")({
  background: "rgba(255, 255, 255, 0.93)",
  borderRadius: "40px",
  padding: "32px 28px 24px",
  position: "relative",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-6px) scale(1.02)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
  },
});

const features = [
  {
    title: "Color Parser",
    description:
      "Parse unstructured color information and generate Swatch Exchange (.ase) files. Paste color data and extract CMYK, RGB, and Hex values automatically for use in Adobe applications.",
    route: "/color-parser",
    color: "#9c27b0",
    isNew: true,
    buttonLabel: "Open Color Parser Tool",
    features: [
      "Parse unstructured color data and text",
      "Extract CMYK, RGB, and Hex values",
      "Preview colors with live swatches",
      "Download .ase files for Adobe apps",
    ],
  },
  {
    title: "Repetition",
    description:
      "Generate multiple variations of design elements with automatic position and naming. Perfect for creating layouts with repeated items, product chains, team members, or gallery items.",
    route: "/repetition",
    color: "#1976d2",
    buttonLabel: "Open Repetition Tool",
    features: [
      "Automatic positioning (row/column layouts)",
      "Smart naming with prefix/suffix options",
      "Dropdown visibility controls",
      "Master element relationships",
    ],
  },
  {
    title: "Scaling",
    description:
      "Scale your 'Scaling' text: Paste any Adobe Fonts family or collection URL. Choose all available text styles. Live font preview with example text. Download individual fonts or all as TTF.",
    route: "/scaling",
    color: "#388e3c",
    buttonLabel: "Open Scaling Tool",
    features: [
      "Paste any Adobe Fonts family or collection URL",
      "Choose all available text styles",
      "Live font preview with example text",
      "Download individual fonts or all as TTF",
    ],
  },
  {
    title: "Prefix Replacement",
    description:
      "Find and replace field name prefixes in your JSON templates. Convert field names across different pages with automatic alphabetical numbering, numbering, or custom replacement strings.",
    route: "/prefix",
    color: "#e91e63",
    buttonLabel: "Open Prefix Replacement Tool",
    features: [
      "Smart prefix field detection and replacement",
      "Alphabetical/custom replacement strings",
      "Automatic numbering and renaming",
      "Clipboard integration",
    ],
  },
  {
    title: "Statistics",
    description:
      "Parse statistics data from different sources and format for easy multi-field import, creation dates, file counts, and file size data, with automatic sorting.",
    route: "/statistics",
    color: "#0288d1",
    buttonLabel: "Open Statistics Tool",
    features: [
      "Parse statistics data from text/csv format",
      "Extract metadata automatically",
      "Sort by file count (descending)",
      "Export to CSV for Excel/Numbers import",
    ],
  },
  {
    title: "Import",
    description:
      "Import IDML (InDesign Markup Language) files and automatically transform them into your structured JSON format layout for multi-platform web application effortlessly.",
    route: "/import",
    color: "#f57c00",
    buttonLabel: "Open Import Tool",
    features: [
      "IDML file parsing and extraction",
      "Automatic field type detection",
      "Color and font extraction",
      "Complete JSON structure generation",
    ],
  },
  {
    title: "Adobe Fonts",
    description:
      "Download fonts from Adobe Fonts (formerly TypeKit). Paste any font family or collection URL, browse available styles with live preview, and download fonts as TTF files.",
    route: "/adobe-fonts",
    color: "#ff3366",
    isNew: true,
    buttonLabel: "Open Adobe Fonts Tool",
    features: [
      "Paste any Adobe Fonts family or collection URL",
      "Browse all available font styles",
      "Live font preview with sample text",
      "Download individual fonts or all as TTF",
    ],
  },
  {
    title: "SVG to TTF",
    description:
      "Import a simple SVG and generate a TTF font where the artwork is mapped to the uppercase letter A, with live preview before download.",
    route: "/svg-to-font",
    color: "#5d4037",
    isNew: true,
    buttonLabel: "Open SVG to TTF Tool",
    features: [
      "Upload one SVG file",
      "Map artwork to letter A",
      "Preview the generated glyph",
      "Download a ready-to-use TTF",
    ],
  },
];

const footerNavItems = [
  { label: "Home", path: "/" },
  { label: "Repetition", path: "/repetition" },
  { label: "Scaling", path: "/scaling" },
  { label: "Import", path: "/import" },
  { label: "Prefix", path: "/prefix" },
  { label: "Statistics", path: "/statistics" },
  { label: "Colors", path: "/color-parser" },
  { label: "Fonts", path: "/adobe-fonts" },
  { label: "SVG Font", path: "/svg-to-font" },
];

function CloudCard({ feature, onClick }) {
  return (
    <CloudShape onClick={onClick}>
      {feature.isNew && (
        <Chip
          label="New"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 20,
            zIndex: 2,
            fontWeight: "bold",
            fontSize: "0.7rem",
            backgroundColor: "#ff6b6b",
            color: "#fff",
            height: 24,
          }}
        />
      )}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          color: feature.color,
          fontWeight: 800,
          mb: 1.5,
          fontFamily: "'Fredoka One', 'Poppins', sans-serif",
          textTransform: "uppercase",
          fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.35rem" },
          letterSpacing: "0.5px",
        }}
      >
        {feature.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          lineHeight: 1.6,
          color: "#555",
          fontSize: { xs: "0.8rem", sm: "0.85rem" },
        }}
      >
        {feature.description}
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 2 }}>
        {feature.features.map((item, index) => (
          <Typography
            key={index}
            component="li"
            variant="body2"
            sx={{
              mb: 0.5,
              color: "#666",
              fontSize: { xs: "0.75rem", sm: "0.8rem" },
              lineHeight: 1.5,
            }}
          >
            {item}
          </Typography>
        ))}
      </Box>
      <Button
        variant="contained"
        fullWidth
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        sx={{
          backgroundColor: feature.color,
          borderRadius: "25px",
          textTransform: "uppercase",
          fontWeight: 700,
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          py: 1,
          letterSpacing: "0.5px",
          boxShadow: `0 4px 14px ${feature.color}44`,
          "&:hover": {
            backgroundColor: feature.color,
            filter: "brightness(0.9)",
            boxShadow: `0 6px 20px ${feature.color}66`,
          },
        }}
      >
        {feature.buttonLabel}
      </Button>
    </CloudShape>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #5BA3D9 0%, #7EC8E3 15%, #A8DCED 30%, #C5E8F7 50%, #E0F4FF 65%, #d4edc9 82%, #a8d88a 90%, #7CB87C 95%, #5a9a5a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Header transparent />

      {/* Hero Section */}
      <Box sx={{ textAlign: "center", pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 4 }, px: 2 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 900,
            color: "#fff",
            textShadow: "2px 3px 6px rgba(0,0,0,0.15)",
            fontFamily: "'Fredoka One', 'Poppins', sans-serif",
            fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.2rem", lg: "3.8rem" },
            letterSpacing: "2px",
            mb: 1,
            "& span": {
              display: "inline-block",
            },
          }}
        >
          {"✦ "}Design Generator Tools{" ✦"}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: 400,
            textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
            fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.25rem" },
          }}
        >
          Welcome, choose a tool to start.
        </Typography>
      </Box>

      {/* Cloud Grid */}
      <Box
        sx={{
          maxWidth: "1300px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 4, md: 6 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: { xs: 4, sm: 4, md: 5, lg: 5 },
          rowGap: { xs: 4, sm: 5, md: 6, lg: 6 },
          mt: { xs: 2, md: 3 },
        }}
      >
        {/* Row 1 */}
        <Box sx={{ mt: { lg: 3 } }}>
          <CloudCard
            feature={features[0]}
            onClick={() => router.push(features[0].route)}
          />
        </Box>
        <Box sx={{ mt: { lg: 0 } }}>
          <CloudCard
            feature={features[1]}
            onClick={() => router.push(features[1].route)}
          />
        </Box>
        <Box sx={{ mt: { lg: 5 } }}>
          <CloudCard
            feature={features[3]}
            onClick={() => router.push(features[3].route)}
          />
        </Box>

        {/* Row 2 */}
        <Box sx={{ mt: { lg: -3 } }}>
          <CloudCard
            feature={features[2]}
            onClick={() => router.push(features[2].route)}
          />
        </Box>
        <Box sx={{ mt: { lg: 2 } }}>
          <CloudCard
            feature={features[4]}
            onClick={() => router.push(features[4].route)}
          />
        </Box>
        <Box sx={{ mt: { lg: -2 } }}>
          <CloudCard
            feature={features[5]}
            onClick={() => router.push(features[5].route)}
          />
        </Box>

        {/* Row 3: Font tools */}
        <Box
          sx={{
            gridColumn: { md: "1 / 2", lg: "1 / 2" },
            maxWidth: { md: "500px", lg: "none" },
            mx: { md: "auto", lg: 0 },
            mt: { lg: 0 },
          }}
        >
          <CloudCard
            feature={features[6]}
            onClick={() => router.push(features[6].route)}
          />
        </Box>
        <Box
          sx={{
            gridColumn: { md: "2 / 3", lg: "2 / 3" },
            maxWidth: { md: "500px", lg: "none" },
            mx: { md: "auto", lg: 0 },
            mt: { lg: 3 },
          }}
        >
          <CloudCard
            feature={features[7]}
            onClick={() => router.push(features[7].route)}
          />
        </Box>
      </Box>

      {/* How to Use Section */}
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 4, md: 5 },
          px: 3,
          mx: "auto",
          maxWidth: "700px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#4a3728",
            fontFamily: "'Fredoka One', 'Poppins', sans-serif",
            mb: 2,
            fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
            textTransform: "uppercase",
          }}
        >
          How to Use
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#5a4a3a",
            lineHeight: 1.8,
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}
        >
          Each tool follows the same simple workflow:{" "}
          <strong>Paste your JSON → Configure settings → Copy the result</strong>.
          Choose the tool that matches your needs and get started in seconds.
        </Typography>
      </Box>

      {/* Footer Navigation */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 2.5,
          px: 2,
          backgroundColor: "rgba(0,0,0,0.08)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 2, md: 3 },
            mb: 1.5,
          }}
        >
          {footerNavItems.map((item) => (
            <Typography
              key={item.path}
              component="a"
              onClick={(e) => {
                e.preventDefault();
                router.push(item.path);
              }}
              href={item.path}
              sx={{
                color: "#3a5a3a",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                cursor: "pointer",
                transition: "color 0.2s",
                "&:hover": {
                  color: "#1976d2",
                  textDecoration: "underline",
                },
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "#5a7a5a", fontSize: "0.7rem" }}
        >
          Design Generator © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}
