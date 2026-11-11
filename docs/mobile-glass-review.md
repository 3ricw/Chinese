# Mobile layout, glass materials, and responsive motion

Based on fetched main `d342a7c9a2b59cd1ab15f5977eac759093448e17` and the supplied Home, Arcade, and Tools screenshots.

## What the screenshots revealed

An obsolete mobile rule in the course consistency stylesheet set the Home text container to `display: contents` and assigned its former children to individual rows. The newer grouped action buttons no longer matched that layout. The result was a stretched card with a narrow action column, separated copy, and large empty spaces. Thirteen obsolete mobile declarations were removed. The current design asset is now the layout owner.

Home has explicit intro, description, companion, and action areas. On phones, the description and actions span the card; at especially narrow widths, actions precede the longer description. The text container remains a block. The companion art/ring has a fixed stage, its name stays nearby, and a reserved two-line caption spans the card after the actions. Greeting the companion cannot recenter the ring or push the controls around.

The four real progress cards now sit directly below the main action on mobile, followed by a compact calendar/visual-cue card. Desktop keeps the featured action beside the calendar, with four progress cards underneath. The full Home retains its greeting, primary next step, companion, Scroll access, streak/level/goal/review information, three daily quests, three Quick games, extra practice, and progress access. The 900px page and companion collection alignment stays intact.

Arcade keeps all six activities and the existing pool/mode callbacks. Its introduction is shorter, Tone Trainer mode settings use a native disclosure, and detailed XP/recognition explanations remain available in a collapsed section. The explanatory text still distinguishes practice XP from unassisted character recall and recognized speech from reliable pronunciation/tone assessment.

## Glass on both screen sizes

The uniform full-page wash is replaced by two localized jade/theme and warm-accent fields behind the interface. Outer panels are more translucent and have stronger reflected edges, soft highlights, shadows, and backdrop blur. Floating navigation and the sidebar use lighter glass materials. Dense reading and practice retain higher-opacity surfaces so character forms remain clear. Inner rows and tiles avoid redundant blur layers; Tools rows no longer draw their own competing borders.

Every existing palette ID is retained. Jade remains the default, saved appearance preferences remain authoritative, and Ink remains available. The new material labels use stronger foreground contrast rather than simply retaining the old muted colors over brighter glass. Numeric checks include conservative ambient-color bounds across all nine palettes in Light and Dark. Selected navigation text and colored icons have separate contrast requirements.

The mobile header regains a compact wordmark on Home. The course selector uses a smaller glass segmented control. The bottom bar keeps Home, Course, Scroll, Arcade, and Tools, along with its existing gradual shrinking, minimum 44px targets, and steady bottom edge. A decorative active lens slides between destinations using CSS. Its geometry follows the existing size-progress variable; no second resizing controller is added. Unsupported relational selectors keep the established active-button fallback.

## Motion with a bounded lifecycle

- Native page fades and lightly staggered card entrances start without disabling controls.
- One visibility observer reveals a bounded number of cards as they approach the screen, and disconnects when the page is replaced.
- Tap ripples and keyboard feedback decorate known card/navigation/Home action targets without changing event behavior or the positioning of close/floating buttons.
- Progress tracks animate to their actual saved values; no counts or learning records are invented.
- Companion greetings add a small hop and three short-lived sparkles. Rapid greetings replace the previous reaction; canceled effects remove their decorative nodes.
- Fine-pointer hover effects lift cards and activity glyphs.
- Two slow CSS background movements add depth outside focused practice. They stop for hidden pages, focused practice, reduced motion, and the saved app motion setting.

The existing render mutation observer coordinates decoration and entrances. Effects use native animations and CSS rather than a new per-frame JavaScript loop. Repeated decoration does not replay the same page. Replaced pages, stale visibility callbacks, disabled settings, hidden documents, and native cancellation are guarded. Learning state, XP, rewards, review schedules, and companion training are not written by these effects.

The existing ink reveal retains its 1,450ms duration, compiled noise geometry, and end-of-transition cleanup. Presentation animations are canceled before ink snapshots, and ambient motion pauses while ink spreads. Finishing the theme change does not trigger another page entrance or a second color flash.

## Compatibility and verification

No storage keys, course/word/lesson IDs, knowledge records, migrations, reward functions, or learning content changed. The pre-initialization reading/common-word extension capture remains. Saved progress, bookmarks, notes, companions, script choice, themes, sessions, backups, existing mastery safeguards, keyboard controls, and all course features stay on the same GitHub Pages origin.

Automated checks cover the photographed layout regression at the source/DOM level, connected animation fixtures, rapid taps, cancellation, stale callbacks, reduced motion, no automatic audio, unchanged learning/reward data, material-token contrast, legacy/course migrations, backups, word recall, writing, all activity flows, generated HTML structure, and ink vector coverage. Exact counts and the standalone package hash are recorded in `tests/verification-mobile-glass.json`.

The supported managed browser-control route was unavailable. No browser server, substitute browser-control route, or browser installation was used. The future browser suite was expanded with 320/390/430/600px Home geometry, companion stability, action width, progress order, and native motion checks, but it was syntax checked only. DOM/media/native-animation mocks and vector rasterization do not verify actual iPhone layout, backdrop compositing, animation frame rate, device audio, or microphone behavior. Those remain real-device verification limits.

The deployment still uses nineteen ordered scripts and nine styles, with new content-addressed versions only for the edited owners. Published assets are retained. The standalone HTML reconstructs the referenced scripts and styles exactly.
