import * as React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/router";

export default function Header({ transparent = false }) {
  const router = useRouter();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Repetition", path: "/repetition" },
    { label: "Scaling", path: "/scaling" },
    { label: "Import", path: "/import" },
    { label: "Prefix", path: "/prefix" },
    { label: "Statistics", path: "/statistics" },
    { label: "Colors", path: "/color-parser" },
    { label: "Fonts", path: "/adobe-fonts" },
  ];

  return (
    <AppBar
      position="static"
      elevation={transparent ? 0 : 4}
      sx={{
        backgroundColor: transparent ? "transparent" : "#1976d2",
        boxShadow: transparent ? "none" : undefined,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            color: "#fff",
            textShadow: transparent ? "1px 1px 3px rgba(0,0,0,0.2)" : "none",
          }}
          onClick={() => router.push("/")}
        >
          Design Generator
        </Typography>
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => router.push(item.path)}
              sx={{
                backgroundColor:
                  router.pathname === item.path
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                mx: 0.5,
                fontSize: "0.8rem",
                textShadow: transparent
                  ? "1px 1px 2px rgba(0,0,0,0.15)"
                  : "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
