import UIKit
import AppTrackingTransparency
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
 
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  private var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  private var trackingRequestInFlight = false
  private var trackingAttemptFinished = false
 
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
 
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Native bridge regression tests exercise the views directly, without Metro or live ads.
    if ProcessInfo.processInfo.environment["AUDIENZZ_BRIDGE_TESTS"] == "1" {
      window = UIWindow(frame: UIScreen.main.bounds)
      window?.rootViewController = UIViewController()
      window?.makeKeyAndVisible()
      return true
    }
    self.launchOptions = launchOptions
    window = UIWindow(frame: UIScreen.main.bounds)
    let controller = UIViewController()
    controller.view.backgroundColor = .systemBackground
    let label = UILabel()
    label.text = "Preparing privacy settings…"
    label.translatesAutoresizingMaskIntoConstraints = false
    controller.view.addSubview(label)
    NSLayoutConstraint.activate([
      label.centerXAnchor.constraint(equalTo: controller.view.centerXAnchor),
      label.centerYAnchor.constraint(equalTo: controller.view.centerYAnchor)
    ])
    window?.rootViewController = controller
    window?.makeKeyAndVisible()
    return true
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    guard ProcessInfo.processInfo.environment["AUDIENZZ_BRIDGE_TESTS"] != "1",
          reactNativeFactory == nil, !trackingRequestInFlight else { return }
    // This is the example APP's choice, not an automatic prompt in the SDK.
    // Resolve ATT while active, before React starts and initializes the ad SDK.
    if !trackingAttemptFinished && ATTrackingManager.trackingAuthorizationStatus == .notDetermined {
      trackingRequestInFlight = true
      ATTrackingManager.requestTrackingAuthorization { [weak self] status in
        DispatchQueue.main.async {
          guard let self else { return }
          self.trackingRequestInFlight = false
          // Even an interrupted prompt must not strand startup. Without authorization
          // ads still initialize with IDFA unavailable; the app can ask again later.
          self.trackingAttemptFinished = true
          self.startReactIfActive()
        }
      }
    } else {
      startReactIfActive()
    }
  }

  private func startReactIfActive() {
    guard UIApplication.shared.applicationState == .active, reactNativeFactory == nil else { return }
    NSLog("[Example] ATT status: %ld", ATTrackingManager.trackingAuthorizationStatus.rawValue)
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
 
    reactNativeDelegate = delegate
    reactNativeFactory = factory
 
    factory.startReactNative(
      withModuleName: "AudienzzrnExample",
      in: window,
      launchOptions: launchOptions
    )
  }
}
 
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
 
  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
