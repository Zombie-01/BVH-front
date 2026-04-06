# Play Store Release Build Troubleshooting Guide

## Issues Fixed

### 1. ✅ Proguard/R8 Minification Rules

**Problem:** Code was being stripped during minification, causing crashes.

**Solution:** Enhanced `android/app/proguard-rules.pro` with:

- ✓ Capacitor core and plugin classes preserved
- ✓ Lottie animation classes and models kept intact
- ✓ WebView JavaScript interface classes protected
- ✓ Kotlin/Coroutines libraries preserved
- ✓ Annotations and metadata kept for reflection

**File:** `android/app/proguard-rules.pro` (fully configured)

### 2. ✅ AndroidManifest.xml Permissions

**Problem:** Missing permissions in release build vs debug.

**Solution:** Added common permissions needed for:

- Location services (GPS)
- Camera access
- Contact/Storage access
- Audio recording

**File:** `android/app/src/main/AndroidManifest.xml`

### 3. Capacitor Plugin Initialization

**Problem:** Plugins may fail if Capacitor methods are not available.

**What to check:**

```java
// In MainActivity.java, ensure onCreate() calls:
super.onCreate(savedInstanceState);

// Or use Capacitor.isNativePlatform() safely:
if (Capacitor.isNativePlatform()) {
  // native code
}
```

---

## Build & Test Process

### Step 1: Clean Release Build

```bash
cd android
./gradlew clean
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 2: Test Release APK Locally (Before Play Store)

```bash
# Install on device or emulator
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Or use Android Studio:
# Run > Edit Configurations > Release variant > Deploy
```

### Step 3: Check for Crashes

- Open app and perform all key flows:
  - ✓ Splash screen appears
  - ✓ Lottie animations load
  - ✓ Pages load without crashes
  - ✓ Navigation works
  - ✓ PWA install prompts show

### Step 4: Monitor Logs

```bash
# View crash logs in real-time
adb logcat | grep CRASH
adb logcat | grep -i exception
adb logcat | grep -i error

# Or use Android Studio's Logcat window
```

### Step 5: Play Store Upload

Once local testing passes:

1. Upload APK/AAB to Play Store console
2. Roll out to internal testing first
3. Monitor Play Store crash reports (Console > Android vitals > Crashes)
4. Gradually increase rollout (e.g., 5% → 25% → 100%)

---

## Common Issues & Fixes

### Issue: "Lottie animations not working in release"

```
Error: Cannot load animation data
```

**Fix:** Ensure Lottie classes are in proguard-rules.pro (✓ Done)

### Issue: "Capacitor plugin not found"

```
Error: Plugin "X" not found
```

**Fix:** Keep all Capacitor plugin classes:

```proguard
-keep public class ** extends com.getcapacitor.Plugin { *; }
-keep public class ** extends com.getcapacitor.PluginCall
```

### Issue: "App crashes on specific feature"

```
Error: Something went horribly wrong on xxxx
```

**Fix:**

1. Check if feature uses dynamic imports/reflection
2. Add specific classes to proguard-rules.pro:
   ```proguard
   -keep class your.package.ClassName { *; }
   ```
3. Rebuild and test

### Issue: "Permission denied at runtime"

```
Error: Permission denied (os error 13)
```

**Fix:** Add permission to AndroidManifest.xml and request at runtime (React handles this)

---

## Version Info

- **Package:** com.narmandakh.buh
- **Current versionCode:** 9
- **Current versionName:** 1.0.9
- **minSdkVersion:** See `android/variables.gradle`
- **targetSdkVersion:** See `android/variables.gradle`

---

## Next Release Checklist

- [ ] Run `./gradlew clean assembleRelease`
- [ ] Test APK on device/emulator
- [ ] Check logcat for errors
- [ ] Verify Splash screen & animations load
- [ ] Test all key user flows
- [ ] Increment versionCode in `android/app/build.gradle`
- [ ] Upload to Play Store console
- [ ] Monitor crash reports for 24 hours
- [ ] Gradually rollout if no crashes

---

## Firebase Crashlytics (Optional Setup)

To auto-monitor crashes on Play Store:

```gradle
// In android/app/build.gradle
dependencies {
    implementation 'com.google.firebase:firebase-crashlytics-ktx'
}
```

Then view crashes in Firebase Console > Crashlytics tab.

---

## Debug vs Release Comparison

| Feature          | Debug        | Release            |
| ---------------- | ------------ | ------------------ |
| Minification     | ❌ Disabled  | ✅ Enabled (R8)    |
| Proguard Rules   | N/A          | ✅ Applied         |
| Line Numbers     | ✅ Available | ✅ Preserved       |
| Logging          | ✅ Full      | ⚠️ Stripped        |
| Code Size        | ~50MB        | ~15MB              |
| Crash Visibility | Local logcat | Firebase/PlayStore |

---

## Resources

- [Android ProGuard Documentation](https://developer.android.com/studio/build/shrink-code)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Lottie Android Docs](https://github.com/airbnb/lottie-android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
