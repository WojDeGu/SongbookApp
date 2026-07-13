import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  // Fixed, well-known tmp path where a cold-launch .sbpreset file gets copied.
  // JS polls this path directly (via RNFS) on mount instead of depending on
  // Linking.getInitialURL(), whose launchOptions plumbing is unreliable on
  // cold app launch under the New Architecture (bridgeless) runtime.
  static let pendingImportURL = URL(fileURLWithPath: NSTemporaryDirectory())
    .appendingPathComponent("pending_sbpreset_import.sbpreset")

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    if let opts = launchOptions, let urlAny = opts[.url] {
      if let url = urlAny as? URL {
        copyFileToTmp(url: url, dest: AppDelegate.pendingImportURL)
      } else if let urlString = urlAny as? String, let url = URL(string: urlString) {
        copyFileToTmp(url: url, dest: AppDelegate.pendingImportURL)
      }
    }

    factory.startReactNative(
      withModuleName: "spiewnikreligijnyapp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  @discardableResult
  private func copyFileToTmp(url: URL) -> URL? {
    let dest = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent(UUID().uuidString + "-" + url.lastPathComponent)
    return copyFileToTmp(url: url, dest: dest) ? dest : nil
  }

  @discardableResult
  private func copyFileToTmp(url: URL, dest: URL) -> Bool {
    let fm = FileManager.default

    func copy(from source: URL) -> Bool {
      do {
        if fm.fileExists(atPath: dest.path) {
          try fm.removeItem(at: dest)
        }
        try fm.copyItem(at: source, to: dest)
        NSLog("copyFileToTmp copied to %@", dest.path)
        return true
      } catch {
        NSLog("copyFileToTmp copy failed: %@", error.localizedDescription)
        return false
      }
    }

    if url.startAccessingSecurityScopedResource() {
      defer { url.stopAccessingSecurityScopedResource() }
      return copy(from: url)
    }

    var coordErr: NSError?
    var didCopy = false
    NSFileCoordinator(filePresenter: nil).coordinate(readingItemAt: url, options: [], error: &coordErr) { newURL in
      didCopy = copy(from: newURL)
    }
    if let coordErr = coordErr {
      NSLog("copyFileToTmp coordination error: %@", coordErr.localizedDescription)
    }
    return didCopy
  }

  func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    NSLog("AppDelegate open URL: %@", url.absoluteString)
    var urlToForward = url

    if url.isFileURL, let tmp = copyFileToTmp(url: url) {
      urlToForward = tmp
    }

    return RCTLinkingManager.application(application, open: urlToForward, options: options)
  }

  // Obsługa Universal Links (opcjonalnie, zostawione na przyszłość)
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    NSLog("AppDelegate continueUserActivity: type=%@, url=%@", userActivity.activityType, userActivity.webpageURL?.absoluteString ?? "nil")
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
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
