#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>
#import <Firebase.h>
#import <RNCPushNotificationIOS.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <UserNotifications/UserNotifications.h>

#import "AppDelegate.h"
#import "Orientation.h"
#import "RNSplashScreen.h"

static NSString* RECEIVED_PUSHES_KEY = @"RECEIVED_PUSHES";

@implementation AppDelegate

-(void)incrementApplicationBadge {
  int receivedPushes = [[NSUserDefaults standardUserDefaults] integerForKey:RECEIVED_PUSHES_KEY];
  [UIApplication sharedApplication].applicationIconBadgeNumber = ++receivedPushes;
  [[NSUserDefaults standardUserDefaults] setInteger:receivedPushes forKey:RECEIVED_PUSHES_KEY];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

-(void)resetApplicationBadge {
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
  [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:RECEIVED_PUSHES_KEY];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

-(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

  //
  // Force portrait mode
  //
  [Orientation setOrientation:UIInterfaceOrientationMaskPortrait];

  //
  // AppCenter Initialization
  //
  [AppCenterReactNative register];
  [AppCenterReactNativeAnalytics registerWithInitiallyEnabled:true];
  [AppCenterReactNativeCrashes registerWithAutomaticProcessing];

  //
  // React Native Firebase Initialization
  //
  if (![FIRApp defaultApp]) [FIRApp configure];

  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [[UIApplication sharedApplication] registerForRemoteNotifications];

  //
  // Launch App
  //
  self.moduleName = @"appe";
  self.initialProps = @{};
  [super application:application didFinishLaunchingWithOptions:launchOptions];

  //
  // Show SplashScreen
  //
  [RNSplashScreen showSplash:@"SplashScreen" inRootView:[[[self window] rootViewController] view]];

  return YES;

}

-(void)applicationDidBecomeActive:(UIApplication *)application {
  [self resetApplicationBadge];
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

-(NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

-(NSURL *)bundleURL {
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


//
// Push Notifications Management
//

-(void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

-(void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  @try {
    [self incrementApplicationBadge];
    [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  } @catch (NSException *exception){}
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

@end
