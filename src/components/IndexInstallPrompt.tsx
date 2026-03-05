import { motion } from "framer-motion";
import { Download, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function IndexInstallPrompt() {
  const { isInstallable, isInstalled, install, platform, openInBrowser } =
    useInstallPrompt();

  // Don't show if already installed or not a supported platform
  if (
    isInstalled ||
    !isInstallable ||
    (platform !== "browser" && platform !== "unknown")
  ) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground text-center">
        Та апп суулгахыг хүсэж байна уу?
      </p>

      <div className="flex gap-3">
        {/* Install App Button */}
        <Button
          size="lg"
          className="flex-1 h-12 rounded-xl font-medium gap-2"
          onClick={install}>
          <Download className="w-4 h-4" />
          <span>Суулгах</span>
        </Button>

        {/* Stay in Browser Button */}
        <Button
          size="lg"
          variant="outline"
          className="flex-1 h-12 rounded-xl font-medium gap-2"
          onClick={() => (window.location.href = "/auth")}>
          <Globe className="w-4 h-4" />
          <span>Үргэлжүүлэх</span>
        </Button>
      </div>
    </motion.div>
  );
}
