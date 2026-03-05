# Lottie Splash Screen Setup Guide

This splash screen uses **Lottie animations** and displays only on PWA and Capacitor mobile apps (not on regular browsers).

## 📁 Files Created

- `src/components/SplashScreen.tsx` - Main splash screen component
- `src/contexts/SplashScreenContext.tsx` - Context for managing splash state
- `src/config/splashConfig.ts` - Configuration options
- `src/App.tsx` - Updated with splash screen provider

## 🛠️ How It Works

1. **On App Load**: Splash screen appears for 2.5 seconds (customizable)
2. **Platform Detection**: Only shows on PWA + Capacitor, skips regular browser
3. **Auto-Hide**: Automatically disappears after duration
4. **Smooth Transition**: App renders beneath while splash is visible

## 🎨 How to Use a Custom Lottie Animation

### Option 1: Download from LottieFiles (Recommended)

1. Go to https://lottiefiles.com/
2. Search for "loading" or "splash" animations
3. Download the JSON file
4. Open `src/components/SplashScreen.tsx`
5. Replace the `loadingAnimation` object with your downloaded JSON

**Example:**

```tsx
import loadingJSON from "@/assets/animations/my-animation.json";

// Instead of inline animation object:
const loadingAnimation = loadingJSON;
```

### Option 2: Use Animation URL

```tsx
// In SplashScreen.tsx
const [animationData, setAnimationData] = useState(null);

useEffect(() => {
  fetch("https://lottiefiles.com/share/5xK92j/download")
    .then((r) => r.json())
    .then((data) => setAnimationData(data));
}, []);

// Then use: <Lottie animationData={animationData} />
```

### Option 3: Customize Existing Animation

The current animation uses:

- **Color**: `[0.2, 0.6, 0.9, 1]` = Blue (#3399FF)
- **Speed**: 150 frames rotation
- **Size**: 60px diameter circle

To change color: Edit the `c` value in the animation object.

## 🎬 Recommended Animations (Uber/Pinterest/Airbnb style)

- **Smooth loaders**: https://lottiefiles.com/animations/loading
- **Minimal spinners**: https://lottiefiles.com/animations/loading-circle
- **Modern loaders**: https://lottiefiles.com/featured?category=loading

## ⚙️ Configuration Options

Edit `src/App.tsx` to change:

```tsx
// In AppContent component useEffect
const timer = setTimeout(() => {
  hideSplash();
}, 2500); // Change duration here (milliseconds)
```

Edit `src/components/SplashScreen.tsx` to change:

```tsx
// Change text
<h2 className="text-lg font-semibold text-muted-foreground">Loading...</h2>

// Change size
<div className="w-32 h-32"> {/* Change to w-40 h-40, etc. */}

// Change background
<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
```

## 🚀 When Splash Shows

✅ **Shows:**

- PWA in standalone mode (installed)
- Capacitor mobile app (iOS/Android)

❌ **Doesn't show:**

- Regular browser
- Desktop Chrome/Firefox (not installed)

## 🔧 Advanced: Custom Loading States

To show splash during actual data loading:

```tsx
// In any component
import { useSplashScreen } from "@/contexts/SplashScreenContext";

function MyComponent() {
  const { hideSplash } = useSplashScreen();

  useEffect(() => {
    // Your data loading logic
    fetchData().then(() => {
      hideSplash(); // Hide when data is ready
    });
  }, []);
}
```

## 📱 Testing

**Local Development:**

```bash
npm run dev
```

Splash won't show (regular browser)

**Build & Test PWA:**

```bash
npm run build
# Serve and Install as PWA
# Then reload - splash will show
```

**Mobile Testing:**

```bash
npm run build
npx cap add android
npx cap run android
# Or for iOS:
npx cap add ios
npx cap run ios
```

Splash will show on mobile!
