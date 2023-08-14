#import "AppDelegate.h"
#import "Orientation.h"
#import "RNSplashScreen.h"

#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

// begin --- https://github.com/react-native-push-notification/ios
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
// end --- https://github.com/react-native-push-notification/ios

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
  
  // being --- https://github.com/react-native-push-notification/ios
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  // end --- https://github.com/react-native-push-notification/ios
  
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

// begin --- https://github.com/react-native-push-notification/ios

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  completionHandler(UIBackgroundFetchResultNewData);
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}
//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  
  //Still call the javascript onNotification handler so it can display the new message right away
  NSDictionary *userInfo = notification.request.content.userInfo;
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo];
  
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

// end --- https://github.com/react-native-push-notification/ios

@end
