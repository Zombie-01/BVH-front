/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
// import Lottie from "lottie-react";
import { Capacitor } from "@capacitor/core";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function SplashScreen({
  onComplete,
  minDuration = 2500,
}: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const { platform } = useInstallPrompt();

  const isNative = Capacitor.isNativePlatform();
  const isBrowser =
    typeof window !== "undefined" && typeof navigator !== "undefined";
  const isStandalone =
    isBrowser &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true);

  const shouldShowSplash = isNative || isStandalone;

  const loadingAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "loader",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0] },
              { t: 120, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { a: 0, k: [0, 0] },
                s: { a: 0, k: [80, 80] },
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.6, 0.9, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 2,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
              },
            ],
          },
        ],
      },
    ],
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  if (!showSplash || !shouldShowSplash) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32">
          {/* <Lottie animationData={loadingAnimation} loop autoplay /> */}
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground">
          Түр хүлээнэ үү
        </h2>
      </div>
    </div>
  );
}
