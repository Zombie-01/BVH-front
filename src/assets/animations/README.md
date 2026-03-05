# Lottie Animations Directory

Add custom Lottie animation JSON files here.

## How to add a custom animation:

1. **Download** a Lottie animation from https://lottiefiles.com/
2. **Place** the JSON file in this directory
3. **Import** in `src/components/SplashScreen.tsx`:
   ```tsx
   import loadingAnimation from "@/assets/animations/my-animation.json";
   ```
4. **Use** in the component:
   ```tsx
   <Lottie animationData={loadingAnimation} loop autoplay />
   ```

## Recommended animations for splash screens:

- **Modern Loading**: https://lottiefiles.com/animations/loading
- **Minimal Spinner**: https://lottiefiles.com/animations/loading-circle
- **Smooth Loader**: https://lottiefiles.com/animations/smooth-loading
- **Material Design**: https://lottiefiles.com/search?q=material+loading

## File format:

All files should be `.json` format exported from LottieFiles with animation data.

Example structure:

```json
{
  "v": "5.12.2",
  "fr": 24,
  "ip": 0,
  "op": 120,
  "w": 200,
  "h": 200,
  "nm": "Loading",
  "layers": [ ... ]
}
```
