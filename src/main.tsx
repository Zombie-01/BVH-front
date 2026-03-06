import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

if (!isNative) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        onRegistered(r) {
          console.info("PWA: service worker registered", r);
        },
        onRegisterError(err) {
          console.warn("PWA: service worker registration failed", err);
        },
      });

      (window as any).__updateServiceWorker = updateSW;
    })
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);