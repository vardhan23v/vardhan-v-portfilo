import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";
import { applyMotion } from "./lib/motion";
import App from "./App.tsx";

applyMotion(); // idempotent; the inline script in index.html already ran, this keeps the state consistent

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);