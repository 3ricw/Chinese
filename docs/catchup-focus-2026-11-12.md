# Catch-up learning, clearer Home, consistent feedback

Base: `d2a91381337c7e0c53c7df565dd1c31ab4833097`. The Pages origin, character keys, course IDs, and reward keys remain unchanged.

## Assessment

Keep Chinese 1 and Chinese 2 separate for coursework, lessons, quizzes, badges, and challenges. One catch-up plan can address recognition gaps across their boundary using shared character knowledge.

Home previously gave its guide, next task, and separate metric cards competing emphasis. It now has one full-width lead task, a compact joined metric strip, and a closed learning guide. Companion, Scroll, quests, exactly three Quick games, full Arcade, and optional practice remain. Theme-aware glass depth, restrained borders, type scale, alignment, and mobile spacing improve hierarchy. Saved practice stays first; a chosen catch-up plan becomes the next intentional goal.

General UI sounds previously covered navigation and a few tagged buttons. The existing listener now covers ordinary buttons, native keyboard clicks, disclosures, links, and committed select/toggle changes. Invalid, disabled, stale, and explicitly opted-out controls stay silent. Audio, mute, outcome, and milestone controls keep their own feedback. Common-word grading and guided shape matches now supply checked sounds; mute, speech priority, unlock cancellation, and milestones remain guarded. No listening starts automatically.

## Using catch-up

Open **Home → Catch up on chapters**. For the requested case, choose **first missed Lesson 2**, **last missed Lesson 12**, **class Lesson 13**, and **8 characters per set**. Selectors retain course labels and stable IDs (`2`–`10`, `c2-11`, `c2-12`, target `c2-13`).

Sets prioritize due characters and introduce at most five new shapes. New shapes use the established introduction → shape choice → plain-character recall flow. Reviews keep the existing scheduler, ratings, repeats, assistance, notes, and picture cues. A cross-course queue does not switch the selected course or pass chapter quizzes, and grants no catch-up-specific XP or badges.

The dashboard distinguishes not started, due now, introduced coverage, and independent recall on at least two recorded days. A first exposure or immediate repeat cannot become later retention. When nothing is due, it shows when to return and offers the current class lesson. Words, passages, usage, grammar, and writing remain in each chapter: this is recognition catch-up, not a claim to complete every skill in eleven chapters.

A paused ordinary set offers Resume; the alternative explicitly starts catch-up instead. As with other new practice launches, this replaces the paused queue while keeping its recorded answers. Unfinished catch-up resumes at its guided step. Pause Home reminder removes plan priority without resetting learned material.

[Karpicke & Roediger (2008)](https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_Science.pdf) supports repeated retrieval for delayed foreign-vocabulary recall. Batch sizes and existing review timings are implementation choices, not separately validated guarantees. Later retrieval remains necessary after cramming.

## Compatibility

The small plan lives at `state.learningLab.catchup`, defaults to null, and is explicitly sanitized by the existing practice validator before legacy startup. Standard backup export/import/reset includes it. Old backups remain valid; no storage keys are renamed or added. Session tags are independently sanitized by `decodeResume`.

The catch-up module loads before legacy initialization. Navigation, effective completion rendering, existing Home, and existing sound handling receive targeted edits. Old versioned assets stay byte-identical. Deployment has 22 external JavaScript modules plus the critical inline guard, and ten external stylesheets plus critical inline styles. The standalone HTML reconstructs them exactly.

## Verification

**13,040 automated behavior checks passed across 22 suites**, including 56 catch-up checks, 99 sound checks, and 68 Home checks. Coverage includes cross-course pools/IDs, introductions without credit, assistance, due guards, separate-day records, stale/duplicate callbacks, actual backup Blob/import callbacks, reset, cold resume, interrupted startup, notes, themes, keyboard actions, Settings/Back, mute/priority feedback, and retained Home destinations.

Structure checks passed across 12,237 generated/static views; 21,851 handlers compiled. All 23 scripts pass syntax checks. Exact standalone reconstruction and standalone catch-up startup pass in mocks.

These are Node/DOM/media/animation checks. Supported browser control is unavailable, so actual desktop/iPhone glass appearance, overflow, animation smoothness, Watch behavior, and speaker/audio timing still need real-device testing. Native iPhone/Watch projects are unchanged and were not rebuilt.
