// Standalone client-only entry for the static web build and the Android APK.
// The game keeps all state on-device (zustand persist), so no server is needed.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Tilde } from "@/components/tilde/app";
import { usePlay } from "@/lib/tilde/store";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Tilde />
  </StrictMode>,
);

if (Capacitor.isNativePlatform()) {
  // Android back: return to Play from any other section, then close the app.
  void App.addListener("backButton", () => {
    const { view, setView } = usePlay.getState();
    if (view !== "play") setView("play");
    else void App.exitApp();
  });
} else if ("serviceWorker" in navigator && import.meta.env.PROD) {
  // Browser build: cache the app so it keeps working offline.
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
