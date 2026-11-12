# Reliable startup and Watch word lookup — November 11, 2026

Based on `main` commit `10f94c0ab51452ab2fa9a3cf483cfb868f2f4e38`. All 140 published files matched the checkout before editing. The supplied recording and screenshot were inspected. They are not published with the code.

## Startup findings

`index.html` displayed a file-viewer reference while waiting for scripting. The large legacy app set `body.app-ready` before the later Home, common-word, notes, and workbook modules had finished. That exposed an intermediate Home and typography before the final UI replaced them. An external Google font stylesheet also sat in the startup path, although the current design uses system UI fonts.

A small inline startup guard now runs before stylesheets. It uses the saved appearance for a neutral opening screen, respects reduced motion, and keeps the shell, navigation, and modal layer covered until the final presentation module completes. The 21 existing asset modules retain their execution order and now load with `defer`. The file-viewer reference is inside `noscript`, and the unused external font request is removed. The ink transition remains unchanged.

Missing app scripts/styles and startup exceptions keep the incomplete interface covered and show a retry action. A slow connection gets a patient recovery message without declaring failure. Retry refreshes the document while keeping the origin and browser data. The screen also links to the smaller word lookup.

Failure tests uncovered an existing data risk: legacy initialization can call `save()` before the optional common-word and reading extensions restore. Main-state writes now wait until final initialization has completed. The final ready step saves the fully restored state before revealing the interface. Failed startup leaves the original main storage bytes intact. Resource-failure tests skip the common-word, reward UI, and final design modules, then verify that a successful retry retains word schedules, personal notes, and saved readings. No active storage keys or IDs are renamed.

## Apple Watch browser support

Direct URL: https://3ricw.github.io/Chinese/watch/

This is a separate compact browser dictionary generated from existing app content. It contains 1,127 distinct word/character entries covering all 600 common-word records plus course vocabulary and characters. Shared forms are merged for browsing while retaining their course and topic memberships. Whole-word traditional forms, original examples, usage notes, and stable common-word IDs are retained.

Search comes first and accepts either Chinese script, English, or pinyin, including marked tones, numbered pinyin, `v`, and `u:`. Results show six entries at a time. Three large navigation choices provide Search, Saved, and Browse; course/topic filters and a clear Back action retain the search context. Browser history restores the selected chapter. Saved words and script choice use a small bounded local record. Initial common-word saves can be copied from the full app when both pages share the same browser storage. Subsequent Watch saves do not rewrite full-app progress.

Word details offer separate word/sentence audio only where the browser exposes speech synthesis. Audio starts only on a deliberate button press. Dictionary use grants no XP or mastery. A bounded exposure ledger marks matching paused full-app answers as helped in the same browser, including after reopening. The Watch page never writes the main progress object or reward key. There is no cross-device synchronization.

The root app routes explicit `?watch=1`, Watch user agents, and very small touch viewports to the compact page; `?full=1` opens the full app. The direct URL works without relying on device detection. A separate static topic dictionary uses native disclosures and anchors for viewers without JavaScript. The native iPhone/Watch developer preview and five-card export remain available in Tools → Apple Watch.

[Apple’s current Mail guide](https://support.apple.com/en-gb/guide/watch/apddca457a4f/26/watchos/26) documents opening website links in Watch Mail. [Apple’s Watch guide](https://help.apple.com/pdf/watch/8/en_US/apple-watch-user-guide-watchos8.pdf) also documents web links in Messages. Web viewing varies by viewer and device; this does not create an App Store installation or guarantee every Watch browser feature.

## Verification and limits

`tests/startup-watch-browser.cjs` adds 670 checks: startup timing and recovery, saved appearance, device routing, actual fresh-user setup, interrupted extension restoration, dictionary coverage and filters, whole-word traditional forms, saved-word persistence, stale actions, lookup assistance, Back/history, no automatic audio, and no full-app data writes from the dictionary.

The complete release passed 12,744 automated behavior checks and structural checks across 12,217 generated views, with 21,849 compiled inline handlers. Root packaging has 22 scripts (21 external modules plus the critical inline guard), nine external stylesheets plus critical inline CSS. The standalone embeds the tested assets in the same order and cold-boots successfully. Both Watch scripts parse, and the static browsing page has unique anchors and no JavaScript dependency.

These are deterministic Node/DOM/media mocks, simulated resource failures, and static structure/source checks. A supported browser-control route is unavailable here. Real desktop/iPhone startup, Apple Watch text entry, layout, browser history behavior, and device audio still need physical-device testing. The supplied recording was observed; that is distinct from testing the updated app on that device. Native app source is unchanged and its previous simulator builds were not rerun for this update.

Regenerate compact content using `node scripts/build-watch.cjs`. It reads current app data and versions the Watch assets. Run the tests, then `python3 scripts/build-preview.py /absolute/preview.html` for the full-app standalone. The preview builder synchronizes the inline guard with `scripts/startup.js` and `scripts/startup.css`.
