import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

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
    // Check initial state
    checkIfInstalled();

    // Handle beforeinstallprompt event
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

  return {
    isInstallable,
    isInstalled,
    install,
  };
}
