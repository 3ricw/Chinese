# Eric's Chinese — Chinese 2 review build

Review build based on upstream `main` commit `4d32cc4dff377846c580e996f4f288c53f99abf5`. This build has not been published.

Chinese 1 retains its 401 cards (400 distinct forms), 66 passages, legacy IDs, companions, games and shared collection of 600 common words. Chinese 2 covers the user-confirmed Lessons 11–15 from the supplied fourth-edition character workbook extract: 145 entries, including 144 forms not in Chinese 1. The extract ends at printed page 46. Lessons 16–20 are outside this build's scope.

The new course includes original visual cues, 131 distinct word examples mapped to all 145 entries, separate word and sentence audio, ten original readings with thirty quiz questions, connected usage notes, five lesson badges, four specialist trials and a Champion challenge. New reading text uses only Chinese 1 characters plus characters introduced through its Chinese 2 lesson. Learning a word does not grant recognition of its component characters.

## Course model and migration

The ordered `course-core` service loads before the main app. It provides a course registry and explicit selectors; it does not wrap or replace the app's effective functions. The existing functions call these services directly. The Chinese 2 content asset also loads before the original state validator, so new records cannot be dropped during startup.

- Keep `hanzi-reading-room-v2` and `chinese1-boost-v1` unchanged.
- Keep character records, bookmarks, notes, writing, preferences, companions and daily reward limits shared.
- Preserve all Chinese 1 lesson and reading IDs. Chinese 2 lessons use `c2-11` through `c2-15`; its reading IDs use the same prefix. Chapter quizzes are keyed by those IDs. Badge/trial results remain keyed by league (`chinese-1` or `chinese-2`).
- `state.courses` version 1 holds the selected course and each course's last lesson, feed, Scroll session and saved practice session. The legacy top-level fields remain the active course's projection for compatibility. Save synchronizes that projection; switch checkpoints the old session and restores the destination.
- Legacy imports are assigned to Chinese 1. A pre-courses raw snapshot is retained once at `hanzi-reading-room-v2-before-courses-v1`. It is a recovery copy, not a new active storage key.
- Recognition remains keyed by the original simplified character. For example, a familiar 片 is already recognized in Chinese 2; its Chinese 2 usage is 药片. Shared recognition alone cannot pass a course's quiz or reading requirements.
- Reading Desk and Common Words retain their bootstrap capture/restore protection and are still included in backup validation. Backups now include both course session slots. Reset clears both courses while retaining the established profile, preferences and companion collection behavior.
- Whole-word traditional conversion handles 关系→關係 and 联系→聯繫 independently.

Theme registration now precedes validation. Jade/Dark is the default for a fresh profile; saved Sage, Black, System, Light and other choices are respected. Home sections, companion artwork, five mobile navigation destinations, the frame-based glass-bar controller and the 900px companion collection width are retained. The course's primary next action precedes the shared common-word entry.

## Verification

Final review checks passed: 141 behavior assertions, 1,418 generated HTML views, 4,267 inline handler syntax checks, and syntax checks for all nine referenced JavaScript assets. The standalone preview was checked against all fifteen referenced assets for exact content and order, then booted and opened in Chinese 2 with the same mock runtime. Upstream main was rechecked before delivery and still matched the base commit above.

Run `node tests/regression.cjs`, `node tests/import-and-pools.cjs`, `node tests/views.cjs`, then `python3 tests/check-html.py`. These use deterministic DOM/media mocks, not a real browser. They exercise migration, switching, resumes, real backup handlers, shared knowledge, course-local results, assisted answers, Scroll continuity, active-companion XP, replay safeguards, scripts, keyboard handlers, writing defaults and reset. The view check inspects generated HTML for nesting, duplicate IDs, broken text and leaked internal lesson IDs.

Real browser layout, mobile overflow, actual device speech voices, microphone permissions and fetched stroke-order data still require device testing. The current environment did not expose the supported browser QA route. No claim of real iPhone or browser testing is made.

Build the standalone file with `python3 scripts/build-preview.py /absolute/path/Erics_Chinese_1_and_2_Preview.html`. It embeds the exact tested CSS and JavaScript in the same order as `index.html`. Optional web fonts and existing stroke-order data services may still require a network connection. Downloaded HTML uses browser-local storage separate from the hosted GitHub Pages origin; use Export/Import Backup to try a copy of your progress.

For a future approved publication, fetch `main` again, reconcile any changes, and use an expected-head update. Do not force-push. Keep the existing GitHub Pages origin unchanged.
