# Eric's Chinese — chapter practice and adventures

This update builds on upstream `main` commit `65b68cfdf04b553de1c1fa382a6232f3645a5929` and retains the existing GitHub Pages origin. Publishing is explicitly authorized for this update; use an expected-head check.


## Connected practice

A single Practice area connects chapter runs, original stories, shape challenges, writing tools, personal decks, skill records, and an optional companion camp. It is available from Home, each chapter, Tools, and Quick Find. The existing five mobile destinations, full Home, Scroll, six Arcade games, themes, companions, achievements and reading library remain available.

There are 16 original three-scene episodes (48 scenes, 48 comprehension decisions, 48 reply decisions), 59 vetted component puzzles, and 38 transformations. Episodes cover exactly Foundations, Lessons 1–10, and the confirmed Chinese 2 Lessons 11–15. Every Chinese form in the scenes and reply choices is introduced by its lesson. A word preview supplies pinyin/gloss/audio, since knowing constituent characters does not guarantee knowing a word. These are original activities, not textbook extracts or an added textbook lesson sequence.

### Thirty requested ideas and their implementation

| # | Idea | Where and behavior |
|---|---|---|
| 1 | Mixed chapter runs | Practice → Chapter run alternates sound/reading, parts, checked writing, context, and a story decision. |
| 2 | Component puzzles | Build a character from ordered clickable part tiles. |
| 3 | Lookalike duels | Duel prioritizes the existing confusable-character families. |
| 4 | Sound to character | Map pinyin and meaning to written forms; separate Listen & choose uses user-started audio. |
| 5 | Story missions | Three connected original scenes per lesson with comprehension decisions. |
| 6 | Cleaner practice screen | One focused exercise, persistent next action, contextual help, and visible full-chapter access. |
| 7 | Chapter encounters | A longer mixed run plus a concluding dialogue decision; does not bypass course badges or quizzes. |
| 8 | Real-world scenes | Message, menu, schedule, sign, and conversation formats drawn from the original episode content. |
| 9 | Mini comics | Three illustrated panels with original CSS people/scenery and the established companion artwork. |
| 10 | Dialogue missions | Chinese reply choices answer explicit situational goals. |
| 11 | Missing-character challenges | Complete original example sentences using context and meaning. |
| 12 | Character transformations | Vetted add/change-stroke challenges with explanations. |
| 13 | Component families | Explore recurring parts, then launch their construction puzzles. |
| 14 | On-demand dictation | Press Play and write, using live stroke checks. No automatic listening. |
| 15 | Font variety | Serif, sans, and Kai styles where installed; fonts use device fallbacks. |
| 16 | Homophone challenges | Distinguish same-reading characters through sentence meaning. |
| 17 | Adaptive practice | Recommend the lowest recorded independent skill and reinsert missed items. |
| 18 | Personal mistake album | Wrong/assisted answers and user-saved drawings, existing memory notes, and personal images. |
| 19 | Writing overlays | A translucent model guides spacing; no unsupported automatic freehand scoring. |
| 20 | Handwriting replay | Replay and scrub your strokes; an optional timer measures pace without rewarding speed. |
| 21 | Companion adventures | Camp vignettes open after completed runs, story practice, and week-spanning retention. |
| 22 | Companion abilities | Independent skills unlock named hints for each active companion; using them counts as help. |
| 23 | Custom habitats | Grove, pond, lantern hill, and toggled bamboo/lantern/stone decorations. |
| 24 | Weekly missions | Skill variety, independent checks, and practice on separate days. |
| 25 | Retention milestones | Three distinct recall days spanning a week unlock roots milestones. |
| 26 | Useful completion summaries | Independent/assisted results, skills practiced, missed items, and a reasoned next action. |
| 27 | Spoken Quick Find | Explicit mic button opens recognized text in editable Quick Find; unsupported/denied input has a typed fallback. |
| 28 | Personal decks | CSV/TSV/JSON import, browse, recall, export, and deletion; up to 10 decks of 100 words. |
| 29 | Skill maps | Recognition, writing, listening, shapes, words, and comprehension practice accuracy are separate. |
| 30 | Returning-learner mode | After a week away, offer four familiar items plus up to two difficult ones. |

### Progress, rewards, and compatibility

`state.learningLab` version 1 is integrated directly into the existing defaults and validator, rather than captured and re-added by a render override. A one-time untouched raw pre-update snapshot uses `hanzi-reading-room-v2-before-practice-v1`. Existing character keys, word records, courses, bookmarks, memory notes, reading positions, both legacy course resumes, companions and settings remain intact. Each course has its own additional saved chapter run; reopening starts at Home, with an appropriate resume action.

Choice, story, construction, browsing, previews, and saving drawings never mark a character mastered. Checked independent character writing uses delayed review stages. A rejected stroke, hint, lookup, model, same-run answer exposure, or missed-item repetition is helped practice. Personal compound-word practice never schedules its component characters as mastered. The traditional shape puzzles are filtered when converting a source, target, or part would invalidate the construction.

New independent activities award at most 120 learner XP and 20 stamps per day. A stable skill/item credit prevents repeat rewards across runs, decks, scripts, or companion switches. Deck credits use canonical word forms, not newly generated deck IDs. Companion XP still goes through the existing global daily credits and only the active companion receives it. Hints, repeated copies, browsing, cosmetic selection, and camp taps do not farm XP. Weekly claims and purchases are idempotent. Existing earned course badges/challenges remain course-owned and retain their original requirements.

Backups include the new state and all existing extensions; the import limit is now 8 MB to accommodate personal content. Images are converted to compact raster data with a total budget, drawing storage is bounded, and malformed extension rows sanitize without discarding the main learning state. Reset clears learning/rewards while retaining the established companion collection/preferences behavior plus personal deck and image content. Undo restores the new skill records alongside existing recognition/writing/reward changes.


Full-chapter practice is now the chapter page's primary action. A separate **Write to answer** action prompts with pinyin and meaning, hides the character, and unlocks Correct only after a live Hanzi Writer check. The checker validates expected stroke geometry, direction, and order; it is not general freehand OCR. Rejected strokes and model lookups count as help. Offline failures offer retry or an honest skip and cannot grant credit. Simplified/traditional targets follow the existing preference.

Drawing supports E for the next copy (keeping three recent previews), Z to undo a stroke, and Backspace to clear. One shared pointer handler supports coalesced stylus points, ignores secondary touches, and rejects events from old pads. In checked writing, Backspace restarts; 1/3/5-copy drills clear automatically between copies and word characters. Extra copies award no extra XP and count as helped repetition. Writing useful words does not manufacture recognition of every component character. New character writing and full-chapter recall use the delayed-review memory stages.

The new service is called directly from existing effective renderers, scoring gates, resume validation, and keyboard dispatch. It adds no new function override chain or storage key. Runtime-only proof blocks stale completions, forged saved success flags, rapid double answers, and callback reuse across cards/courses. An interrupted current checked answer must be written again. Other progress and both course session slots are retained.

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

Automated verification covers all chapter activities in both courses and scripts, feedback/completion views, original content structure and introduced-form coverage, migration/idempotence, actual backup handlers, separate course sessions, word/character separation, delayed writing recall, keyboard controls, duplicate/stale callbacks, microphone lifecycle mocks, active-only companion XP, daily caps, reimport farming, weekly claims, cosmetics, malformed data, and reset. The generated-view checker validates nesting, duplicate IDs, internal-ID leaks, and undefined text; every distinct inline handler is syntax compiled. The standalone export must match referenced script/style content and order exactly.

These are deterministic Node/DOM/media mocks and static HTML checks. They do not establish real browser layout, iPhone overflow, recognition geometry, stylus feel, microphone permissions, or installed speech voice quality. The supported browser QA route is unavailable in this environment. Handwriting checks use pinned Hanzi Writer geometry/order matching, not general OCR. Speech recognition supplies words, not phonetic/tone grades. All actual audio/microphone actions remain user initiated.

Run `node tests/practice.cjs`, `node tests/practice-feedback.cjs`, `node tests/shape-content.cjs`, `node tests/handwriting.cjs`, `node tests/regression.cjs`, `node tests/import-and-pools.cjs`, `node tests/views.cjs`, then `python3 tests/check-html.py`. These use deterministic DOM/media mocks, not a real browser. They exercise migration, switching, resumes, real backup handlers, shared knowledge, course-local results, assisted answers, Scroll continuity, active-companion XP, replay safeguards, scripts, keyboard handlers, writing defaults and reset. The view check inspects generated HTML for nesting, duplicate IDs, broken text and leaked internal lesson IDs.

Real browser layout, mobile overflow, actual device speech voices, microphone permissions and fetched stroke-order data still require device testing. The current environment did not expose the supported browser QA route. No claim of real iPhone or browser testing is made.

Build the standalone file with `python3 scripts/build-preview.py /absolute/path/Erics_Chinese_1_and_2_Preview.html`. It embeds the exact tested CSS and JavaScript in the same order as `index.html`. Optional web fonts and existing stroke-order data services may still require a network connection. Downloaded HTML uses browser-local storage separate from the hosted GitHub Pages origin; use Export/Import Backup to try a copy of your progress.

For a future approved publication, fetch `main` again, reconcile any changes, and use an expected-head update. Do not force-push. Keep the existing GitHub Pages origin unchanged.
