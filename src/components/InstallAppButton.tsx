import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";

export function InstallAppButton() {
  const { isInstallable, isInstalled, install } = useInstallPrompt();

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
