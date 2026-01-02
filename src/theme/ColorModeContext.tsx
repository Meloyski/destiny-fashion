"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";

const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: "dark" as "light" | "dark",
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const storedMode =
      typeof window !== "undefined" ? localStorage.getItem("colorMode") : null;
    if (storedMode === "light" || storedMode === "dark") {
      setMode(storedMode);
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === "light" ? "dark" : "light";
          if (typeof window !== "undefined") {
            localStorage.setItem("colorMode", nextMode);
          }
          return nextMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
