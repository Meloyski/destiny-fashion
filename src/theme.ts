import { alpha, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000714",
      paper: "#010E25",
    },
    primary: {
      main: "#146AFF", // optional accent color
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
  components: {},
});

export default theme;
