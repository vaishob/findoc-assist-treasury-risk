import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3155d9", dark: "#253fb0", light: "#e9edff" },
    secondary: { main: "#13a88a" },
    background: { default: "#f3f5f9", paper: "#ffffff" },
    text: { primary: "#17233d", secondary: "#71809a" },
    divider: "#e9edf3",
    success: { main: "#158b70" },
    warning: { main: "#d99024" },
    error: { main: "#d64b55" },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, boxShadow: "0 5px 24px rgba(26, 42, 78, 0.045)" } } },
  },
});
