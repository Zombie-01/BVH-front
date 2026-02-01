import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register PWA service worker (vite-plugin-pwa). The import is a virtual module
// added by the plugin; safe-guard so local dev without the plugin doesn't break.
let unregisterSW: (() => void) | undefined;
try {
  // `virtual:pwa-register` is injected by vite-plugin-pwa
  // eslint-disable-next-line import/no-unresolved, @typescript-eslint/no-var-requires
  const { registerSW } = require("virtual:pwa-register");
  const updateSW = registerSW({
    onRegistered(r) {
      // r is the registration or a function that updates — keep reference for debugging
      unregisterSW = r && typeof r === "function" ? r : undefined;
      console.info("PWA: service worker registered", r);
    },
    onRegisterError(err) {
      console.warn("PWA: service worker registration failed", err);
    },
  });
  // expose for debug in devtools console
  (window as any).__updateServiceWorker = updateSW;
} catch (err) {
  // plugin not installed in this environment — ignore
}

createRoot(document.getElementById("root")!).render(<App />);
