# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ============================================================================
# CAPACITOR CORE - Keep all Capacitor classes and methods
# ============================================================================
-keep public class com.getcapacitor.** { *; }
-keep public class com.getcapacitor.annotation.** { *; }
-keep public class com.getcapacitor.plugin.** { *; }

# Keep Capacitor plugins and cordova bridges
-keep,includedescriptorclasses public class * extends com.getcapacitor.Plugin { *; }
-keep,includedescriptorclasses public class * extends com.getcapacitor.cordova.MockCordovaPluginInterface { *; }

# Keep all plugin implementations
-keep public class ** extends com.getcapacitor.PluginCall
-keep public class ** extends com.getcapacitor.CapacitorPlugin

# Keep callback interfaces
-keepclasseswithmembernames class * {
    native <methods>;
}

# ============================================================================
# LOTTIE ANIMATION - Keep Lottie classes and model data
# ============================================================================
-keep class com.airbnb.lottie.** { *; }
-keep class com.airbnb.lottie.animation.** { *; }
-keep class com.airbnb.lottie.model.** { *; }
-keep class com.airbnb.lottie.parser.** { *; }
-keep class com.airbnb.lottie.value.** { *; }

# Keep nested inner classes for Lottie
-keep class com.airbnb.lottie.LottieAnimationView
-keep class com.airbnb.lottie.LottieComposition
-keep class com.airbnb.lottie.utils.Utils

# Keep all Lottie Drawables
-keep class com.airbnb.lottie.drawable.** { *; }

# JSON parsing for animations (gson/json)
-keep class com.google.gson.** { *; }
-keep class com.google.gson.stream.** { *; }
-keep interface com.google.gson.** { *; }

# ============================================================================
# JAVASCRIPT INTERFACE FOR WEBVIEW
# ============================================================================
-keepclasseswithmembernames class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all webkit components
-keep public class android.webkit.** { *; }

# ============================================================================
# ANDROIDX & SUPPORT LIBRARIES
# ============================================================================
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-keep class android.support.** { *; }

# ============================================================================
# REACT NATIVE (if used)
# ============================================================================
-keep public class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }

# ============================================================================
# KOTLIN COROUTINES & STDLIB
# ============================================================================
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-keep class kotlin.coroutines.** { *; }

# ============================================================================
# KEEP LINE NUMBERS FOR CRASH REPORTS
# ============================================================================
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ============================================================================
# KEEP ANNOTATIONS
# ============================================================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ============================================================================
# ENUM CLASSES
# ============================================================================
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ============================================================================
# PARCELABLE & SERIALIZABLE
# ============================================================================
-keep class * implements android.os.Parcelable { *; }
-keep class * implements java.io.Serializable { *; }
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    static final java.io.ObjectStreamField[] serialPersistentFields;
    private static final java.io.ObjectStreamField[] $serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ============================================================================
# CUSTOM APPLICATION CLASS
# ============================================================================
-keep public class com.narmandakh.buh.MainActivity { *; }
-keep public class com.narmandakh.buh.** { *; }

# ============================================================================
# REMOVE LOGGING IN RELEASE
# ============================================================================
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ============================================================================
# OPTIMIZATION FLAGS
# ============================================================================
-optimizationpasses 5
-dontoptimize

# Use this if you want to fully optimize (may cause issues)
# -optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
