"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { createTheme } from "@mui/material/styles";

const theme = createTheme();

type ThemeRegistryProps = {
  children: ReactNode;
};

const ThemeRegistry = ({ children }: ThemeRegistryProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeRegistry;
