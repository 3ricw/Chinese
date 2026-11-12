# Continuing Eric’s Chinese

Fetch `3ricw/Chinese`, branch `main`, before changing anything. Live origin: https://3ricw.github.io/Chinese/. Keep that origin so browser-local progress stays accessible. Use a current-head check when publishing; do not force-push. Remote main is the source of truth, not old temporary files or local commit ancestry.

## Current direction

Make learning Chinese easy, especially recognizing written forms when the sound is already familiar. Keep the app lively and glassy while making the next learning action obvious. Jade is the default; saved palettes including Ink/Black, appearance settings, ink transitions, reduced motion and solid fallbacks remain.

The November 11 clear-start update gives novices a small guided introduction, experienced learners full-chapter practice, and saved sessions/reviews priority. Home keeps its greeting, primary action, companion, Scroll, four real progress metrics, quests, and exactly three Quick games. Secondary practice and the calendar/picture cue are expandable. See `docs/clear-start-review.md` for research, rationale, and verification limits.

## Architecture and compatibility

- The app is deployed as `index.html`, `.nojekyll`, and ordered versioned assets. Read every active reference. Several older function definitions exist; edit the effective definition instead of appending another override.
- The effective Home is in `chinese-js-05`; the final UI observer, ink transition, and animation lifecycle are in `workbook-design.js`. The sound service is in `chinese-js-02`.
- Main storage: `hanzi-reading-room-v2`; rewards: `chinese1-boost-v1`. Preserve stable character keys and IDs. `state.courses` owns course-specific sessions; character recognition is shared. Course badges/lessons/trials are separately scoped.
- `state.readingDesk` and `state.commonWords` have pre-initialization capture/restore protection. Preserve it and their backup behavior.
- Character notes use `state.memoryNotes`; common-word notes use `state.commonWords.notes`. Tools has a searchable notebook. Assistance also marks paused sessions. Never let a stale editor rewrite an imported/reset profile.
- Chinese 1: 401 cards / 400 forms, Foundations–Lesson 10, 66 readings. Chinese 2: user-supplied workbook Lessons 11–15, 145 entries, ten original readings. Do not invent later textbook scope.
- Common words: 600 stable entries, original word visuals, five-word teaching plus recall, whole-word traditional conversion. Word knowledge does not automatically master component characters.
- Browsing, introductions, saving, revealing, picture hints, notes, and audio must not manufacture unassisted mastery. Familiarity depends on recall on separate days.
- Only the active companion gets new training XP. Preserve global/daily reward safeguards and collected companions. Companion taps must not shift the art stage or farm rewards.
- Mobile destinations remain Home / Course / Scroll / Arcade / Tools. Review is in Tools. Keep the single frame-based resizing controller, steady bottom edge, and usable tap targets.
- Writing is Draw / Type / Paper. Full-chapter practice remains accessible. Checked writing uses stroke geometry/order, not general OCR; speech recognition checks words, not reliable pronunciation or tones.
- `apple-watch/` is an iPhone/Watch developer preview. It supports manual five-card export/import, offline rounds, and native result summaries. It is not installed by visiting the website and does not sync results back into website mastery. No accounts/cloud sync exist.

## Verification and packaging

Run relevant suites in `tests/` using `tests/runtime.cjs`; these are DOM/media mocks, not real browser tests. `tests/home-start.cjs` covers the latest Home and feedback changes. `tests/check-html.py` inspects generated views. Full latest results: `tests/verification-clear-start.json`.

`python3 scripts/build-preview.py /absolute/output/Erics_Chinese_1_and_2_Preview.html` content-addresses active assets and embeds them in the same order. Retain previously published assets. Verify the standalone matches referenced scripts/styles exactly. A downloaded preview has separate browser storage; use backup export/import for a progress copy.

The preview's existing persistent file identity should be replaced when updating it, not duplicated. Current physical-device/browser limits are recorded in the review. Do not claim device testing or measured learning gains from mock checks.

Eric has authorized publishing tested updates to GitHub. Keep concise progress updates; make routine decisions without repeated permission questions. Prefer plain Markdown in conversation. A fresh chat can start with this file and the current repository.
