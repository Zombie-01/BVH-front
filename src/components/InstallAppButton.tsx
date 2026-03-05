import { Download, ExternalLink } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";

export function InstallAppButton() {
  const { isInstallable, isInstalled, install, platform, openInBrowser } =
    useInstallPrompt();

  // Capacitor app - hide button
  if (platform === "capacitor") {
    return null;
  }

  // Messenger/Instagram in-app browser - show "Open in Browser" button
  if (platform === "messenger-instagram") {
    return (
      <Button
        onClick={openInBrowser}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        title="Open this app in your browser for full features">
        <ExternalLink className="w-4 h-4" />
        <span className="hidden sm:inline">Open in Browser</span>
        <span className="sm:hidden">Browser</span>
      </Button>
    );
  }

  // Regular browser - show PWA install button
  // Don't render if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={install}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      title="Install this app on your device">
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </Button>
  );
}
