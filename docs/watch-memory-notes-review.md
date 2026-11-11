# Watch, word visuals, and memory notes

Base: `76d63276b86bad7923198157bc443a18244e12e2`. The published asset order, existing storage keys, course IDs, character keys, common-word IDs, Jade defaults, saved palettes, ink transition, glass navigation, and companion behavior are retained.

## User-visible changes

- Character notes are visible on the Usage tab and in Shape & memory. Whole common words get their own notes. Tools and Quick Find open a searchable notebook that combines both scopes across courses. Notes save on input and are part of progress backups. Reading a note before a recall answer counts as help, including paused sessions and Scroll. Course-example lookups also mark a paused common-word recall as supported, even with pictures disabled.
- All 600 common-word entries have an explicitly assigned visual cue and an original caption. The art uses 47 reusable SVG scene/diagram types. These are 600 word-specific aids, not 600 independently painted images. Concrete pictures, relationship diagrams, quantity patterns and timelines are used where appropriate. The original 59 character illustrations stay available. Course-word details offer matching cues or clickable character compositions. A component's meaning is not asserted to explain the whole word.
- Teaching and revealed common-word cards show visual cues. Cold recall keeps the plain word. Picture hint (`V`) records help and exposure and cannot advance familiarity. No automatic listening was added.
- Tools → Apple Watch exports 1–5 studied characters from the selected course, studied common words, or explicitly saved words, with paired scripts and notes. The native iPhone companion imports the file and queues it to Watch using WatchConnectivity. The Watch has offline rounds, resume, reveal/self-grading, and assisted personal notes. A new set preserves an unfinished round. Summary IDs prevent duplicate history entries. Watch practice awards no browser XP, mastery, streaks, badges, or companion rewards.

## Compatibility

Character notes retain `state.memoryNotes` without key renames. Whole-word notes use optional `state.commonWords.notes` with stable `cw-xx-xx` IDs. Legacy bootstrap capture remains in place; the word validator accepts bounded, plain-text notes and leaves the legacy shape unchanged when none exist. Export/import, recovery copies, cold startup, and reset are covered. The existing reset confirmation already includes memory notes and still clears them; an old editor cannot repopulate reset data. Note-only common-word collections now qualify for automatic recovery copies too.

## Verification and limits

The behavior suites passed 11,980 checks. The new checks cover all 600 cue mappings and both scripts, hidden cold-recall pictures, assistance, stale/duplicate callbacks, note editing, quota failures, actual export Blob contents and import callbacks, reset, startup, paused-session help, Watch-set selection and unchanged reward/knowledge state. Structural validation covered 12,186 generated views and 21,839 compiled handlers. All 21 ordered scripts compile; the standalone HTML reconstructs the deployed scripts and nine styles exactly.

Librsvg/Cairo rendered all 600 word scenes, with 1,200 parse/pixel checks. A representative contact sheet was visually inspected. The existing ink geometry checks also passed. These are vector checks, not browser screenshots.

GitHub's Mac CI passed all 11 Swift shared-model tests, generated the Xcode project, and built both native simulator targets for the published source at commit `3febe78265a87084b0bcd2432ac3a5f2b1d4dd79` (run `43056995120`). This verifies compilation and model behavior, not signing, installation, or WatchConnectivity delivery on devices.

No real browser, physical iPhone, physical Watch, actual signing/install, WatchConnectivity delivery, Dynamic Type layout, microphone, or audio test was performed here. The native work is a development preview, with no App Store/TestFlight release. App Store packaging is not configured. The website states these limits and provides the source/setup instructions. Cross-device browser progress remains local; no account or cloud sync is implied.
