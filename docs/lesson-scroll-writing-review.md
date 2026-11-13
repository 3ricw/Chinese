# Lesson Scroll, handwriting repair, and a fuller Home

Release `2026.11.12-lesson-scroll-writing`, based on remote main `59c889ced8725c61cbd74af3e73e190d9372a43e`.

## What changed

The lesson Learn tab now offers green **Scroll this lesson** (Start/Resume Scroll) and grey **Practice full chapter**. The lesson entry always uses that lesson's pool. Reopening an unfinished set preserves its identity and card position; continuing retains existing feed progression. Each course keeps its own saved set. Checked **Write to answer** remains available under the optional Write tab. Invalid or wrongly labeled saved pools rebuild within the requested lesson rather than crashing or mixing lessons.

The free-draw layout had a flex row that squeezed the canvas between its copy controls and a stroke-check button, then stretched it vertically. It now groups a bounded square canvas above those controls. Reveal/rating controls remain outside the scrollable card. Checked writing inherited the app's generic 20px SVG icon width, making its real writing surface almost unusable. A scoped SVG rule restores the full square and removes inherited icon strokes. The checker tracks its actual displayed dimensions on rotation/resizing, disconnects obsolete observers, ignores stale callbacks, and tolerates pointer-capture errors. Its loading state no longer presents stale mistake instructions. Character data still requires an internet connection; offline errors keep retry/skip available and grant no credit.

Home retains its single resume/start action, direct Scroll access, and four actual statistics. A quiet current-lesson shelf adds a title, practiced count, and up to three stable daily character previews linked to examples, memory cues, and notes. When saved practice would be spoiled, a short Meet → Recall → Revisit path replaces those previews. Unfinished answers in both courses, common words, writing, quizzes, Scroll, and learning runs are conservatively protected. Rendering Home grants no XP or recall credit. Explicitly opening a preview records assistance through the existing service.

The companion is anchored within its own hero column, with a 232px desktop stage, 164px phone stage, and 140px narrow-phone stage. Its caption sits under its name instead of reserving an empty full-width hero row. The startup screen has a branded illuminated mark and restrained indeterminate loading motion, uses the saved palette/appearance, and respects reduced motion. Recovery actions appear on failure or a slow connection. The existing startup save guard and final-module completion gate remain unchanged; there is no artificial loading delay.

## Design rationale

NN/G's [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) supports prioritizing common tasks while retaining specialized options in secondary views. Its [recognition-and-recall guidance](https://www.nngroup.com/articles/recognition-and-recall/) supports visible context so users need not remember where to go. [Apple's interface guidance](https://developer.apple.com/design/tips/) recommends readable layouts, nearby related controls, and sufficiently large touch targets. Applying those principles to this app is a design judgment, not evidence of measured learning gains: the lesson shelf supplies context and useful content without restoring the entire rewards/calendar dashboard.

## Preservation and validation

No storage keys, legacy IDs, course data, recognition records, review rules, notes, backups, companion rewards, or palette preferences are renamed or migrated by this update. Existing versioned assets remain byte-identical. The portable HTML includes the same ordered deployment scripts/styles plus the existing optional local recognition assets.

Exact automated results and packaging hashes are recorded in `tests/verification-lesson-scroll-writing.json`. Coverage includes fresh and migrated progress, assisted answers, cross-course saved sets, stale callbacks, writing locks, pointer coordinates, rewards, imports, keyboard controls, themes, and generated HTML/handlers.

All checks are Node/DOM/media/canvas/animation mocks, static stylesheet contracts, or generated-HTML validation. Supported browser control is unavailable in this environment. No actual iPhone, Watch, mouse/stylus, browser layout, speech, sound, or rotation test has been performed; manual device verification remains necessary.
