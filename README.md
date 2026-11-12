# Eric’s Chinese — courses, memory aids, and Watch preview

The existing Chinese learning app at https://3ricw.github.io/Chinese/. The latest update builds on `main` commit `d2a91381337c7e0c53c7df565dd1c31ab4833097` and preserves the GitHub Pages origin and browser-local progress.

## Catch-up learning and clearer Home (2026-11-12)

Home → **Catch up on chapters** builds a recognition plan across Chinese 1 and 2, including missed Lessons 2–12 while class is on Lesson 13. Short sets mix due reviews with at most five new shapes using established guided learning and recall. Coverage and recall on later days are shown separately. Quizzes, words, readings, writing, and badges stay with their courses; shared character knowledge carries forward.

Home puts one task first, joins metrics, and collapses the guide while retaining companion, Scroll, quests, and three Quick games. Theme-aware glass styling and spacing clarify the hierarchy. Everyday controls share quiet sounds; grading, speech, mute, and milestones retain guarded feedback.

[Review and limitations](docs/catchup-focus-2026-11-12.md) · [Verification](tests/verification-catchup-focus.json). **13,040 automated checks passed**. Actual browser/device appearance and audio testing remain outstanding.

## Automatic Watch browser entry (2026-11-12)

Opening the normal app URL at Watch-sized dimensions now routes directly to word Search without requiring a touch-pointer signal or Watch-specific user agent. Native Watch viewport metadata avoids watchOS's wider shrink-to-fit layout; the same metadata is present on Search and the static topic dictionary. A small screen can also be detected when its browser reports a wider layout viewport. Phone/desktop entry, the explicit `?watch=1` link, and the `?full=1` bypass remain available.

[Review](docs/watch-auto-route-2026-11-12.md) · [Focused verification](tests/verification-watch-auto-route.json). All 991 checks rerun for this update passed, including 34 new routing checks. Real Watch browser verification remains outstanding.

## Watch search and save reliability (2026-11-12)

Saved words now have their own search field. Searches resume correctly when the page returns from the background, and word links/Back restore the correct query and list. Favorites change only after a successful browser write, so a failed save or removal cannot display a false Saved state. A healthy Watch saved list also loads independently of an unreadable main-app record.

Final startup additionally verifies that required stylesheets are available before saving state and revealing the interface. The existing recovery screen handles failure. The dictionary, course IDs, learning rules, theme effects, and reward safeguards are unchanged.

[Review](docs/watch-followup-2026-11-12.md) · [Verification](tests/verification-watch-followup.json). The release passed 12,783 automated behavior checks. Real browser and physical-device verification remains outstanding.

## Stable startup and Watch browser word search (2026-11-11)

The full app stays covered until every required module has finished. The old file-preview reference appears only without JavaScript; an early inline guard provides saved-theme loading and recovery for slow or failed requests. Main progress is written only after extensions have restored, so an interrupted startup cannot overwrite common-word records or notes. The existing module order, Pages origin, and saved progress keys remain.

[Watch word lookup](https://3ricw.github.io/Chinese/watch/) puts search first across 1,127 word/character entries. Search Chinese, English, or pinyin; filter courses/topics; save words; and return to the previous list. A static topic dictionary supports viewers without JavaScript. This browser view is available alongside the existing native Watch development preview. Dictionary browsing grants no mastery or XP; same-browser lookup assistance carries into paused full-app practice.

[Review and limits](docs/startup-watch-browser-review.md) · [Verification](tests/verification-startup-watch-browser.json). The release passed 12,744 behavior checks and structure checks across 12,217 views. Updated browser/device appearance, text entry, and audio remain untested on actual devices.

## Clear starting steps and responsive feedback (2026-11-11)

Home now starts new learners with the existing small guided introduction, explains the learning loop, and clearly separates optional quests/games. Established learners keep full-chapter priority; saved practice and due review still come first. The calendar and picture cue are expandable, and full chapter remains available from Home’s additional practice options. The compact glass hero, progress strip, companion, and five mobile destinations remain.

Desktop navigation has one cancelable traveling glass highlight. Original quiet UI ticks respect mute, spoken Chinese, and completion sounds; pending audio cannot play after cancellation or profile replacement. Motion uses the existing lifecycle and respects accessibility settings. No storage keys or learning/reward rules change.

[Design/research review](docs/clear-start-review.md) · [Continue development here](docs/CONTINUE-HERE.md) · [Verification record](tests/verification-clear-start.json). The update passed 12,074 behavior checks and structural checks across 12,210 generated views. These are automated mocks and source checks; actual browser/iPhone visual and audio testing remains outstanding.

## Memory notes, word visuals, and Apple Watch (2026-11-11)

Character notes are visible in Usage and Shape & memory. Common words have their own personal notes, and Tools includes a searchable shared notebook. Existing `state.memoryNotes` keys are retained; optional `state.commonWords.notes` records use the unchanged word IDs. Both note types round-trip through backups and follow the existing reset confirmation. Looking at notes or picture hints before answering records help, including paused practice.

All 600 common-word entries now have individually assigned original SVG memory cues: pictures for concrete concepts and diagrams for grammatical or abstract meanings. They appear during teaching and after reveal; cold recall stays plain unless the learner deliberately requests a picture hint (`V`). These are memory aids, not etymologies or 600 unique paintings. Course word details also offer matching cues or clickable character-shape compositions. The visual-memory preference is respected.

Tools → Apple Watch exports a five-card practice copy from the selected course’s studied characters, studied common words, or saved words. See [the native development preview](apple-watch/README.md) for iPhone/Watch source, build instructions, install limitations, and the explicit file-transfer workflow. Native Watch results stay separate from website mastery, XP, streaks, and companion rewards. No accounts or cloud synchronization have been added.

New checks: `node tests/notes-watch-visuals.cjs`, `node tests/notes-backup.cjs`, then `python3 tests/word-visual-raster.py`. The [Mac build workflow](.github/workflows/watch-checks.yml) tests the Swift model and compiles both native simulator targets. Browser mock tests, vector rasterization, simulator compilation, and physical-device testing are distinct.

## November 10 glass study desk and liquid ink

The attached dashboard video's composition now applies to the app's shared presentation: frosted sidebar and Quick Find, a feature/companion card beside a compact practice calendar, four actual progress cards, soft theme-colored atmosphere, illuminated edges and consistent rounded surfaces. Course, Review, Tools, Arcade, settings, reading, practice and study sheets share the same material. Streak, learner level, daily checks and due reviews use existing data. The companion's ring shows daily checks. Home keeps its primary next action, Scroll, quests, three Quick games and all existing paths. On phones, progress cards use two columns. Jade and all saved palettes, including Ink, remain compatible; solid surfaces and reduced motion remain available through the existing preferences and system fallbacks.

The ink transition restores a detailed folded boundary with wisps and veins. Thirteen compatible compound-path keyframes run for 1,000ms using the existing native snapshot lifecycle. The browser interpolates the geometry; JavaScript does not repaint it each frame. Empty/full mask endpoints, rapid toggles, failed/unsupported animation and saved settings are checked. Cleanup still waits for the native transition to finish, preserving the previous end-flash fix.

[The review](docs/glass-ink-review-2026-11-10.md) records the reference adaptation, implementation and verification limits. `tests/glass-ui.cjs` and optional `tests/ink-geometry.py` add material/data, vector-topology and actual raster-mask regressions. `tests/verification-2026-11-10-glass.json` records the release checks. The supported browser route remains unavailable; no actual browser or iPhone visual/audio/stylus testing is claimed. The 19-script / nine-stylesheet order and exact standalone reconstruction are retained. Learning engines, storage, course IDs, schedules and rewards are unchanged.

## November 10 visual studio

The newly supplied dashboard recording informs Home's aligned two-column composition: a colored next-action card and companion, attached daily status, and a quieter glass panel with actual seven-day activity and a course-relevant visual cue. Small screens stack the panels and condense the cue. The personalized greeting, direct Scroll action, streak/level/goal strip, quests, exactly three Quick games, Arcade access and secondary practice disclosure remain. All nine palettes, including Jade and Black, retain their saved IDs and preferences. Glass has solid high-contrast/reduced-transparency fallbacks.

The supplied Chineasy screenshots inform a picture → plain form → recall learning pattern. There are 59 original, code-native SVG picture cues, covering all 50 Foundations forms plus nine later characters. They use existing canonical records and render the actual simplified/traditional glyph. The shared Visual library is accessible from Home, Tools, chapter shape practice and Quick Find. Categories expand twelve cues at a time; Back preserves the category, and keyboard focus follows filtering and expansion. Pictures are modern mnemonics, explicitly distinguished from historical origins. No third-party artwork, screenshot text or curriculum is copied.

Picture cues accompany the existing clickable component diagram and personal memory notes in Shape & memory. Introductions and Scroll meet frames offer **Character alone**; unanswered recall, read/find frames and structural puzzles retain their original prompts. The visual-memory setting prevents automatic additions. Explicit picture lookup marks active character, quiz, writing, chapter and Scroll answers as assisted. Browsing, toggling and rendering grant no knowledge or rewards and add no storage keys. The existing single decoration observer is reused; picture insertion is idempotent.

The theme reveal now lasts 640 ms with a gentler low-frequency ink contour and smoother easing. The reveal stays filled until the browser finishes removing the native transition snapshots. Persistent pseudo-element rules suppress a second default cross-fade; rapid clicks, animation failures, reduced motion and later saved preference changes retain their guarded fallbacks. This fixes the lifecycle responsible for the reported end flash; perceptual smoothness still requires device testing.

`tests/visual-memory.cjs` covers glyphs in both scripts, all Foundations coverage, real category/pagination/Back behavior, keyboard focus, stale callbacks, observer idempotence, plain recall, assistance and unchanged browsing credit. The theme tests distinguish the animation's finish from the native transition's finish. The full regression suite and generated-view checks are recorded in `tests/verification-2026-11-10-visual.json`. Eight original SVGs were rasterized and visually inspected; this was illustration review, not browser UI testing. The future Playwright suite was updated and syntax checked but not run: supported browser control is unavailable in this environment.

The deployment now contains 19 ordered JavaScript assets and nine stylesheets. The new picture helper loads immediately before the existing workbook presentation module; the order of all previous scripts is retained. Curriculum, persistence validators, course migration, handwriting checks, review scheduling and reward engines are unchanged. The standalone export reconstructs the referenced assets exactly in deployment order.

## November 10 alignment, motion, and study flow

Tools now shares a full 900px content width across its heading, search, grouped list, and footer. Rows use one icon/text/chevron grid, descriptions use the available width, and old mobile absolute positioning is cleared. Arcade uses the same page width, responsive equal card columns, smaller glyph tiles, consistent Play positions, and a full-width quest section below the games. Existing activities, filters, effects, and rewards remain available.

The theme button adapts the attached recording's light/dark ink reveal using native browser snapshots and an original rippled edge. It applies the selected preference once, guards rapid clicks and stale callbacks, cleans up animations, and switches immediately for reduced motion or unsupported APIs. The bounded animation lasts 380 ms; this is not a claim about measured device latency. Saved palettes and system/light/dark preferences remain compatible.

Quick Find now has five result scopes, keyboard selection with Arrow keys/Enter, result feedback, a reset, and course-aware reading suggestions. Chinese forms, pinyin, English, shared common words, and activities remain searchable. Marked ü, v, and u: are equivalent in word search while u remains distinct. The original assistance accounting still runs before lookup. Optional setup shows its two existing steps; completion highlights actual finished steps and independent/helped results, offers retry or Done for now, and keeps the suggested next activity collapsed. Neither browsing nor a completion animation adds learning credit.

[The design review](docs/design-review-2026-11-10.md) records all ten requested reference sites, the video adaptation, and how the requested UX principles were applied. `tests/study-flow.cjs` adds interaction and deferred-animation regressions. `tests/verification-2026-11-10.json` records automated results and their limits. Real browser/iPhone visual, animation, audio, microphone, and stylus testing remain unverified because supported browser control is unavailable in this environment.

## November 8 grouping and component cues

Combines the reviewed workbook redesign with the supplied `claude2.zip` Gestalt version. The upload retains all 27 published assets and appends a small color/spacing layer. Its useful changes are integrated into the existing design assets, preserving the 18-script / 9-stylesheet execution order and avoiding a second decoration observer. The previous post-render Home replacement is removed: the effective Home renderer now produces its complete hierarchy directly.

Home puts one next action and the interactive companion above an attached streak/level/goal strip. Quests and all three Quick games share a second surface. Scroll remains directly available; stories, shapes, writing, Review, weekly missions, and the skill map sit in a native, keyboard-accessible **More ways to practice** disclosure. Progress and save status stay visible. Consistent spacing and fewer nested card surfaces distinguish the groups without removing those learning paths. Fuller Home content, the glass navigation controller, theme/mute controls, Back, and course selection remain intact.

The linked [Gestalt design article](https://www.merveilleux.design/en/blog/article/gestalt-psychology-laws) informed proximity, similarity, common-region grouping, and sheet/background separation. Labels and generic badges are quieter; pinyin uses the complementary theme color. Sheet blur retains reduced-transparency and increased-contrast fallbacks, and disclosure motion respects both the system and app settings. These are design decisions, not evidence of measured learning or retention gains.

Twelve explicit component-form groups now use consistent colors in visual-memory diagrams, labeled keys, and introductions, including simplified/traditional variants such as 讠/訁, 钅/釒, and 纟/糹. Existing Chinese forms, part names, accessible labels, and clickable lookups remain available without relying on color. Ambiguous forms such as 月 and 阝 stay neutral; unrelated forms are not bundled into broad semantic families. A short explanation distinguishes a visual association from the component's role in a particular character. Decoration does not alter knowledge, schedules, or reward records.

Only the effective Home markup and the two presentation assets change. All other 24 previously referenced assets remain byte-identical, including curriculum, learning/scoring functions, storage validators, handwriting checks, and course migration. `tests/workbook-design.cjs` now covers both courses' Home hierarchy, native disclosure markup, form equivalence, neutral ambiguous shapes, reused-node updates, idempotent notes, and unchanged progress/rewards. Numeric contrast checks cover pinyin and component tokens across every palette and both appearances. The complete automated suite and exact standalone reconstruction are recorded in `tests/verification-2026-11-08-grouping.json`. The updated Playwright suite is included but was not run; supported managed browser control is unavailable, so actual mobile layout, keyboard focus rendering, device audio, and stylus behavior remain unverified.


## November 8 workbook redesign review

Integrates the supplied Claude redesign as ordered versioned presentation assets. All 25 existing CSS/JavaScript assets remain byte-for-byte unchanged: the learning engine, curriculum, validators, progress keys, backups, and reward rules retain their tested implementations. The redesign adds nine coordinated pigment palettes, tinted dark surfaces, grouped Tools rows, a course segment control, large-to-small title behavior, and a workbook square for single Chinese forms. Existing palette IDs, including Black, remain stable; saved light/dark/system choices are respected. It adds visual polish and clearer organization, without adding curriculum or a new learning algorithm.

Review fixes preserve the established fuller Home and restore its visible quests and three quick games. Theme/mute controls and Back remain accessible. Course selection stays available on browsing pages and hidden during active practice. Navigation padding/height again follow the existing single frame easing controller. Correct/incorrect answer cues now win over neutral/dark fill rules. Reduced-transparency, increased-contrast, and the in-app motion preference override the new effects correctly. Mobile tabs and modal close controls keep 44px hit areas; workbook guides have a width limit. A stale title observer cannot alter a new page, and decoration scans are limited to live content and the open sheet.

`tests/workbook-design.cjs` checks these behaviors with DOM/observer fixtures, numeric contrast checks for all nine palettes in both appearances, and targeted stylesheet cascade checks. The original uploaded redesign fails 17 of those assertions; the reviewed version passes. That is a set of repeated assertions across several regressions, not 17 separate defects. `tests/browser-redesign.py` retains and adapts the supplied Playwright suite for future browser QA, including restored Home/control expectations and parsing of modern CSS colors. It was **not run** here: the supported managed browser route is unavailable. No real browser, iPhone, stylus, microphone, or rendered-pixel contrast verification is claimed.

## November 6 interface and learning update

Home, Course, Tools, Reading, Writing, and Practice now share a 900px content width, a common heading/control scale, and consistent spacing. The full Home remains: greeting, next action, companion, Scroll, daily status, quests, and three games. The established themes, palette preferences, effects, glass navigation controller, and companion artwork remain intact. Full chapter practice is the main character-learning action on Home, Course, and the Practice hub. Guided small sets remain available from the chapter options.

The Practice hub uses a clear chapter launch followed by three focused paths. Extra activities and camp customization are collapsed; stories give scene-specific explanations and quote the relevant Chinese evidence. Construction puzzles show enclosed parts inside the outer part, allow partial undo/reset, and display the assembled character after grading. Transformations reveal their final shape. Completion offers a direct retry of missed items, which remains helped practice. Adaptive suggestions check that an activity has material in the current course, chapter, and script. The fixed practice footer contains the answer/continue action, including typed reading checks.

Personal decks support single-word entry, editing, renaming, and removal as well as bulk import/export. Legacy `w0`/`w1` IDs are preserved; deleting a word never shifts remaining IDs. Edits keep the word ID and reset only that word's checks if its Chinese, reading, or meaning changes. Every new word gets a distinct stable ID. New validated fields `learningLab.deckWords` and `learningLab.wordSeen` stay inside the existing state and backup format. Old deck choice statistics do not manufacture typed-recall familiarity.

**Read & type** shows the written word and asks for its pinyin, without answer choices. Tones and spacing are optional; ü/v/u: are equivalent, while u stays distinct. Slash-separated readings are supported. This checks reading recall, not pronunciation or tones. Familiar requires unassisted typed recall on at least two separate days. Misses return a word to Learning; scheduled reviews lengthen after independent checks. Browsing or seeing feedback counts as help for 15 minutes; hints and immediate retries cannot advance familiarity. Meaning choices remain available and never grant word familiarity. Neither mode changes individual-character knowledge. Same-word credits continue to prevent reward farming across decks, scripts, and companion switches.

The 30-feature set below is preserved and refined rather than replaced. No curriculum scope, hosted origin, legacy character/storage key, course achievement, theme preference, or companion reward rule is renamed by this update. The linked Instagram reel has not been viewable in this environment; no advice from it is claimed.

## Connected practice

A single Practice area connects chapter runs, original stories, shape challenges, writing tools, personal decks, skill records, and an optional companion camp. It is available from Home, each chapter, Tools, and Quick Find. The existing five mobile destinations, full Home, Scroll, six Arcade games, themes, companions, achievements and reading library remain available.

There are 16 original three-scene episodes (48 scenes, 48 comprehension decisions, 48 reply decisions), 59 vetted component puzzles, and 38 transformations. Episodes cover exactly Foundations, Lessons 1–10, and the confirmed Chinese 2 Lessons 11–15. Every Chinese form in the scenes and reply choices is introduced by its lesson. A word preview supplies pinyin/gloss/audio, since knowing constituent characters does not guarantee knowing a word. These are original activities, not textbook extracts or an added textbook lesson sequence.

### Thirty requested ideas and their implementation

| # | Idea | Where and behavior |
|---|---|---|
| 1 | Mixed chapter runs | Practice → Chapter run alternates sound/reading, parts, checked writing, context, and a story decision. |
| 2 | Component puzzles | Spatial part previews, undo/reset, and an assembled-character explanation. |
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
| 17 | Adaptive practice | Suggest available material for the lowest recorded independent skill; reinsert misses and offer a direct retry. |
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
| 28 | Personal decks | Single-word editing, CSV/TSV/JSON import/export, meaning choices, typed reading recall, and scheduled reviews; 10 decks of 100 words. |
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

Run `node tests/study-flow.cjs`, `node tests/workbook-design.cjs`, `node tests/ui-practice.cjs`, `node tests/practice.cjs`, `node tests/practice-feedback.cjs`, `node tests/shape-content.cjs`, `node tests/handwriting.cjs`, `node tests/regression.cjs`, `node tests/import-and-pools.cjs`, `node tests/views.cjs`, then `python3 tests/check-html.py`. These use deterministic DOM/media mocks, not a real browser. They exercise migration, switching, resumes, real backup handlers, shared knowledge, course-local results, assisted answers, Scroll continuity, active-companion XP, replay safeguards, scripts, keyboard handlers, writing defaults and reset. The view check inspects generated HTML for nesting, duplicate IDs, broken text and leaked internal lesson IDs.

Real browser layout, mobile overflow, actual device speech voices, microphone permissions and fetched stroke-order data still require device testing. The current environment did not expose the supported browser QA route. No claim of real iPhone or browser testing is made.

Build the standalone file with `python3 scripts/build-preview.py /absolute/path/Erics_Chinese_1_and_2_Preview.html`. It embeds the exact tested CSS and JavaScript in the same order as `index.html`. Optional web fonts and existing stroke-order data services may still require a network connection. Downloaded HTML uses browser-local storage separate from the hosted GitHub Pages origin; use Export/Import Backup to try a copy of your progress.

For a future approved publication, fetch `main` again, reconcile any changes, and use an expected-head update. Do not force-push. Keep the existing GitHub Pages origin unchanged.
