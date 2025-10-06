import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
 
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
 
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

    // Preprocess launchOptions: if app was launched with a file URL, copy it
    // to tmp (security-scoped) and pass the tmp URL to React Native so
    // Linking.getInitialURL() will point to a readable path.
    var modifiedLaunchOptions = launchOptions
    if let opts = launchOptions, let urlAny = opts[.url] {
      if let url = urlAny as? URL {
        if let tmp = copyFileToTmp(url: url) {
          var newOpts = opts
          newOpts[.url] = tmp
          modifiedLaunchOptions = newOpts
          NSLog("AppDelegate replaced launchOptions URL with temp copy: %@", tmp.absoluteString)
        }
      } else if let urlString = urlAny as? String, let url = URL(string: urlString) {
        if let tmp = copyFileToTmp(url: url) {
          var newOpts = opts
          newOpts[.url] = tmp
          modifiedLaunchOptions = newOpts
          NSLog("AppDelegate replaced launchOptions URL (string) with temp copy: %@", tmp.absoluteString)
        }
      }
    }

    factory.startReactNative(
      withModuleName: "spiewnikreligijnyapp",
      in: window,
      launchOptions: modifiedLaunchOptions
    )



    return true
  }
  private func copyFileToTmp(url: URL) -> URL? {
    var urlToForward = url
    let fm = FileManager.default
    let tmpDir = URL(fileURLWithPath: NSTemporaryDirectory())
    let dest = tmpDir.appendingPathComponent(UUID().uuidString + "-" + url.lastPathComponent)

    var didStart = false
    if url.startAccessingSecurityScopedResource() {
      didStart = true
    }

    if didStart {
      defer { url.stopAccessingSecurityScopedResource() }
      do {
        if fm.fileExists(atPath: dest.path) {
          try fm.removeItem(at: dest)
        }
        try fm.copyItem(at: url, to: dest)
        NSLog("copyFileToTmp copied to %@", dest.path)
        return dest
      } catch {
        NSLog("copyFileToTmp copy failed: %@", error.localizedDescription)
      }
    }

    var coordErr: NSError?
    let coordinator = NSFileCoordinator(filePresenter: nil)
    var resultDest: URL? = nil
    coordinator.coordinate(readingItemAt: url, options: [], error: &coordErr) { (newURL) in
      do {
        if fm.fileExists(atPath: dest.path) {
          try fm.removeItem(at: dest)
        }
        try fm.copyItem(at: newURL, to: dest)
        resultDest = dest
        NSLog("copyFileToTmp coordinated copy to %@", dest.path)
      } catch {
        NSLog("copyFileToTmp coordinated copy failed: %@", error.localizedDescription)
      }
    }
    if coordErr != nil {
      NSLog("copyFileToTmp coordination error: %@", coordErr!.localizedDescription)
    }
    return resultDest
  }

  func application(
    _ application: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    NSLog("AppDelegate open URL: %@", url.absoluteString)
      var urlToForward = url

      if url.isFileURL {
        let fm = FileManager.default
        let tmpDir = URL(fileURLWithPath: NSTemporaryDirectory())
        let dest = tmpDir.appendingPathComponent(UUID().uuidString + "-" + url.lastPathComponent)

        var didStart = false
        if url.startAccessingSecurityScopedResource() {
          didStart = true
        }

        if didStart {
          defer { url.stopAccessingSecurityScopedResource() }
          do {
            if fm.fileExists(atPath: dest.path) {
              try fm.removeItem(at: dest)
            }
            try fm.copyItem(at: url, to: dest)
            urlToForward = dest
            NSLog("AppDelegate copied file to temp: %@", dest.path)
            NotificationCenter.default.post(name: Notification.Name("RNFileOpener_fileOpened"), object: nil, userInfo: ["path": dest.path])
          } catch {
            NSLog("AppDelegate copy failed: %@", error.localizedDescription)
          }
        } else {
          var coordinationError: NSError?
          NSFileCoordinator().coordinate(readingItemAt: url, options: [], error: &coordinationError) { (newURL) in
            do {
              if fm.fileExists(atPath: dest.path) {
                try fm.removeItem(at: dest)
              }
              try fm.copyItem(at: newURL, to: dest)
              urlToForward = dest
              NSLog("AppDelegate coordinated copy to temp: %@", dest.path)
              NotificationCenter.default.post(name: Notification.Name("RNFileOpener_fileOpened"), object: nil, userInfo: ["path": dest.path])
            } catch {
              NSLog("AppDelegate coordinated copy failed: %@", error.localizedDescription)
            }
          }
          NSLog("AppDelegate: couldn't startAccessingSecurityScopedResource for %@", url.absoluteString)
        }
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
