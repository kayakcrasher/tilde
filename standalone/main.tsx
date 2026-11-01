// Standalone client-only entry for the static web build and the Android APK.
// The game keeps all state on-device (zustand persist), so no server is needed.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Tilde } from "@/components/tilde/app";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Tilde />
  </StrictMode>,
);
