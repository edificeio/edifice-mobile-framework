import UIKit
import Firebase
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    
    var window: UIWindow?
    
    private let RECEIVED_PUSHES_KEY = "RECEIVED_PUSHES"
    
    // MARK: - Badge Management
    
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
        
        // React Native Firebase Initialization
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
            #if DEBUG
            FirebaseConfiguration.shared.setLoggerLevel(.debug)
            #endif
        }
        
        // Define UNUserNotificationCenter
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        application.registerForRemoteNotifications()
        
        // Initialize React Native bridge
        let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
        let rootView = RCTRootView(bridge: bridge!, moduleName: "appe", initialProperties: nil)
        
        if #available(iOS 13.0, *) {
            rootView.backgroundColor = UIColor.systemBackground
        } else {
            rootView.backgroundColor = UIColor.white
        }
        
        self.window = UIWindow(frame: UIScreen.main.bounds)
        let rootViewController = UIViewController()
        rootViewController.view = rootView
        self.window?.rootViewController = rootViewController
        self.window?.makeKeyAndVisible()
        
        // Show SplashScreen
        RNSplashScreen.showSplash("SplashScreen", inRootView: rootViewController.view)
        
        return true
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        resetApplicationBadge()
    }
    
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return Orientation.getOrientation()
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return RCTLinkingManager.application(application, open: url, options: options)
    }
    
    // MARK: - Push Notifications
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
      RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
    }
    
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
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

// MARK: - RCTBridgeDelegate

extension AppDelegate: RCTBridgeDelegate {
    
    func sourceURL(for bridge: RCTBridge) -> URL? {
        return bundleURL()
    }
    
    func bundleURL() -> URL? {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
