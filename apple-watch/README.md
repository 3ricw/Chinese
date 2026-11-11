# Eric’s Chinese for Apple Watch — development preview

Five-card offline reading rounds, large real Chinese forms, simplified/traditional selection from the website, personal-note hints, resume after reopening, and Again / Almost / Got it self-grading. A small iPhone companion imports a practice copy from the website and sends it through Apple’s WatchConnectivity framework. Only the most recent set is queued; an active Watch round keeps its own snapshot. Up to 12 round summaries return to the companion, with stable IDs to avoid duplicates.

**This is native source for build and device testing. There is no App Store/TestFlight release or browser-to-Watch automatic installation.** There are no accounts, cloud sync, background reminders, complications, or microphone/audio features in this preview. Watch practice does not update website recognition, word familiarity, XP, quests, streaks, or companion rewards.

## Build on a Mac

Requires Xcode with the iOS/watchOS SDKs and XcodeGen 2.44 or newer. Minimum targets: iOS 17 and watchOS 10. Use current supported Xcode/OS versions for your physical devices.

```sh
cd apple-watch
swift test
xcodegen generate
open EricsChineseWrist.xcodeproj
```

In Xcode, choose your development team for **both** targets. If the example bundle identifiers are unavailable to your team, change both identifiers and the Watch target’s `WKCompanionAppBundleIdentifier` together.

There are two run schemes for local development. Run `EricsChinesePhone` on the iPhone and `EricsChineseWatch` on its paired Watch, or run both on a paired iPhone/Watch simulator. The Watch target is a modern single-target SwiftUI application. The spec deliberately keeps the development run targets separate; App Store embedding, icons, entitlements and distribution provisioning are not configured. Xcode’s “Watch App with New Companion iOS App” template is an alternative: add `Shared` to both targets, `Phone` to the iOS target, and `Watch` to the Watch target, removing the template’s generated app entry points first.

Unsigned compile checks:

```sh
xcodebuild -project EricsChineseWrist.xcodeproj -scheme EricsChinesePhone -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
xcodebuild -project EricsChineseWrist.xcodeproj -scheme EricsChineseWatch -sdk watchsimulator -destination 'generic/platform=watchOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

The repository’s `Apple Watch source checks` workflow runs the shared model’s tests and both simulator builds. A successful compile still does not establish physical Watch behavior or successful signing/installation.

## Send a set

1. At [Eric’s Chinese](https://3ricw.github.io/Chinese/), open **Tools → Apple Watch**.
2. Choose studied characters from your current course, studied common words, or saved common words. Studied sets prioritize earlier due dates. Export the set to Files. Personal notes for those five items are included.
3. In the iPhone companion, choose **Import practice set**, select `Erics_Chinese_Watch_Set.json`, then **Send to Watch**.
4. Open the Watch app. Once the set is received it works offline. An incoming set leaves any unfinished round intact.
5. Read each form before revealing it. Opening a personal note counts as help. Rate what you knew **before** the reveal. This is self-grading, not handwriting or pronunciation detection.

No email, Messages, account, or external server is used for transfer. Safari storage is separate from native app storage; the exported set is an explicit copy, not a backup. Changes to notes in the website require a new export. Round summaries remain in the native apps, not the website. Repeating rounds grants no website rewards.

## Device verification still needed

Check smallest and largest Watch sizes, Dynamic Type/VoiceOver, Digital Crown scrolling, slow/offline delivery, importing from iCloud Files, interrupted writes, app termination mid-card, incoming sets during a round, re-pairing/switching Watches, and real signing/install. Also check a saved note before revealing and rapid/duplicate grading taps. Keep the original browser backup before any local device experiment.

## Implementation references

- [Apple: setting up a watchOS project](https://developer.apple.com/documentation/watchos-apps/setting-up-a-watchos-project)
- [Apple: WatchConnectivity](https://developer.apple.com/documentation/watchconnectivity)
- [Apple: transferring data](https://developer.apple.com/documentation/watchconnectivity/transferring-data-with-watch-connectivity)
- [Apple: SwiftUI fileImporter](https://developer.apple.com/documentation/swiftui/view/fileimporter(ispresented:allowedcontenttypes:oncompletion:))
- [XcodeGen project specification](https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md)
