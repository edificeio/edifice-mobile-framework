#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>
#import <Firebase.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTRootView.h>
#import <RNCPushNotificationIOS.h>

#if DEBUG
#import <FlipperKit/FlipperClient.h>
//#import <FlipperKitLayoutComponentKitSupport/FlipperKitLayoutComponentKitSupport.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#endif

#import "AppDelegate.h"
#import "RNSplashScreen.h"


@implementation AppDelegate


-(NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  #if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif
}


-(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  
  //
  // Flipper Initialization
  // @see https://fbflipper.com/docs/getting-started/ios-native/
  //
  #if DEBUG
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  // [FlipperKitLayoutComponentKitSupport setUpWithDescriptorMapper: layoutDescriptorMapper];
  [client addPlugin: [[FlipperKitLayoutPlugin alloc] initWithRootNode: application withDescriptorMapper: layoutDescriptorMapper]];
  [client addPlugin: [[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client start];
  #endif

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
  // App View Initialization/Creation
  //
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"appe" initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  //
  // Show SplashScreen
  //
  [RNSplashScreen show];
  
  return YES;
  
}


-(BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RCTLinkingManager application:application openURL:url options:options];
}


-(BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
 return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}


@end
