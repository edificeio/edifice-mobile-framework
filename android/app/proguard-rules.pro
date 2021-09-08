# React Native Fast Image (see https://github.com/DylanVann/react-native-fast-image#are-you-using-proguard)
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# Hermes debugger
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-svg
-keep public class com.horcrux.svg.** {*;}

# BuildConfig

-keep class com.ode.appe.BuildConfig { *; }
