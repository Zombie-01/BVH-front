import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

interface SplashScreenContextType {
  showSplash: boolean;
  hideSplash: () => void;
}

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(
  undefined,
);

export function SplashScreenProvider({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  // Auto-hide splash on mount (for background loading scenarios)
  useEffect(() => {
    // Keep splash visible for at least 2 seconds
    const timer = setTimeout(() => {
      // Don't auto-hide, let the app logic decide
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const hideSplash = useCallback(() => {
    setShowSplash(false);
    console.log("✓ Splash screen hidden");
  }, []);

  return (
    <SplashScreenContext.Provider value={{ showSplash, hideSplash }}>
      {children}
    </SplashScreenContext.Provider>
  );
}

export function useSplashScreen() {
  const context = useContext(SplashScreenContext);
  if (!context) {
    throw new Error("useSplashScreen must be used within SplashScreenProvider");
  }
  return context;
}
