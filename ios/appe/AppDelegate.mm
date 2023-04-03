#import "AppDelegate.h"
#import "Orientation.h"
#import "RNSplashScreen.h"

#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <RNCPushNotificationIOS.h>

@implementation AppDelegate

-(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  
  //
  // Force portrait mode
  //
  [Orientation setOrientation:UIInterfaceOrientationMaskPortrait];
  
  //
  // AppCenter Initialization
  // @see https://docs.microsoft.com/en-us/appcenter/sdk/getting-started/react-native
  //
  [AppCenterReactNative register];
  [AppCenterReactNativeAnalytics registerWithInitiallyEnabled:true];
  [AppCenterReactNativeCrashes registerWithAutomaticProcessing];

  //
  // React Native Firebase Initialization
  // @see https://rnfirebase.io/#configure-firebase-with-ios-credentials
  //
  if (![FIRApp defaultApp]) [FIRApp configure];
  
  //
  // Show SplashScreen
  //
  // [RNSplashScreen showSplash:@"LaunchScreen" inRootView:rootView];
  
  //
  // Launch App
  //
  self.moduleName = @"appe";
  self.initialProps = @{};
  [super application:application didFinishLaunchingWithOptions:launchOptions];
  
  //
  // Show SplashScreen
  //
  [RNSplashScreen show];
  
  return YES;
  
}

-(UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation]; // react-native-orientation-locker
}

-(BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
 return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

-(BOOL)application:(UIApplication *)application openURL:(NSURL *)url  options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RCTLinkingManager application:application openURL:url options:options];
}

-(BOOL)concurrentRootEnabled {
  return true; // Switch this bool to turn on and off the concurrent root
}

-(NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  #if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
  #else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif
}

@end
