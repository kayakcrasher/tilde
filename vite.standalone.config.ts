import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Static, client-only build of Tilde: used for the browser (GitHub Pages)
// and as the web bundle wrapped by Capacitor into the Android APK.
// Relative base so it works under any sub-path and inside the WebView.
export default defineConfig({
  root: fileURLToPath(new URL("./standalone", import.meta.url)),
  base: "./",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [tailwindcss(), viteReact()],
  build: {
    outDir: fileURLToPath(new URL("./dist-web", import.meta.url)),
    emptyOutDir: true,
  },
});
