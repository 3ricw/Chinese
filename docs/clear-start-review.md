# Clear start and responsive feedback — November 11, 2026

Based on current `main` commit `7342d27ac690544c7bb9370c5d5eb45e4c237637`. All 132 remote files matched the local checkout before editing. The ordered JavaScript and CSS assets were inspected, including the effective Home renderer in `chinese-js-05`, the existing sound service in `chinese-js-02`, and the final workbook presentation module.

## Findings and changes

| Finding | Change |
| --- | --- |
| A new learner was offered a full chapter of cold recall before meeting its characters. | Home starts with the existing guided introduction: the saved preference determines 1, 3, or 5 new characters. After the first set, small introductions continue while fewer than six course characters have been studied. Due review and saved sessions retain priority. Established learners retain full-chapter priority. |
| The large saturated green surface competed with the rest of Home without explaining the learning task. | A smaller, lightly tinted glass hero puts the accent on the action button. The companion stays prominent, with its existing fixed art stage and reserved reaction caption. Four real progress cards are more compact. |
| Feature names assumed that the learner already understood the app. | An adjacent three-step explanation connects meeting a shape, trying recall, and reviewing later. “Show me around” explains Course, Scroll, Arcade, Tools, the three ratings, and what counts as help. It is optional and does not intercept practice. |
| The calendar, picture cue, quests, and games all looked like competing next steps. | Quests and exactly three games remain visible under an explicit optional section. The calendar and picture cue move into a closed native disclosure. Full chapter, stories, writing, review, missions, and skills stay available in More ways to practice. |
| The reference's navigation felt responsive and connected. | A single 340ms desktop selection highlight moves between destinations; rapid navigation continues from its visible position. The existing mobile lens and single navigation-resize controller are preserved. Learning-loop steps enter in sequence using the existing animation lifecycle. |
| Interface sounds lacked a distinct, quiet activation cue. | Original short synthesized ticks accompany real navigation and Home action clicks. They respect the existing mute setting, don't play on render or hover, and yield to spoken Chinese and completion feedback. Pending audio requests are invalidated on cancel, mute, reset/import, or replacement. |

The uploaded 6.23-second reference recording was inspected as a 3fps contact sheet. Its glass surfaces, traveling selection, staggered content, and restrained green accents informed the implementation. No screenshot artwork, commercial audio, app data, or private feedback attachments were copied into the repository. The new sound cues are original synthesis, not extracted reference audio.

## Research used

- [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) supports putting the main task first while leaving secondary features discoverable.
- [NN/g: Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/) informed the visible short explanation and optional map instead of another mandatory tutorial.
- [NN/g: Recognition and Recall](https://www.nngroup.com/articles/recognition-and-recall/) informed descriptive action labels. Interface navigation should not require memorization; Chinese practice still deliberately requires recall.
- [Apple: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) and [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) informed bounded, cancelable feedback that supplements clear labels. Motion and sound are not the only indications of state.

These are design hypotheses and guidance, not evidence of measured retention gains or a completed usability study. A useful next test is to give the published app to a new learner without instructions and observe whether they can start, finish, and resume a first set.

## Preservation and verification

No storage key, course/vocabulary ID, migration, lesson content, badge requirement, reward rule, or saved note format changes. Both courses, 600 common words and their visual cues, personal notes, Watch developer source, themes, ink transition, companions, Scroll, writing, and all six Arcade games remain. The existing effective functions were edited directly; no competing Home override or additional MutationObserver was introduced. Script/style counts and order remain 21 / 9.

`tests/home-start.cjs` adds 94 checks covering both courses/scripts and all three introduction sizes; actual first-set completion; established, due, and saved-session routes; shared knowledge; escaping; no browsing credit; rapid/canceled/unsupported/reduced-motion navigation; and muted, hidden, speech-interrupted, delayed, and superseded audio. Existing presentation expectations were updated only where the intentional hierarchy changed.

All 12,074 behavior checks passed. Structural checks passed across 12,210 generated views and 21,851 compiled inline handlers. The exact standalone JavaScript/CSS reconstruction and startup at Home passed. All 21 scripts parse. Declared primary-action and navigation text colors pass 4.5:1 across 18 palette/appearance combinations (minimum 5.13:1); this is numeric source-color analysis, not rendered-pixel verification.

No supported browser-control route is available in this environment. Actual iPhone/mobile layout, animation smoothness, tap feel, and audible sound quality remain untested on devices. Native Watch source was unchanged; the previous successful simulator builds are not represented as newly rerun tests. See `tests/verification-clear-start.json` for the current package and test record.
