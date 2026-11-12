# Automatic Watch browser entry

Opening https://3ricw.github.io/Chinese/ at Watch-sized dimensions now opens `/Chinese/watch/` on Search. The earlier condition could miss a Watch because it required both a very narrow viewport and a coarse-pointer media query. The app also lacked watchOS viewport opt-in metadata.

## Change

- Main app, Watch Search, and generated static Browse declare `<meta name="disabled-adaptations" content="watch">` alongside `width=device-width,initial-scale=1`, before any script. This opts out of watchOS's wider default layout and shrink-to-fit adaptation.
- Root startup checks positive viewport **or screen** dimensions up to **260×520 CSS pixels**, without requiring touch-pointer detection. This also handles a wider layout viewport when screen dimensions identify a small display. Hardware/Retina pixel dimensions are not used.
- Automatic entry goes to Search even if Watch favorites exist or the incoming root link contains an unrelated detail/list parameter. An explicit `q` is preserved, limited to 80 characters. Routing uses `location.replace`, retaining the same origin and avoiding an extra root entry in Back history.
- Existing Watch user-agent and `?watch=1` routes remain. `?full=1` overrides every automatic route; the Watch Options section still provides Open full app. Downloaded `file:` previews do not redirect.
- All 21 external main-app scripts, nine external stylesheets, Watch catalog, Watch UI scripts/styles, curriculum IDs, learning state, notes, and rewards are byte-identical to the base release. No persistence migration is required.

## Basis

Apple's [Designing Web Content for watchOS slides](https://devstreaming-cdn.apple.com/videos/wwdc/2018/239oqke16leldnu3010/239/239_designing_web_content_for_watchos.pdf) describe the Watch adaptation and opt-out metadata. The [current WebKit viewport implementation](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/ViewportConfiguration.cpp) still has a 320-pixel Watch device-width override and disables that behavior for the Watch adaptation opt-out. The app's dimension threshold is a practical routing rule, not proof of device identity.

## Validation and limits

`node tests/watch-auto-route.cjs` adds 34 checks for multiple small viewport sizes, pointer/media-query absence, wider layout with small screen, dimensions at and beyond the boundaries, phone/desktop and phone-keyboard cases, explicit overrides, local previews, query preservation, no progress writes, metadata placement, published/source equality, and Search as the initial Watch view.

Together with `startup-watch-browser`, `watch-followup`, `regression`, `import-and-pools`, `notes-backup`, and `home-start`, **991 behavioral checks passed**. These are Node VM/DOM/storage fixtures, not browser/device tests. The full app's 22 scripts pass syntax checks; the standalone HTML reconstructs the ordered deployment scripts/styles exactly and cold-boots to Home in the existing mock runtime. Existing generated-view fixtures and current Watch entry documents also pass structural/handler compilation checks.

No supported real-browser control is available here. Actual Watch Mail/Messages web-view detection, layout, keyboard/dictation, and navigation still need physical-device testing. The native iPhone/Watch sources are unchanged and were not rebuilt for this update.
