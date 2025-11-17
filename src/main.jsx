import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#209b53" },
    background: {
      default: "#0d1117",
      paper: "#111418",
    },
    text: {
      primary: "#ffffff",
      secondary: "#cccccc",
    },
  },

  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid #1e2a33",
          backgroundColor: "#111418",
          color: "#ffffff",
        },
        columnHeaders: {
          backgroundColor: "#0a4626",
          color: "#c6ffd1",
          fontWeight: 700,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>     {/* ← ESTE FALTABA */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </AuthProvider>
);
