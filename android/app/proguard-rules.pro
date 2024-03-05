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

# Zendesk
-keep class zendesk.answerbot.** { *; }
-keepclassmembers class zendesk.answerbot.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.chat.** { *; }
-keepclassmembers class zendesk.chat.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.classic.messaging.** { *; }
-keepclassmembers class zendesk.classic.messaging.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.core.** { *; }
-keepclassmembers class zendesk.core.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.support.** { *; }
-keepclassmembers class zendesk.support.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.support.guide.** { *; }
-keepclassmembers class zendesk.support.guide.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.support.request.** { *; }
-keepclassmembers class zendesk.support.request.* {
    <fields>;
    <init>();
    <methods>;
}

-keep class zendesk.support.requestList.** { *; }
-keepclassmembers class zendesk.support.requestList.* {
    <fields>;
    <init>();
    <methods>;
}
