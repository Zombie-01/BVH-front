import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.narmandakh.buh",
  appName: "Барилгын Үйлчилгээний Хүргэлт",
  webDir: "dist",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      splashFullScreen: true,
      backgroundColor: "#ffffffff",
    },
  },
};

export default config;
