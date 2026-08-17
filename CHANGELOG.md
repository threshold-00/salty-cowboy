# Changelog

All notable changes to the Salty Cowboys booking engine, most recent first.

## 18 Aug 2026 — Figma parity batch, Commit 1: Step 2 copy and labels

Per `docs/step2-figma-parity-batch.md` (Figma frame `5:1478`), Commit 1 of a five-commit batch
bringing Step 2 into closer parity with the frame. Pure text, no layout moves, lowest risk of
the batch.

- Added a hint line under "1. Book a date and time": "Select an available date below to choose
  your time slot." New translation key `dateTimeHint`.
- Merged the single-rider double label. Previously a single-person booking showed "About you"
  (section label) directly above "Your details" (card label), which read as redundant. Now the
  section label only appears for 2+ riders ("About the riders"), and the single-rider card
  itself reads "Participant details" (new key `participantDetails`). Multi-rider bookings are
  unchanged: each card still reads "Rider 1" / "Rider 2" (or "Person 1" / "Person 2" outside the
  Rides category) so people stay distinguishable. The old `aboutYou` and `yourDetails` keys were
  removed as dead code once nothing referenced them.
- Notes hint now ends "...please let us know here." instead of "...please let us know below.",
  matching the Figma copy. Updated in `index.html` and in this file's own Notes section
  documentation to match.
- Summary row label renamed from "Riders" to "Participant" (`sRiders`) in all three languages.
  This affects both the confirm screen's summary and the in-page summary added in Commit B,
  since they share the same key. Fixes an existing inconsistency too: a photoshoot or lesson
  booking previously said "Riders" in this row even though no one is riding.

### Declined
- diff #16 (restore the hourglass emoji on "Awaiting approval") was declined per Ro's explicit
  confirmation. This session already removed that emoji deliberately as part of a
  no-decorative-emoji, spare-editorial-tone pass, and a test asserts it stays gone. Flagging
  back rather than silently reverting: if the Figma frame is the newer source of truth here,
  say so and I will restore it.

Business rules: none changed, display only. `CLAUDE.md`'s Notes section hint text updated to
match.

### Testing
- 217 / 217 string assertions pass (10 new, 3 rewritten for the new copy)
- jsdom render passes with zero console errors

## 17 Aug 2026 — Commit C: Step 2 reorder, ungate calendar, Futura upright type (structural + LOGIC)

Per Ro's direct request (matching `docs/booking-engine-structural-spec.md` Commit C, plus a
typography change not in that spec). This is the risky commit: it reorders DOM and moves a
completeness check off the calendar and onto Send. Held locally, not pushed yet, same reasoning
as Commits A and B — waiting for everything to land together so a half-finished structural
change never reaches GitHub Pages.

### Structure
- Moved the whole "date and time" group (duration pills, calendar, time slot) from the middle
  of the riders screen to the very top, under a new "1. Book a date and time" heading. The
  calendar, legend and time-slot panel no longer wait for `detailsComplete` — they render as
  soon as an activity is chosen, matching the Figma target ("the calendar may show
  immediately").
- "2. Who's coming?" now correctly leads section 2 (grooming, number of people, participant
  details, photographer add-on, live price preview), in that order, unchanged internally.
- "3. Your booking summary" (notes, WhatsApp-confirmation notice, the summary card, Send) is
  now its own block, positioned after section 2. It shows once `datesComplete` is true (same
  trigger as before, just relocated) rather than needing the full rider-details gate too — so a
  booker who fills in dates before rider details still sees the summary and a disabled Send,
  instead of nothing.
- Removed the `marginTop: 22` spacer that used to sit above the calendar. It existed to create
  breathing room when the calendar rendered far down the page after the price-reveal widget;
  now that the calendar is the first thing in section 1, it produced the large empty gap Ro
  flagged. No custom spacing was added in its place, it uses the same default spacing every
  other section here already uses.

### Logic (the one change that needed care)
- `detailsComplete` (duration + number of people + grooming-if-applicable + fully valid rider
  details) no longer gates the calendar's visibility. It now gates the Send button instead:
  `disabled: !selectedTime || !detailsComplete`. Submitting an incomplete booking is still
  impossible, the check just moved from "hide the section" to "disable the button", matching
  the Figma target's always-visible-form pattern.
- Nothing else changed: `slotsFor(actObj, duration, sortedDates)` (duration-to-slot filtering),
  the Horse Whisperer week-lock (`isCourse && selectedDates.length > 0` restricting later picks
  to the same Mon–Sat week as the first), the WhatsApp send handler and message, the pricing
  math, and the `ACTIVITIES` data are all byte-for-byte unchanged.

### Acceptance checks (per the spec, all four verified live)
1. Calendar shows on entry, before any rider detail is filled in. Verified on Beach & Rice
   Field Ride and on the Horse Whisperer Course (4-day picker).
2. Duration still filters time slots: picking 1hr showed only the 5:00pm slot, matching the
   fixed-slot rule.
3. Weight and riding-experience gating still work on the riders screen, unchanged.
4. Send stayed disabled (visibly greyed out) until name, age, weight and experience were all
   filled in, then enabled. Confirmed the Horse Whisperer's week-lock also survived the reorder:
   selecting May 4 correctly narrowed the remaining pickable days to that week's Monday,
   Tuesday, Thursday and Friday only.

### Type
- `--display` changed from `'Cormorant Garamond', serif` (loaded via Google Fonts, italic) to
  `'Futura', 'Century Gothic', 'Outfit', sans-serif` (a system-font stack, upright). Futura
  isn't a Google Font, so this can't be `@import`ed the way Cormorant Garamond and Outfit are;
  it renders as real Futura on Mac (where it ships as a system font), falls back to the
  visually similar Century Gothic on Windows, then to Outfit (already loaded) everywhere else.
  Ro confirmed this system-stack approach over pulling in a Google Fonts lookalike.
- Removed `font-style: italic` from every rule that used `var(--display)` (hero title, section
  headings, the CTA button, the calendar month label, the calendar's own selected-date title,
  the confirm screen's title, the "no availability" title, the "what your booking cost funds"
  heading, and the price-reveal total). Left the three unrelated italic rules alone
  (`#loading .lbl`, `.price-note`, `.byo-note`) since they don't use the display font and
  weren't part of this request.

### Testing
- 207 / 207 string assertions pass (16 new, 4 rewritten to match the new structure)
- jsdom render passes with zero console errors
- Verified live end-to-end as described in the acceptance checks above

## 17 Aug 2026 — Commit B: Step 2 structural additions (structural, no logic)

Per `docs/booking-engine-structural-spec.md`, Commit B of the four-commit
structural pass. Purely additive: no `useState`, `screen` conditional, or
handler touched. Held locally, not pushed yet, same reasoning as Commit A.

- Added `.detail-header-band`: a faint category image (rides / photoshoots /
  lessons, keyed off `actCategory`) behind a `rgba(20,20,20,0.8)` overlay,
  radius 14, wrapping the existing Back link and activity title on the
  riders screen. Purely decorative, no new state.
- Added numbered section headings, new translation key `stepHeading1` /
  `stepHeading2` / `stepHeading3`. Placed in the CURRENT block order (not yet
  reordered, that's Commit C):
  - "2. Who's coming?" sits above the Number of people block. Duration and
    grooming, which currently render above this, stay headingless in this
    interim state since they conceptually belong under heading 1, which
    Commit C hasn't moved up yet.
  - "1. Book a date and time" sits above the calendar, still inside the
    `detailsComplete` gate. Commit B does not touch the gate, only Commit C
    does.
  - "3. Your booking summary" sits above the new in-page summary block,
    inside the same gated section, right before Send.
- Added an in-page booking summary block on the riders screen, directly
  lifted from the confirm screen's `confirm-summary` / `sum-row` markup so
  labels stay identical (Activity, Grooming if applicable, Add-on if
  applicable, Duration, Date & time, Riders, Total, Status). Displays
  existing state only, computes nothing new; the Total row reads the
  already-existing `totalPriceStr`. New translation key `sTotal` ("Total" /
  "Total" / "Итого") added alongside the other summary labels.

### Flagged: summary asymmetry between Step 2 and Step 3
The confirm screen's own summary does not have a Total row today (confirmed
absent during the earlier Step 3 restyle pass). Adding Total to the confirm
screen was out of scope for this commit, so a booker now sees Total on Step
2 but not on Step 3. Flagging this for Simone/Ro: recommend adding the same
Total row to the confirm screen in a follow-up so the two summaries match.

### Testing
- 196 / 196 string assertions pass (17 new)
- jsdom render passes with zero console errors
- Verified live: header band renders with the correct category image,
  headings appear in the right spots, calendar and summary block both show
  once rider details are complete, summary values match the selections
  made (activity, duration, date/time, riders, total, status), Send stays
  where it was.

## 17 Aug 2026 — Commit A: Step 1 activity card rebuild (structural)

Per `docs/booking-engine-structural-spec.md`, Commit A of a four-commit
structural pass. Unlike the earlier restyle-only passes, this one adds new
elements. Held locally, not pushed yet — waiting on Commit C (the risky one)
before anything goes to origin/main, so a half-finished structural change
never reaches GitHub Pages.

- Rebuilt `act-card` from a horizontal row (small emoji chip + text column)
  to a vertical stack: image placeholder, title, price chips, description,
  Book button. `.act-icon` (the per-activity emoji) is gone, replaced by
  `.act-image`, an empty styled placeholder (fog background, 14px radius,
  140px tall). No image loading wired up, per spec ("do not build image
  loading").
- Added a per-card "Book →" button. Its `onClick` reuses the exact same
  state-setter calls the card's own `onClick` already made (select
  activity, clear duration/people/riders/add-ons), plus `setScreen("riders")`
  to advance immediately. No new handler logic was invented, this composes
  two already-existing state transitions. Calls `e.stopPropagation()` so
  clicking Book doesn't also re-trigger the parent card's onClick.
- `.act-check` (the selected-state checkmark) repositioned from
  `margin-left: auto` (meaningless once the card became a column) to
  `position: absolute; top: 14px; right: 14px`.
- New translation key `bookActivity` ("Book →" / "Pesan →" /
  "Забронировать →"), matching the existing arrow-suffix convention used by
  "Next →" and "Continue →".

### Decisions made explicit (the spec flagged these as undecided)
- Per-card action: added the Book button (spec offered a choice between
  this and keeping the single global Next button only).
- The existing whole-card click-to-select behaviour is unchanged; Book is
  an additional fast path, not a replacement.
- "Where the money goes" placement: left at the top of Step 1, unmoved, per
  the spec's own explicit "do not move until confirmed."

### Testing
- 179 / 179 string assertions pass (10 new)
- jsdom render passes with zero console errors
- Verified live: card layout, image placeholder, Book button correctly
  selects the activity and advances straight to step 2 (confirmed via
  screenshot after click).

## 17 Aug 2026 — Step 3 restyle (look only, no logic)

Restyled the `screen === "confirm"` view per `docs/booking-engine-restyle-spec.md`.
No behaviour changed: the copy-to-clipboard handler, the reset ("make another
booking") handler, the summary values read from booking state, and the
WhatsApp message content and phone number are all untouched.

- `.confirm-title`: 21px → 22px, matching the shared heading size.
- `.confirm-summary`: border 1.5px → 1px, padding 18px → 18.5px.
- `.sum-row` / `.sum-key` / `.sum-val` / the Status value's colour: already
  matched the spec exactly, left untouched.
- `.copy-box` and `.copy-text` swapped which one carries the "card" look.
  Previously the outer `copy-box` had no styling of its own and the inner
  `copy-text` (the raw WhatsApp message preview) carried its own dark-tinted
  box (`rgba(0,0,0,.04)` bg, `rgba(0,0,0,.12)` border). Per spec, `copy-box`
  now carries the card (`#f7f7f7` bg, `#dcdcdc` border, radius 12) and
  `copy-text` is now plain text (13px, `#444`, 19px line-height) sitting
  inside it. Pure CSS reassignment between two elements that already
  existed; no new DOM nodes.
- `.copy-heading` letter-spacing 0.5px → 1.5px, aligning it to the shared
  uppercase-label convention used elsewhere (rider-label, etc).
- `.copy-btn` (the copy-message button): was a full-width, tinted
  (`rgba(0,0,0,.1)`) button; now compact and outlined (white bg, `#141414`
  border/text), per the spec's "Compact... white bg with 1px #141414 border"
  option. Its `.done` (post-copy) state stays solid dark as a success cue.
- Removed the "📋 " clipboard emoji from the copy button's label text — the
  global spec rule explicitly names clipboard emoji for removal from labels.
  The `copyMessage` handler itself is untouched.
- Removed the "⏳ " hourglass emoji from the Status value ("Awaiting
  approval"), all three languages — same global rule, explicitly names
  hourglass. Found this scanning the confirm screen's translated strings,
  not just its CSS classes.
- "Make another booking": this button shared the `.cta` class with the
  primary action buttons on steps 1 and 2 (Next, Send request via
  WhatsApp), but the spec wants it styled as a plain underlined text link —
  restyling `.cta` itself would have broken those other two buttons. Gave
  it a new class, `.reset-link` (underlined, 14px, `#6e6e6e`), and changed
  only the `className` attribute on this one existing button. The
  `onClick={resetAll}` handler is unchanged. This is a class-attribute edit
  on an existing element, which the spec's global rule 1 explicitly permits
  ("edit their styles and class attributes... do not rename classes") —
  no new element was created and no existing class definition was renamed.

### Not built, flagged instead
- A "Total" row (10px uppercase label + 22px amount) — the spec describes
  one, but the current confirm-summary has no total/price row at all today
  (it lists Activity, Grooming/Add-on if applicable, Duration, Date & Time,
  Riders, Status — no price). Adding one would mean a new
  `React.createElement` block, out of scope for a restyle.
- Heading copy tighten (optional per spec: "Almost done. Hit send in
  WhatsApp to confirm." vs the current longer sentence) — spec says apply
  only if wanted; left the copy as-is pending a decision.
- "Participant" vs "Riders" label consistency (optional per spec, flagged
  as possibly needing to be activity-aware for photoshoots) — left as-is
  pending a decision, per the spec's explicit "flag, do not silently
  change".
- Go-live data note: the WhatsApp number rendered on this screen
  (`+61 466 567 953`) is confirmed still the placeholder test number, per
  CLAUDE.md's existing open item. Not touched, since the spec explicitly
  calls this a data item, not a restyle edit.

### Testing
- 169 / 169 string assertions pass (13 new, locking in the restyled values)
- jsdom render passes with zero console errors
- Verified live in-browser end to end: completed a real booking through to
  the confirm screen, checked the summary card, the copy-box/copy-text
  split, the compact copy button, the "Make another booking" link styling,
  and the emoji removal (re-verified via direct server response after a
  dev-server restart interrupted the first live check).

## 16 Aug 2026 — Step 1 restyle (look only, no logic)

Restyled the `screen === "activity"` view per `docs/booking-engine-restyle-spec.md`
(a fuller spec superseding the step-2-only one, covering all three screens with
a shared token system). No behaviour changed: category filtering, activity
selection, and the Next button's `onClick` are untouched — verified by diffing
every touched class against the spec before editing.

- `.cat-tab`: switched from a dark-filled-when-active tab using ad-hoc colours
  (`rgba(0,0,0,.05)` fill, `#5c5c5c` text) to the shared pill pattern from the
  token system (white/fog unselected, earth/sand selected). The spec flagged
  this one element as unverifiable without Figma access ("VERIFY against the
  frame... If the frame uses filled tabs instead, use the shared pill
  pattern") and explicitly authorised this fallback for that case.
- `.cat-intro-text` padding bumped from 14/17px to the spec's ~18-20 range.
- `.act-card`: border 1.5px → 1px, padding went from a tight 14/16px to a
  more generous 20/18px per the spec's "calm and spacious" direction (no
  exact figure was given for this one; chose a value consistent with the
  padding scale already established elsewhere in the restyle).
- `.act-name` (activity title): 14px → 22px, matching the spec's card-heading
  size. Font family intentionally left untouched per the global rule to
  never change font family, only size/weight/colour/spacing.
- `.act-desc`: 12.5px/1.45 line-height → 14px/19.5px line-height per spec.
- `.price-tag` / `.pt-label` / `.pt-value`: flipped from a dark filled chip
  (`#1a1a1a` bg, white text) to a light, fully-round pill (`#f7f7f7` bg, fog
  border, dark text) — the same light-card direction as step 2's
  `price-reveal` flip in the previous entry.

### Not built, flagged instead
- "Activity image area" — the spec describes a placeholder image region in
  each card; the current DOM has no image element in `act-card` (only an
  emoji icon). Not built, since adding one would mean a new
  `React.createElement` block, which is out of scope for a restyle.
- "Book button in act-card" — the spec describes a per-card book button; the
  current DOM has no such element. The existing pattern is: the whole card
  is clickable (selects the activity, shows the `.act-check` checkmark), and
  a single global "Next" button in the `cta-dock` advances the screen. Left
  as-is.
- `.cat-intro` heading — the spec calls for an 18-22px heading inside the
  category intro card; the current DOM only has the body paragraph
  (`cat-intro-text`), no separate heading element. Padding was still bumped
  since that's a change to an existing element; no heading was added.
- Checked for decorative horse/hourglass/clipboard/checkmark emoji in
  headings and labels per the global rule — none exist in this screen's
  current headings (`t.chooseActivity`, category tab labels), so nothing to
  remove.

### Testing
- 156 / 156 string assertions pass (10 new, locking in the restyled values)
- jsdom render passes with zero console errors
- Verified live in-browser: category tabs, card sizing/spacing, price-tag
  flip, selected-card state (checkmark, border, fill) all unchanged in
  behaviour, changed in look only.

## 16 Aug 2026 — Step 2 restyle (look only, no logic)

Restyled the `screen === "riders"` view (step 2: configure + calendar, merged
in the previous pass) to match `docs/step2-restyle-spec.md`, a hand-written
token spec substituting for direct Figma access (hit the Figma MCP plan-level
rate limit for this file). No behaviour, state, handlers, or content changed —
verified by diffing every touched class against the spec before editing, and
by re-running the full test suite unchanged in count except for new assertions
added to lock in the restyled values.

- `.step-dot` / `.rider-card`: border width 1.5px → 1px per spec (only these
  two elements state an explicit border width). `.rider-card` padding changed
  from a flat 16px to the spec's asymmetric pt23/pb25/px16.5.
- `.pill`, `.field-pill`, `.text-input`: padding precision only (colours
  already matched the spec's tokens exactly, since this design system was
  already built on the same earth/clay/fog/dusk palette).
- `.cal-header` gained rounded top corners (14px), `.cal-legend` gained
  rounded bottom corners (14px) — previously the merged calendar block was a
  flat rectangle top-to-bottom; the spec calls for a single rounded card.
- `.cal-day.selected`: switched from a near-white `#ededed` fill with `#111`
  text to pure white with `#141414` text and a `rgba(255,255,255,.3)` border,
  per spec.
- `.time-card.selected .time-sub`: was 11px at 50% white opacity (hard to
  read against the dark selected background); now 14px at full `#f0f0f0`
  per spec.
- `.notes-area::placeholder`: colour `#b4b4b4` → `#999999`, explicit 11.5px
  size (previously inherited the input's 14px).
- `.price-reveal`: flipped from a solid dark (`#1a1a1a`) card with white text
  to a white card with a fog border, dark amount text, and the basis text
  (e.g. "IDR 2,250,000 × 2 horses") restyled as a small uppercase
  letter-spaced label, right-aligned opposite the amount. This is the
  biggest visual change in the pass; the underlying price text is unchanged,
  only its typography and the card's colours flipped.
- `.cta`, `.perm-row`/`.perm-box`, `.cal-grid`, `.notice`, `.act-category`,
  `.field-label`, `.rider-label` were checked against the spec and already
  matched — left untouched. `.cta` and `.step-dot` are shared with the
  activity and confirm screens; every other touched class is step-2-only,
  confirmed by grepping every `className` usage before editing.

### Not built, flagged instead (per the spec's own instruction to list, not build)
- The decorative image band behind the activity detail header — not present
  in the current DOM, header stays flat.
- A second booking-summary block on step 2 — that content lives only on the
  confirm screen; not duplicated here.
- The "cost-funds" block (`div.cat-intro-text` variant, 18px heading + 12.5px
  body, described as needing its leading emoji removed) has no matching
  element anywhere in the current step-2 DOM. `cat-intro-text` only exists on
  the activity screen's category intro blurb. Flagging rather than guessing
  which element this was meant to be.
- The numbering/emoji removal note ("1. Book a date and time", horse/hourglass/
  clipboard emoji) describes mock headings that don't exist in the current
  DOM at all — none of step 2's headings currently carry numerals or
  decorative emoji, so there was nothing to remove.

### Testing
- 146 / 146 string assertions pass (14 new, locking in the restyled values)
- jsdom render passes with zero console errors
- Verified live in-browser: price-reveal card flip, calendar rounded corners,
  selected-day and selected-time-card colours, notes placeholder. Activity
  and confirm screens spot-checked unchanged.

## 15 Aug 2026 — Merge calendar into step 2

Structural, customer-facing layout change only. Booking flow goes from 4 screens (activity, configure, calendar, confirm) to 3 (activity, configure+calendar, confirm).

- Removed the separate "calendar" screen. Its content (month grid, date/day selection, time slots, notes, send button) now renders directly beneath the configuration form on the same screen, appearing automatically once `detailsComplete` is true. No more "See availability" button and no in-between back-link; the single "← Back" at the top of step 2 covers the whole merged screen.
- Step indicator collapsed from 4 implied states to 3: activity (1), configure+calendar (2), confirm (3).
- All existing state-driven dependencies were preserved untouched, since they were never tied to which screen was rendering them: the Horse Whisperer Course's 4-day Mon/Tue/Thu/Fri picker and shared 8:30am/9:30am start-time choice, and every ride/lesson's duration-to-slot filtering, all still work exactly as before, just displayed inline instead of on a separate screen.
- The WhatsApp message sent to Simone is byte-for-byte unchanged (`buildWhatsAppMessage` was never touched; it doesn't depend on screen state).
- Kept as its own commit, separate from the copy/slot reconciliation commit, so it can be reverted independently if the merged layout doesn't work out.

### Testing
- 132 / 132 string assertions pass (5 new, locking in the merged structure and the absence of the old calendar screen/button)
- jsdom render passes with zero console errors
- Verified live in-browser end to end: Beach & Rice Field Ride (simple case) and Horse Whisperer Course (the riskiest case — 4-day picker, week constraint, per-day time choice) both complete correctly on the single merged screen, through to a real WhatsApp deep link with the message content unchanged from before the merge.

## 15 Aug 2026 — Notes copy update + ride slot reconciliation

- Reconciled the ride calendar slots against spec: Instagram ride 4:00pm (2hr) / 4:30pm (1.5hr) / 5:00pm (1hr), Beach & Rice Field ride 4:30pm (1.5hr) / 5:00pm (1hr). Checked the live code first rather than assuming; it already matched exactly, so no code change was needed here, just confirmation via `tests/assert.js`'s existing `RIDE_SLOTS` assertions.
- Replaced the notes-section helper text (heading unchanged: "Anything we should know? (optional)"). New helper, all three languages: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know below."

### Testing
- 127 / 127 string assertions pass
- jsdom render passes with zero console errors
- Verified live: Beach & Rice Field Ride (1hr) shows only the 5:00pm slot; new notes helper text renders correctly.

## 15 Aug 2026 — Wide operational rules pass: reorder, new activities, weight/wording changes

A large batch of changes across every category. Full detail below; see CLAUDE.md "Open items" for gaps that need Simone's input before they're complete.

### Global
- Universal weight cap changed 78kg → 77kg everywhere it appears (labels, warnings, group descriptions, code comments), across all three languages.
- Wording: "Sunrise" → "Morning", "Sunset" → "Golden hour" everywhere (intro text, activity descriptions), all three languages.
- Top-level category order swapped: Rides now comes before Photoshoots (Rides, Photoshoots, Lessons). Rides is the default-selected tab on load.

### Rides
- Replaced free morning/afternoon slot choice with one fixed start time per duration: 1hr → 5:00pm, 1.5hr → 4:30pm, 2hr → 4:00pm. No more 8:00am option.
- Insta Ride now offers all three durations (1hr / 1.5hr / 2hr), priced the same as Beach & Rice Field Ride (IDR 1,600,000 / 2,000,000 / 2,400,000), per Ro. Awaiting Simone's sign-off.
- Side effect: since the new ride slots are all afternoon and Saturday afternoons are closed, rides currently show zero availability on Saturdays. Confirmed acceptable by Ro (Horse Whisperer Course already has no Saturday availability).

### Photoshoots
- Beach Photoshoot now asks for weight (same 77kg cap, same UI as Rides), since riders mount a horse for that shoot. No other photoshoot asks for weight (confirmed with Ro; this was the one genuine ambiguity in the spec).
- Added "BYO Photographer or add a Salty Cowboys photographer" descriptor text to every photoshoot card and to the step-2 detail screen (all three languages). Descriptive only, no new selectable.
- Stable Photoshoot: removed the "one groomed horse" inclusion from its description; now just "team assistance included."
- Paddock Photoshoot: removed the rice field view mention from its description.
- Added a new Rice Field Photoshoot, cloned from Stable's config (same durations, pricing, group cap), with its own copy (given verbatim, translated to Indonesian and Russian).

### Lessons
- Renamed "Masterclass Horse Care (Grooming wet or dry)" → "Horse grooming (wet or dry)" in all three languages.
- Removed Lunge Lesson entirely (activity, pricing, copy, translations).
- Reordered to: Join Up, Horse Whisperer Course, Horse grooming, Group Clinic, Dressage Masterclass. (The new spec only named 4 lessons; Dressage was appended at the end per Ro's confirmation, since it wasn't otherwise mentioned.)
- Join Up and Horse grooming now share three fixed start times: 9:30am, 10:30am, 3:00pm (the old 5:00pm slot is gone). Horse grooming now offers 1.5hr too, priced at IDR 1,875,000 (1.5× the 1hr price), per Ro. Awaiting Simone's sign-off.
- Added a new Group Clinic lesson (the C31 leadership-through-horses copy): up to 6 people, 1.5hr fixed, IDR 6,000,000 flat per session, same three start times as Join Up/Horse grooming, no riding experience required.

### Horse Whisperer Course
- Restructured from 3 days (2 × 3hr + 1 × 3.5hr) to 4 days (three 3hr sessions + a closing 1hr session), 10 hours total, unchanged flat price of IDR 22,500,000.
- Bookable days restricted to Monday, Tuesday, Thursday, Friday only (no Wednesday, no Saturday), still inside a single week.
- Each of the four days uses the same shared 8:30am/9:30am start-time choice (matches the app's existing single-shared-time pattern for multi-day courses; not a per-day independent choice).
- Replaced the description with the new copy, explicit that it's open to all rider levels, no experience required.
- Removed "mucking out" from the inclusions text and removed the stale "2 x 3 hr sessions and 1 x 3.5hr sessions" line from the course note.

### Notes section
- Added "Times here not suitable? Let us know in the notes." as a hint above the notes textarea, across every bookable activity, all three languages.

### Main page
- Added a "Where the money goes" mission paragraph (given copy, translated to Indonesian and Russian) at the top of the initial activity screen, above "Choose an activity."

### Follow-up (same day): resolved pricing gaps
Ro supplied the missing prices flagged above:
- Insta Ride 1hr/1.5hr priced the same as Beach & Rice Field Ride (IDR 1,600,000 / 2,000,000), now offers all three durations.
- Horse grooming 1.5hr priced at 1.5× the 1hr price (IDR 1,875,000), now offers both durations.
- Rides having zero Saturday availability confirmed acceptable, no change needed.
Both prices are marked "awaiting Simone's sign-off" in CLAUDE.md, same as the other derived prices already on that list.

### Testing
- 127 / 127 string assertions pass (2 removed: they guarded placeholder values that were never real prices, superseded by the real ones above)
- jsdom render passes with zero console errors
- Verified live in-browser: category order, Beach Photoshoot weight selector, all 5 photoshoot cards, all 5 lesson cards in order, Horse Whisperer Course calendar correctly restricting to Mon/Tue/Thu/Fri, notes hint, money-goes banner.

## 9 Aug 2026 — Photographer add-on: three independent tick boxes

Changed the photographer add-on from a single checkbox (package auto-matched to shoot duration) to three separate, mutually exclusive tick boxes, one per tier. Customers now choose any tier regardless of the shoot's own duration. Applied identically across all four photoshoot types (Beach, Paddock, Stable, Cottages).

- Tiers unchanged: 1 hr / IDR 2,000,000 / 20 photos, 1.5 hr / IDR 3,000,000 / 30 photos, 2 hr / IDR 4,000,000 / 40 photos.
- Selecting a tick box now adds that tier's price into the total shown to the customer (previously the total never included the add-on price at all, regardless of selection, which was a bug).
- Ticking a second tier automatically unticks the first (radio-button behaviour via checkboxes).
- Price breakdown line and the booking confirmation summary both show which tier was picked.
- WhatsApp message to Simone states the tier chosen, independent of shoot duration.
- Removed the old "package matches your shoot duration" auto-behaviour and the 3 hr-to-2 hr cottage cap logic, since customers now pick freely among the three tiers on every shoot type (max available tier is still 2 hr / IDR 4,000,000).
- Follow-up: removed the duration prefix ("1 hr — ", etc.) from the tick box labels themselves, so each row now reads just "IDR 2,000,000 (20 photos)" and so on. Duration is still shown in the price breakdown, confirm summary, and WhatsApp message.

### Testing
- 64 / 64 string assertions pass
- jsdom render passes with zero console errors
- Verified live in-browser across Beach (1.5 hr, 2 horses), Cottages (3 hr session), and all three languages (EN/ID/RU): tick boxes render correctly, mutual exclusivity works, and total price updates as expected.

## 2 Aug 2026 — Simone's revised operational rules

Applied Simone's updated rules across the whole engine.

### Photoshoots
- **Beach shoot** switched to per-horse pricing (up to 2 horses). Group cap remains 3 people: 2 mounted + 1 standing.
- **Paddock and Stable** duration options extended to 1, 1.5, 2 or 3 hours. Time slots restricted to fixed morning (08:30-11:30) and afternoon (14:30-17:30) sessions.
- **Cottages** rebuilt as session pricing at IDR 4,500,000 per session (single 3 hr duration), max 6 people per cottage, choice upon availability. Copy updated to reflect interior shoot with no horse included.
- **Photographer add-on** expanded to three tiers: 1 hr / IDR 2,000,000 / 20 photos, 1.5 hr / IDR 3,000,000 / 30 photos, 2 hr / IDR 4,000,000 / 40 photos. Package length matches shoot duration automatically. 3 hr cottage sessions cap at the 2 hr package.

### Rides
- **Beach & Rice Field Ride** durations reduced to 1 or 1.5 hr (removed 2 hr option).
- **Insta Ride** locked to fixed 2 hr duration.

### Lessons
- **Horse Care Masterclass** reduced to 1 hr max.
- **Join Up** and **Lunge** reduced to 1 or 1.5 hr max, both switched to per-person pricing.
- **Horse Whisperer Course** now shows "one course booking per week" in the copy.

### Under the hood
- Added `SESSION_SLOTS` constant for the new morning/afternoon session windows.
- Added `PHOTOGRAPHER_TIERS` lookup for the tiered add-on pricing.
- Added `perHorse` and `perPerson` flags to the pricing calculation; existing `isRiding` logic unchanged.
- Added `horse` and `horses` translation keys in all three languages.
- WhatsApp message now spells out the actual photographer tier chosen.
- Retired the old "Customer Activities" sheet tab; "Customer Offerings" is the single source of truth.

### Still open
- Test WhatsApp number needs swapping for Simone's real number before go-live.
- Paddock and Stable 3 hr price (IDR 3,750,000) is derived from the +500,000 per 30 min pattern; awaiting Simone's sign-off.

### Testing
- 58 / 58 string assertions pass
- jsdom render passes with zero console errors
- Node syntax check on the extracted JS block passes
