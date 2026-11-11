# Jade navigation, stable companions, and connected word lessons

Based on fetched main `5d2304e402117f53f608c5f6437010ab214da598`.

## Reference comparison

The supplied `afiles.zip` contains a newer standalone presentation experiment (`2026.11.10-reference-look`). All nineteen original scripts and nine original styles match the published app byte for byte. Its changes are an appended style and script. The appended layer replaces the theme surfaces with common charcoal/paper neutrals, mutes sidebar accents, changes the fixed sidebar to relative positioning, adds another decoration observer, and forcibly resets saved palettes once. Those changes explain the long black sidebar and loss of the preferred jade appearance. They are excluded from this release.

The app builds on the existing jade glass dashboard: inset navigation, a featured action beside the calendar, four real progress cards, companion, Scroll, daily quests and three Quick games. All nine palette IDs and saved appearance choices remain intact, including Ink. No one-time palette reset is introduced.

## Display and companion interaction

- The desktop sidebar stays 213px wide, inset 12px, and constrained to the viewport. Its navigation can scroll independently on short displays, leaving the companion reachable. Fixed positioning is explicit; desktop flex display does not override the mobile sidebar hiding rule.
- The companion's progress ring and artwork now share a fixed square stage. The caption has a reserved three-line area outside the stage; an empty message cannot recenter the ring or shift the name. Disabled messages remove that caption space. Tapping retains varied art and tips without learning credit or XP.
- The shared jade glass materials, theme-tinted icons, rounded controls, mobile five-destination bar, single navigation easing controller, reduced-motion/transparency fallbacks and 900px companion/page alignment are retained. The word lessons use the same glass materials and primary-action hierarchy.

## Ink reference and implementation

The supplied [ink-bleed-theme-changer repository](https://github.com/codemure-official/ink-bleed-theme-changer), inspected at `1fd7a93f570945a519ccf9a45cf744e6873afa0e`, uses domain-warped noise, curling filaments and frontier texture in a WebGL compositor over captured pages. This release implements original noise-derived vector geometry while retaining native page snapshots, so the actual app text and glass are rendered by the browser.

The evolving noise field is compiled by `scripts/build-ink.cjs`, keeping expensive noise calculations off the theme-button path. Twenty-nine interpolable keyframes contain a 720-point main edge, twenty wisps and twelve reverse-wound veins: 1,104 cubic commands across 33 closed contours. The reveal lasts 1,450ms. Light and Dark share normalized geometry with different orientations, scaled to the current viewport and activation point. This is a closer interpretation of the reference, not an identical copy of its shader.

The first mask is empty and the final mask encloses the viewport. Snapshot styles and the filled reveal persist until the native transition finishes. Ordinary color transitions are suspended during the ink reveal, preventing an unfinished color tween from being exposed at cleanup. Existing guards for rapid toggles, later settings choices, reduced motion, unsupported APIs and native animation errors remain in place. No third-party capture dependency, per-frame JavaScript loop, or competing theme controller is added.

## Common words

The full collection remains 600 entries across its original 20 categories, with unchanged stable word IDs, examples, script forms and definitions. The default entry point is now a guided start: **20 five-word lessons covering 100 existing words**, with **74 original reading lines**, pinyin, paired Simplified/Traditional text, short connected usage explanations and one optional meaning check per lesson. Readings can be segmented entirely into the current lesson's words and earlier words, in both scripts.

The first lesson connects 我, 你, 好, 吗 and 很 in a useful exchange, replacing the old category-order introduction of 我, 你, 他, 她 and 它. Later lessons address possession, location, plans, 了, types of “can,” reasons, polite requests, written recognition, learning instructions and alternatives. Learners can select any lesson, skip introductions with Try recall first, or skip already familiar targets. Finishing practice offers a dialogue and the next lesson; returning to the hub suggests the next new lesson. The remaining 500 entries are still available in the searchable library and subsequent five-word introductions; they have not all been redesigned into guided lessons.

Word and sentence audio are separate explicit controls. Dialogues provide a labeled audio button for each line, clickable characters, collapsed pinyin/meaning and Usage, and an optional comprehension check. Browsing and comprehension checks grant no mastery or rewards. Completion says how many words were practiced, with an honest independent/supported recall breakdown; it does not call an introduction “mastered.” The order is curated, not a strict frequency ranking or a comprehension-coverage claim.

## Progress compatibility and safeguards

The main and reward storage keys are unchanged. The existing pre-initialization extension capture remains. Migration is additive: common-word records may store a sanitized `exposureDay`, and saved sessions may store a validated stable `unit` ID. Legacy records retain their prior shape when these fields are absent. Learned stages, saved words, review schedules, characters, bookmarks, memory notes, readings, writing, companions and preferences are not reset.

Introductions, lookups, audio and same-day answer exposure are remembered without marking the word started or familiar. A correct immediate or missed-word repeat is supported practice; it cannot advance familiarity. Unassisted recall must occur on separate days. An assisted correct answer schedules another review without incorrectly reducing the existing stage, and overdue assisted reviews receive a future due time. Already earned familiarity is retained.

Session turn guards remain unique when a session is replaced, even within one clock tick. Paused-session lookups and audio still mark assistance. Closed dialogue callbacks cannot grade another dialogue. A word contributes to learner rewards, active-companion rewards, quests and the daily goal at most once per day; returning it to New preserves the daily reward/exposure guards. Word learning remains independent of component-character knowledge. Both course curricula and course-specific achievements are unchanged; common words remain shared across courses.

## Verification and packaging

The automated release checks cover legacy and Chinese 2 migration, backups through the actual export/import handlers, saved-session restoration, resets, recognition versus word progress, separate-day recall, assisted answers, duplicate callbacks, reward farming, keyboard controls, all scripts/palettes, companion interactions, ink lifecycle and vector coverage. See `tests/verification-2026-11-11-jade.json` for the exact counts.

The deployment still has nineteen ordered scripts and nine styles. The self-contained HTML is reconstructed exactly from the referenced versioned assets; no extra override script or style is appended. Published asset versions are retained.

The supported managed browser-control route was unavailable. Automated DOM/media mocks, source/cascade checks and vector rasterization do not establish actual browser layout, glass compositing, iPhone overflow, screen-reader behavior, native ink smoothness/support or device audio/microphone behavior. Those remain device verification limits. No real-browser or iPhone testing is claimed.
