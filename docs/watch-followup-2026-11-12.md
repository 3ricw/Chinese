# Watch lookup and startup follow-up — November 12, 2026

Continues the published startup/Watch work from `99eb883a363a595180411d1e9cef3f707d47b150`. The current remote tree was fetched and all 157 source files verified before editing. No changes from an older temporary checkout were published.

## Reproduced issues and resulting behavior

| Trigger | Before | After |
| --- | --- | --- |
| The browser refuses a Watch favorite write. | The in-memory list changed and the button could say Saved, although the stored list was unchanged. | The list and button change only after a successful write. Failed adds/removals can be retried and retain the original saved list. |
| A query is typed and the page goes into the background during its debounce. | The pending search was canceled and did not resume, leaving results inconsistent with the text box. | Returning to a result list searches the current field immediately. A committed text-change event is also handled. No speech starts automatically. |
| Browser Back/Forward opens a word belonging to a different query or the Saved tab. | Word details could retain the newer page’s query, and Saved context was omitted from the word URL. | One route reader restores the URL’s query, filter, and originating list. In-page Back returns to those results. |
| The main-app record cannot be parsed, but the Watch record is healthy. | Both reads shared one catch block, so Watch favorites were not read. | The records load independently. The Watch page does not rewrite the main record. Invalid inherited palette names fall back safely. |
| A required stylesheet has no loaded sheet when the final module finishes. | Startup relied on the resource error event arriving first. | The final ready step also checks the required stylesheet links before committing state or exposing the UI. A missing sheet uses the existing recovery screen. |

Saved now has a search field of its own, with an explicit label and the unrelated course filter hidden. Search and Saved remember independent queries. Results still use six entries at a time and preserve the same 1,127-entry catalog, stable IDs, original examples, and both Chinese scripts. Native category browsing remains available without JavaScript.

The startup readiness check follows [MDN’s documented deferred-script and stylesheet ordering](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event). It inspects the sheet object without reading cross-origin rules. The standalone uses inline styles, so it has no external stylesheet dependency to check.

## Verification

`tests/watch-followup.cjs` adds 39 focused checks using input/visibility/history events, refused storage writes, recovery, independent records, and stylesheet readiness fixtures. The previous 670 startup/Watch checks and all learning, migration, note, backup, reward, handwriting, Scroll, navigation, and presentation suites pass.

The complete release passed 12,783 automated behavior checks. Static checks cover 12,219 generated views and 21,855 compiled handlers. All 22 full-app scripts parse; the standalone embeds the same scripts/styles in order and cold-boots at Home. Both compact-page scripts parse. The corpus and core learning/reward assets remain byte-identical to the previous release.

These are Node/DOM/storage/media mocks and static/source checks. There is still no supported browser-control route in this environment. Physical Apple Watch text entry, actual browser history/visibility behavior, device audio, and rendered layout remain device-test items. No new native Watch simulator build is claimed; the native source is unchanged.

See `tests/verification-watch-followup.json` for the package and suite record. Publishing retains all prior versioned assets and uses a fresh expected-head check.
