import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted fonts shared by every edition (edition-only families ship in their own chunks).
import "./styles/fonts.css"; // Inter Variable + Fraunces Variable (latin, latin-ext)
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-ext-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-ext-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/jetbrains-mono/latin-ext-700.css";
import "./styles/base.css";
import { applyMotion } from "./lib/motion";
import App from "./App.tsx";
import { reloadOnceForChunkError } from "./components/ErrorBoundary";

applyMotion(); // idempotent; the inline script in index.html already ran, this keeps the state consistent

// Production builds announce a failed chunk preload here before React sees it; recover the same way.
window.addEventListener("vite:preloadError", (e) => {
  if (reloadOnceForChunkError((e as Event & { payload?: unknown }).payload)) e.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);