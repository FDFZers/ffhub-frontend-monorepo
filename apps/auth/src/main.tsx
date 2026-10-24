import { ToastProvider } from "@heroui/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./style.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider />
      <App />
    </BrowserRouter>
  </StrictMode>,
);
