import { useEffect } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function MessengerRedirect() {
  const { platform, openInBrowser } = useInstallPrompt();

  useEffect(() => {
    // If in Messenger/Instagram webview, force redirect to external browser
    if (platform === "messenger-instagram") {
      console.log(
        "💬 Messenger webview detected - forcing external browser redirect",
      );

      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        openInBrowser();
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [platform, openInBrowser]);

  // This component doesn't render anything - it just handles the redirect
  return null;
}
