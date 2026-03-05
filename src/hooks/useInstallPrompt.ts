/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Platform =
  | "browser"
  | "messenger-instagram"
  | "capacitor"
  | "unknown";

// Detect current platform
const detectPlatform = (): Platform => {
  const ua = navigator.userAgent.toLowerCase();

  // Capacitor app detection (wrapped in native iOS/Android container)
  if (
    (window as any).Capacitor ||
    (window as any).cordova ||
    ua.includes("capacitor")
  ) {
    console.log("📱 Platform: Capacitor Mobile App");
    return "capacitor";
  }

  // Messenger in-app browser detection
  if (
    ua.includes("fban/") ||
    ua.includes("fbav/") ||
    ua.includes("messenger") ||
    ua.includes("instagram") ||
    // Check for Messenger webview specific properties
    (window as any).ReactNativeWebView ||
    // Check referrer for Messenger/Instagram
    (document.referrer &&
      (document.referrer.includes("messenger.com") ||
        document.referrer.includes("instagram.com") ||
        document.referrer.includes("facebook.com")))
  ) {
    console.log("💬 Platform: Messenger/Instagram In-App Browser");
    return "messenger-instagram";
  }

  // Regular browser
  console.log("🌐 Platform: Regular Browser");
  return "browser";
};

export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");

  // Check if app is already installed
  const checkIfInstalled = () => {
    // Check for standalone mode (PWA displayed as standalone app)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("✓ PWA: App is in standalone mode (installed)");
      setIsInstalled(true);
      return;
    }

    // Check for iOS (Safari)
    if ((navigator as any).standalone === true) {
      console.log("✓ PWA: App is installed on iOS (navigator.standalone)");
      setIsInstalled(true);
      return;
    }

    console.log("ⓘ PWA: App not installed - install prompt available");
    setIsInstalled(false);
  };

  useEffect(() => {
    // Detect platform first
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    // If Capacitor app, disable PWA features
    if (detectedPlatform === "capacitor") {
      console.log("ℹ PWA: Capacitor app detected - PWA features disabled");
      setIsInstallable(false);
      setIsInstalled(true); // Hide button
      return;
    }

    // Check initial state
    checkIfInstalled();

    // Handle beforeinstallprompt event (browser only)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("✓ PWA: beforeinstallprompt captured - install button ready");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Handle appinstalled event
    const handleAppInstalled = () => {
      console.log("✓ PWA: App installed successfully!");
      setIsInstallable(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Listen for display mode changes (handles installation while app is running)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        console.log(
          "✓ PWA: Display mode changed to standalone (app installed)",
        );
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      console.warn("⚠ PWA: No install prompt available");
      return;
    }

    try {
      console.log("ℹ PWA: Showing install prompt...");
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("✓ PWA: User accepted installation");
        setIsInstallable(false);
        setDeferredPrompt(null);
      } else {
        console.log("ℹ PWA: User dismissed installation");
      }
    } catch (error) {
      console.error("✗ PWA: Installation error:", error);
    }
  };

  const openInBrowser = () => {
    console.log("ℹ PWA: Opening in external browser");
    window.open(window.location.href, "_blank");
  };

  return {
    isInstallable,
    isInstalled,
    install,
    platform,
    openInBrowser,
  };
}
