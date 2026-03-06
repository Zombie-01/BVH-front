import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

// Only register PWA in web builds, never in native (Android/iOS)
if (!isNative && typeof window !== "undefined") {
  // Check if PWA virtual module is available to avoid crashes in Play Store builds
  if ("serviceWorker" in navigator) {
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (typeof registerSW === "function") {
          try {
            const updateSW = registerSW({
              onRegistered(r) {
                console.info("PWA: service worker registered", r);
              },
              onRegisterError(err) {
                console.warn("PWA: service worker registration failed", err);
              },
            });

            (window as any).__updateServiceWorker = updateSW;
          } catch (error) {
            console.warn("PWA: registration error", error);
          }
        }
      })
      .catch((err) => {
        console.debug("PWA: virtual module not available in this build", err);
      });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
