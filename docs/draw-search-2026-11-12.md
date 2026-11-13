# Draw-to-search and a smaller Home

Base: `1de0f74ae878fb29c35ed07e7c6300ddf8a637a0`. Existing storage keys, course IDs, recognition schedules, notes, rewards, and GitHub Pages origin remain intact.

## Behavior

Home now focuses on a single **resume/start chapter** action and direct **Scroll** access, with a compact companion and actual streak. Due reviews and an active catch-up plan no longer replace the chapter action. Review, catch-up, and help live inside one closed More section. Quests and games remain in Arcade; progress remains accessible through the navigation/Tools. This deliberately replaces the earlier fuller Home in response to the latest request.

Dictionary is first in Tools. The existing Review and common-word extensions append rather than prepend over it. Tools also offers direct drawing lookup and catch-up access. The ordinary Dictionary has a Draw to find a word button beside its search flow.

The Watch Search page offers **Draw a character** immediately below text input. Draw one form using ordinary stroke order, choose among the suggestions, and either search or draw another character to assemble a compound word. Search covers the app's existing word/character catalog; the recognition model covers more forms than that catalog, so some recognized forms have no dictionary entry here. Desktop/mobile drawing routes selected text into word-aware Quick Find.

Drawing supports pointer, touch, and mouse input, with Undo, Clear, cancel handling, candidate selection, character removal, and explicit Search. Canvas failure or model-load failure leaves text lookup available. Tiny-screen candidate grids use fewer columns. Nothing starts listening automatically.

## Recognition and privacy

The original geometric matcher compares normalized direction, length, position, sequence, and stroke count against 9,507 character descriptors. It yields between asynchronous scoring batches and cancels stale results after edits, close, or a new drawing. Suggestions are approximate candidates, never a writing correctness grade or confidence percentage. This is lookup, not a replacement for the app's checked stroke-order practice.

The descriptor data is the separately licensed Arphic Public License `mmah.json` from [HanziLookupJS](https://github.com/gugray/HanziLookupJS), ultimately derived from Make Me a Hanzi and Arphic fonts. The GPL recognizer and GPL `orig.json` are not bundled. Provenance and the full APL license are retained under `vendor/handwriting/`.

Hosted pages load the local recognizer and descriptors only on request. Drawings are not uploaded, persisted, or sent to an external service. Displayed suggestions/selected text use the existing lookup-assistance safeguards for pending learning answers. Lookup grants no XP, mastery, word knowledge, or course completion.

## Packaging and validation

Old versioned assets remain byte-identical. The hosted app has 23 external JavaScript modules plus its critical inline guard and 11 external stylesheets plus critical inline styles. Two optional versioned handwriting assets are loaded lazily. The standalone preview embeds those exact two assets immediately before the handwriting interface, so it has 26 scripts and can draw without fetching recognition files. The rest of the ordered scripts/styles reconstruct the deployment exactly.

**13,223 automated checks passed across 26 suites.** New coverage includes 71 recognition checks, 77 UI checks, 19 integration checks, and 76 minimal-Home checks. Nine manually drawn geometry fixtures put the intended form in the first three candidates; this is a small fixture result, not an accuracy percentage for users. Tests include malformed input, normalization, async yielding/cancellation, lazy load/retry, touch/pointer/mouse bounds, undo/clear, word assembly, assistance, unsupported canvas, no audio/progress credit, desktop/Watch search routing, Tools order, backup/reset/resume, and the existing learning regressions.

These are Node/DOM/canvas/media mocks and geometry fixtures. Supported real-browser control is unavailable. Actual Watch handwriting accuracy, text input, touch/scroll interaction, speed, iPhone/desktop layout, and device audio remain untested. Native iPhone/Watch sources are unchanged and were not rebuilt.
