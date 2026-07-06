import UIKit
import Firebase
import UserNotifications
import React
import ReactAppDependencyProvider
import RNBootSplash

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?

    // MARK: - Badge Management

    private let RECEIVED_PUSHES_KEY = "RECEIVED_PUSHES"

    func incrementApplicationBadge() {
        let receivedPushes = UserDefaults.standard.integer(forKey: RECEIVED_PUSHES_KEY)
        let newCount = receivedPushes + 1
        UIApplication.shared.applicationIconBadgeNumber = newCount
        UserDefaults.standard.set(newCount, forKey: RECEIVED_PUSHES_KEY)
        UserDefaults.standard.synchronize()
    }

    func resetApplicationBadge() {
        UIApplication.shared.applicationIconBadgeNumber = 0
        UserDefaults.standard.set(0, forKey: RECEIVED_PUSHES_KEY)
        UserDefaults.standard.synchronize()
    }

    // MARK: - UIApplicationDelegate

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Force portrait mode
        Orientation.setOrientation(UIInterfaceOrientationMask.portrait)

        // Firebase setup
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
            #if DEBUG
            FirebaseConfiguration.shared.setLoggerLevel(.debug)
            #endif
        }

        // React Native setup
        let delegate = ReactNativeDelegate()
        let factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()

        reactNativeDelegate = delegate
        reactNativeFactory = factory
        window = UIWindow(frame: UIScreen.main.bounds)
        factory.startReactNative(
            withModuleName: "appe",
            in: window,
            launchOptions: launchOptions
        )

        // UNUserNotificationCenter
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        application.registerForRemoteNotifications()

        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        resetApplicationBadge()
    }

    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return Orientation.getOrientation()
    }

    // MARK: - Deep Linking

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return RCTLinkingManager.application(application, open: url, options: options)
    }

    // MARK: - Push Notifications

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        incrementApplicationBadge()
        RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
    }

    // MARK: - UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        RNCPushNotificationIOS.didReceive(response)
        completionHandler()
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if #available(iOS 14.0, *) {
            completionHandler([.sound, .banner, .badge])
        } else {
            completionHandler([.sound, .alert, .badge])
        }
    }

}

// MARK: - ReactNativeDelegate

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {

    override func bundleURL() -> URL? {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }

    // TO change after RNBootSplash update
    override func customize(_ rootView: RCTRootView) {
        super.customize(rootView)
        RNBootSplash.initWithStoryboard("LaunchScreen", rootView: rootView)
    }

}
