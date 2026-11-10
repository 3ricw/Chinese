# Study flow design review — November 10, 2026

The aim is to make Chinese easier to read and remember. This release completes the Tools/Arcade alignment work and adapts the attached recording's ink-like appearance switch. Existing course data, character keys, course-owned results, companions, and learning safeguards remain in place.

## References and decisions

I reviewed the public page structures and official product/design documentation below. The observations are design judgments, not a live-browser audit of these products or evidence that copying a pattern improves learning. Duolingo's public homepage is script-only in the retrieval environment, and MUJI's main domain redirects to a maintenance notice; their official articles and regional sites provide the useful context.

| Reference | Useful idea | Decision for Eric's Chinese |
|---|---|---|
| [Apple / WebKit motion guidance](https://webkit.org/blog/7551/responsive-design-for-motion/) | Motion should explain a change and have a reduced-motion alternative. | A 380 ms native snapshot reveal changes the appearance through a rippled ink edge. Reduced motion and unsupported APIs switch immediately. |
| [Duolingo getting started](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/) | Clear steps lead into a usable learning activity. | Show the two existing optional setup steps; keep name validation, skips, and companion selection. The established full-chapter action stays prominent. |
| [Linear interface refresh](https://linear.app/now/behind-the-latest-design-refresh) | Predictable control positions and unequal visual weight reduce interface noise. | Align Tools, simplify Arcade's columns, and keep supporting actions quieter than the main action. |
| [Pentagram parking signs](https://www.pentagram.com/work/new-york-city-parking-signs) | Consistent left alignment, type hierarchy, and shorter labels improve scanning. | Share icon/text/chevron columns; remove inherited narrow description limits and mobile absolute positioning. Keep Chinese larger than pinyin and English in search. |
| [MUJI philosophy](https://www.muji.us/collections/what-is-muji) | Simplicity comes from examining purpose and removing unnecessary packaging. | Preserve useful activities while reducing competing containers and collapsing optional detail. |
| [Airbnb search filters](https://www.airbnb.com/help/article/479) | Scope a search to the kind of result the user wants. | Quick Find gains All, Characters, Words, Readings, and Activities scopes, visible result feedback, and reset. |
| [Aesop design approach](https://www.aesop.com/philosophy-on-design.html) | Respect an existing setting and create coherence around it. | Keep Jade, all saved palettes, workbook character guides, companion art, and the glass navigation finish. No imported retail branding or unrelated imagery. |
| [Notion search](https://www.notion.com/help/search) and [views](https://www.notion.com/help/views-filters-and-sorts) | Reuse one body of information through focused views and keyboard search. | One Quick Find renderer searches existing content; Arrow keys and Enter operate the selected result in the current scope. |
| [Stripe homepage](https://stripe.com/) | A clear first action followed by related sections supports hierarchy. | Keep Home's single next action and grouped daily status/quests/games. Avoid adding another marketing-style landing page. |
| [Framer animation guidance](https://www.framer.com/academy/lessons/bringing-websites-to-life-with-animation) | Animate meaningful states and keep related transitions consistent. | Add small confirmation feedback and a bounded appearance transition; retain existing motion settings. |

The local seven-second recording was inspected through extracted frames. It shows a light/dark switch spreading through an irregular ink boundary. The app's implementation uses an original polygon edge with browser snapshots, with no video, canvas capture, image download, or rendering library dependency. It is inspired by that behavior; it does not reproduce the reference artwork.

## Applying the requested principles

| Goal | Application or limit |
|---|---|
| Hick, Pragnanz, progressive disclosure | One primary next action; optional next practice stays collapsed. Search scopes reduce mixed result choices. |
| Fitts and target distance | 44–48 px key controls, bottom-aligned Arcade actions, and the existing fixed practice footer. |
| Jakob and familiar patterns | Native buttons and disclosures, an editable search combobox, conventional keyboard selection, and a working reset. |
| Proximity, common region, connectedness | Shared page edges and grouping; matching component forms retain their existing visual links. |
| Chunking and serial position | Small result groups, limited initial suggestions, course-aware readings, and learning actions before secondary tools. No universal seven-item memory limit is assumed. |
| Von Restorff | Reserve the strongest filled treatment for the primary action. |
| Doherty and feedback | Search indexes are cached; selection updates synchronously. The appearance animation is bounded at 380 ms. Node timings are reported separately from unmeasured browser/device latency. |
| Peak-end and visible progress | Completion shows actual finished steps, independent answers, helped answers, and missed items, followed by retry or Done for now. |
| Recovery and error prevention | Ignore stale search clicks, preserve IME text editing, reset empty searches, guard appearance races, and keep existing writing/assistance checks. |
| Postel-style input tolerance | Word search accepts marked ü, v, and u: consistently, while keeping u distinct. Both Chinese scripts remain searchable. |
| Complexity and sensible defaults | Default to All search and the user's saved preferences. Keep advanced controls available through disclosures. |

Some names in the supplied list were paired with other ideas. [Tesler's law](https://lawsofux.com/teslers-law/) concerns unavoidable complexity; [Postel's law](https://lawsofux.com/postels-law/) concerns robust input; [Parkinson's law](https://lawsofux.com/parkinsons-law/) concerns work expanding to available time. Uniform connectedness concerns visual grouping. Pareto and Occam are useful prioritization lenses, not rules that automatically produce a good interface. “Comment UX” is a social-media prompt, not a design law. These labels do not justify fake completion, new timers, urgency, or weaker recall requirements.

## Implementation and verification

Changes are integrated into the existing ordered modules. The old extra common-word Quick Find wrapper is removed; a single result renderer now reads the shared word collection. Appearance and setup decoration stay in the existing presentation module. Completion changes only its page renderer. No new active storage keys or learning-state fields are introduced.

The Node suite covers search scopes, scripts, pinyin variants, keyboard/IME handling, stale/double actions, assisted answers, completion credits, setup validation, and native-animation success/failure/race mocks. Existing migration, import/export/reset, review scheduling, handwritten-answer proof, course sessions, companion rewards, and content/view checks also run. See `tests/verification-2026-11-10.json` for results.

The managed environment exposes no supported browser-control route. Real rendered alignment, touch ergonomics, native ink animation, screen-reader announcements, stylus feel, installed voices, and microphone behavior remain unverified. The expanded Playwright suite includes page-edge and Play-button geometry, compact widths, real search keyboard actions, and appearance persistence for later browser testing; it was syntax checked but not executed here.
