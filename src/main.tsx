import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { CssVarsProvider } from "@mui/joy/styles";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/clear-comm">
      <CssVarsProvider theme={theme}>
        <App />
      </CssVarsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
