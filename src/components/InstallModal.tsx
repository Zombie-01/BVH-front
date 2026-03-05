import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const SKIP_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SKIP_KEY = "installPromptSkipped";

export function InstallModal() {
  const [showModal, setShowModal] = useState(false);
  const { isInstallable, isInstalled, install, platform } = useInstallPrompt();

  useEffect(() => {
    // Check if user skipped recently
    const skippedTime = localStorage.getItem(SKIP_KEY);
    if (skippedTime) {
      const timePassed = Date.now() - parseInt(skippedTime);
      if (timePassed < SKIP_DURATION) {
        return; // Still within 24 hour skip period
      }
    }

    // Show modal if installable
    if (
      isInstallable &&
      !isInstalled &&
      (platform === "browser" || platform === "unknown")
    ) {
      setShowModal(true);
      console.log("📱 Install modal shown");
    }
  }, [isInstallable, isInstalled, platform]);

  const handleInstall = async () => {
    await install();
    setShowModal(false);
  };

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, Date.now().toString());
    setShowModal(false);
    console.log("⏭️ Install modal skipped for 24 hours");
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-background rounded-3xl shadow-2xl w-full md:max-w-sm p-6 md:p-8">
            {/* Close Button */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Апп суулгаарай</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Апп суулгаж илүү хурдан, илүү хөнгөн ашигла. Оффлайнаар ч ажиллах
              боломжтой.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm">Аппыг суулгах</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm">Интернетгүй байгаа үедээ ч ажиллана</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Install Button */}
              <Button
                size="lg"
                className="w-full h-12 rounded-xl font-medium gap-2"
                onClick={handleInstall}>
                <Download className="w-4 h-4" />
                <span>Суулгах</span>
              </Button>

              {/* Skip Button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 rounded-xl font-medium"
                onClick={handleSkip}>
                Алгасах
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
