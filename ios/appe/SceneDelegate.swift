import UIKit
import React

/// UIScene life cycle adoption (required for apps built against the iOS 27 SDK).
///
/// The React Native root window is created here instead of in AppDelegate.
/// AppDelegate still owns the RCTReactNativeFactory; this class just gives it
/// a window to start into, and forwards the scene-scoped callbacks that no
/// longer reach UIApplicationDelegate.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    // MARK: - Scene life cycle

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene,
              let appDelegate = UIApplication.shared.delegate as? AppDelegate,
              let factory = appDelegate.reactNativeFactory else {
            return
        }

        // Cold-start deep links no longer arrive in the app's launchOptions —
        // they come in via connectionOptions. Fold them back in so that
        // RCTLinkingManager sees them and Linking.getInitialURL() resolves.
        var launchOptions = appDelegate.launchOptions ?? [:]
        if let url = connectionOptions.urlContexts.first?.url {
            launchOptions[.url] = url
        } else if let userActivity = connectionOptions.userActivities.first,
                  userActivity.activityType == NSUserActivityTypeBrowsingWeb,
                  let webpageURL = userActivity.webpageURL {
            launchOptions[.url] = webpageURL
        }

        let window = UIWindow(windowScene: windowScene)
        factory.startReactNative(
            withModuleName: "appe",
            in: window,
            launchOptions: launchOptions
        )

        self.window = window
        // Kept in sync so anything still reading the app delegate's window
        // (orientation locking, native modules) keeps working.
        appDelegate.window = window
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Was applicationDidBecomeActive(_:), which no longer fires under UIScene.
        (UIApplication.shared.delegate as? AppDelegate)?.resetApplicationBadge()
    }

    // MARK: - Deep Linking

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        RCTLinkingManager.application(
            UIApplication.shared,
            continue: userActivity,
            restorationHandler: { _ in }
        )
    }

}
