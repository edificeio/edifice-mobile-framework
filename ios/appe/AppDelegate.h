#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>

// begin --- https://github.com/react-native-push-notification/ios
#import <UserNotifications/UNUserNotificationCenter.h>
// end --- https://github.com/react-native-push-notification/ios

@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>
@end
