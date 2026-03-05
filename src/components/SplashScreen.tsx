import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number; // minimum time to show splash (in ms)
}

export function SplashScreen({
  onComplete,
  minDuration = 2500,
}: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const { platform } = useInstallPrompt();

  // Modern loading animation from LottieFiles (free, no attribution required)
  const loadingAnimation = {
    v: "5.12.2",
    fr: 29.9700012207031,
    ip: 0,
    op: 150.000006109625,
    w: 200,
    h: 200,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], to: [360], ti: [0] },
              { t: 150, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [60, 60] },
                p: { a: 0, k: [0, 0] },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.6, 0.9, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 2,
                ml: 4,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                nm: "Transform",
              },
            ],
            nm: "Ellipse Group 1",
            np: 3,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            ty: "gr",
          },
        ],
      },
    ],
    markers: [],
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  // Only show splash on PWA (browser in standalone mode) and Capacitor (mobile app)
  // Don't show on regular browser
  if (!showSplash || platform === "browser" || platform === "unknown") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      {/* Lottie Animation */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32">
          <Lottie animationData={loadingAnimation} loop autoplay />
        </div>
        <h2 className="text-lg font-semibold text-muted-foreground">
          Loading...
        </h2>
      </div>
    </div>
  );
}
