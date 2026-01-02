import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === "light" ? "#f7f8f9" : "#000714",
        paper: mode === "light" ? "#ffffff" : "#010E25",
      },
      primary: {
        main: "#146AFF",
      },
      secondary: {
        main: "#146AFF",
      },
      grey: {
        50: "#f7f8f9",
        100: "#d8dbdf",
        200: "#babec4",
        300: "#9ba0aa",
        400: "#7c838f",
        500: "#5d6675",
        600: "#3f495a",
        700: "#202b40",
        800: "#010E25",
        900: "#000714",
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: "DM Sans, sans-serif",
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
    },
  });
