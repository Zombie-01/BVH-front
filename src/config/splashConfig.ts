/**
 * Splash Screen Configuration
 *
 * How to customize:
 *
 * 1. Using a custom Lottie animation:
 *    - Download from https://lottiefiles.com/ (free animations)
 *    - Export as JSON
 *    - Replace the animationData in SplashScreen.tsx with your JSON
 *
 * 2. Using a URL:
 *    import dynamic from 'next/dynamic';
 *    const animationData = fetch('https://lottiefiles.com/share/5xK92j').then(r => r.json());
 *
 * 3. Customize duration:
 *    - Change minDuration prop in App.tsx AppContent component
 *    - Currently set to 2500ms (2.5 seconds)
 *
 * 4. Customize text and styling:
 *    - Edit src/components/SplashScreen.tsx
 *    - Change "Loading..." text
 *    - Modify colors and sizing
 *
 * Recommended animations:
 * - Loading spinner: https://lottiefiles.com/featured
 * - Smooth loading: https://lottiefiles.com/animations/loading
 * - Material design: https://lottiefiles.com/search?q=material
 */

export const SPLASH_CONFIG = {
  // Duration in milliseconds
  minDuration: 2500,

  // Text to display
  loadingText: "Loading...",

  // Animation size in Tailwind (use Tailwind units like w-32, h-32)
  animationSize: "w-32 h-32",

  // Show on PWA and mobile app
  enableOnPWA: true,
  enableOnMobileApp: true,
  enableOnBrowser: false, // Set to true if you want splash on regular browser too
};
