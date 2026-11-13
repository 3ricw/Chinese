# Home: task first, supporting statistics, larger companion

Base commit: `da966573855f915da8927e60ce8fddcbdd0f93f3`.

The latest feedback asks for more substance than the stripped-down Home while retaining a clear learning focus. Home keeps its single resume/start chapter action and direct Scroll access. The existing four-stat component now sits together below that task: day streak, learner level/remaining XP, today's recorded checks, and course-aware due reviews. The duplicate greeting streak badge becomes a quiet Your progress link. Quests, games, guides, and calendar panels are not added back to the main view; More stays closed.

The companion's art stage grows from 88/76/64px to 192px on desktop/tablet, 144px on phones, and 128px on the narrowest layout. Its containing columns also grow, including the tablet rule that previously limited the art to 104px. Names are more readable, mobile art padding is smaller, and chapter/Scroll controls span the available phone width before supporting copy. Existing artwork, interactions, companion mode setting, animations, palettes, reduced-motion/transparency fallbacks, and navigation behavior remain.

This reuses `axHomeMetrics()` with live data rather than creating new counters. Learner level is separate from companion level. Daily-goal bars cap at 100%; due counts follow the selected course. Rendering, petting, and opening statistics grant no learning or reward credit. No storage or learning-engine changes are needed. Old versioned assets remain byte-identical, and the standalone file reconstructs the deployment plus its existing optional recognition assets exactly.

**1,647 automated behavior checks passed across 12 relevant suites.** They cover real stat values, shared knowledge/course-specific due counts, chapter/resume priority, one main action, repeated-render reward invariants, large-companion CSS bounds, all nine palettes in both appearances, notes/backups, startup, and existing Home interactions. Syntax, generated HTML structure, handler compilation, and standalone cold startup also pass.

These are Node/DOM/media checks and stylesheet assertions. Actual desktop/iPhone appearance has not been visually verified because supported browser control is unavailable. The new sizes are CSS design values, not measured device screenshots.
