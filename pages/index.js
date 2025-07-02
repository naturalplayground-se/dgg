import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
} from "@mui/material";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: "Repetition",
      description:
        "Generate multiple variations of design elements with automatic positioning and naming. Perfect for creating layouts with repeated elements like product cards, team members, or gallery items.",
      route: "/repetition",
      color: "#1976d2",
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
        "Scale your designs between different paper sizes or custom dimensions. All elements, fonts, and spacing are proportionally adjusted while preserving design integrity.",
      route: "/scaling",
      color: "#388e3c",
      features: [
        "A4 ↔ A3 paper size scaling",
        "Custom dimension scaling",
        "Smart value targeting (+ and - only)",
        "Preserves proportional calculations",
      ],
    },
  ];

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Design Generator Tools
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Professional tools for scaling and repeating design elements in
              your JSON templates
            </Typography>
          </Box>

          {/* Feature Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              mb: 8,
            }}
          >
            {features.map((feature) => (
              <Card
                key={feature.title}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ color: feature.color, fontWeight: "bold" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "text.secondary" }}
                  >
                    Key Features:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {feature.features.map((item, index) => (
                      <Typography
                        key={index}
                        component="li"
                        variant="body2"
                        sx={{ mb: 1, color: "text.secondary" }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => router.push(feature.route)}
                    sx={{
                      backgroundColor: feature.color,
                      "&:hover": {
                        backgroundColor: feature.color,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    Open {feature.title} Tool
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Instructions */}
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              How to Use
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 600, mx: "auto" }}>
              Each tool follows the same simple workflow:
              <strong>
                {" "}
                Paste your JSON → Configure settings → Copy the result
              </strong>
              . Choose the tool that matches your needs and get started in
              seconds.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
