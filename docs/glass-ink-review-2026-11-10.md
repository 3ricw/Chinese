# Glass study desk and liquid ink

Based on upstream `10a062693fcb27640812cab67051f9c0c10a2bb9`. The two newly attached recordings were inspected directly, including frame sequences of the ink transition.

## Display changes

The dashboard reference shows a translucent sidebar, a feature card beside a calendar, four small statistics cards, rounded controls, soft backdrop color, fine illuminated edges and aligned card boundaries. These relationships now organize the existing learning interface.

| Reference pattern | Chinese app implementation |
| --- | --- |
| Narrow translucent sidebar | Inset frosted navigation, shared Quick Find, existing course control and companion |
| Featured work card | Full-chapter/resume/review action with its existing callback, companion and nearby Scroll button |
| Circular feature graphic | Daily-check progress ring around the companion; no invented proficiency percentage |
| Calendar panel | Current local date and the last seven days of actual practice; history and visual-library access |
| Four statistics cards | Existing streak, learner level, daily checks and current-course due reviews |
| Consistent glass surfaces | Shared material tokens across Course, Review, Tools, Arcade, reading, settings, study sheets and practice cards |
| Rounded inset icon wells | Existing destination identities and accessible labels with quieter tinted glass |

The 900px page/companion alignment stays intact. The sidebar still supports hiding, edge access and keyboard focus. Mobile retains its five destinations and existing single easing controller. Four progress cards become two columns on narrow screens. The current chapter's actual character count replaces duplicate chapter naming in the feature label; the brief instruction still requires reading before revealing and honest self-rating. Resume and due-review copy retains its original context.

Material styling uses translucent surfaces, restrained static color fields, fine rims, highlights, shadows and backdrop blur. The nine existing palettes retain their IDs and saved preferences, including Jade and Ink. Practice characters and reading text use higher-opacity surfaces. Reduced-transparency, increased-contrast and unsupported-blur fallbacks resolve to solid surfaces in both Light and Dark. New hover movement requires a fine pointer, enabled app motion and no system motion reduction. No continuously animated backdrop or new decoration observer is added.

## Ink transition

The recording's ink edge is irregular and folded, with detached strands and narrow veins. The previous small-amplitude polygon reduced it to a near-circle. Its replacement uses a procedural compound cubic path: a warped, multi-scale boundary, twenty wisps and twelve reverse-wound veins. Thirteen matching keyframes preserve native path interpolation; the 1,000ms reveal uses the existing browser-snapshot transition. Each frame has the same 864 cubic commands and 33 closed contours. No canvas, image download, text-displacement filter or per-frame JavaScript loop is used.

The first mask has zero area. The final mask fully covers the viewport and collapses the secondary details. The selected preference changes once. The filled reveal remains in place until `ViewTransition.finished`, and snapshot styles remain persistent so cleanup cannot reactivate the browser's default cross-fade. Rapid clicks, explicit later preferences, native-animation failures, unsupported clipping and motion settings retain guarded fallbacks.

Technical references: [CSS clipping and interpolation](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Masking/Clipping), [`path()` shape syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/basic-shape/path), and [`ViewTransition.finished`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/finished).

## Learning compatibility and verification

The work edits the existing effective Home renderer and the existing presentation/helper assets. Script execution order stays unchanged. There are no changes to curriculum, canonical IDs, storage validators/keys, course migration, review scheduling, writing checks, common-word records, companion rewards or mastery rules. Calendar/metric rendering and clicking visual aids cannot create learning credit. Previously earned progress remains on the same GitHub Pages origin.

The new tests verify actual metric values, public course/chapter labels, retained Home features, disabled settings, unchanged learning records, material-token contrast, solid fallbacks, geometry topology, empty/full ink endpoints and stale-callback handling. The actual vector paths are also rasterized with librsvg/Cairo: initial transparency, final full coverage and increasing sampled coverage are checked for two viewport sizes and both transition directions. These are vector-rendering checks, not browser screenshots.

The supported managed browser-control route is unavailable. The expanded future browser suite is syntax checked but not executed. Actual mobile overflow, native path-animation support and smoothness, real glass compositing, assistive technology, microphone/audio and stylus behavior remain unverified on devices. No pixel-identical reproduction or measured learning improvement is claimed.
