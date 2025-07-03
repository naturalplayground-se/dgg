import * as React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Repetition", path: "/repetition" },
    { label: "Scaling", path: "/scaling" },
    { label: "Import", path: "/import" },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          Design Generator
        </Typography>
        <Box sx={{ display: "flex" }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => router.push(item.path)}
              sx={{
                backgroundColor:
                  router.pathname === item.path
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                mx: 1,
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
