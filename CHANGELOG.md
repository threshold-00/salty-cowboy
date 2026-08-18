# Changelog

All notable changes to the Salty Cowboys booking engine, most recent first.

## 18 Aug 2026 — Batch 5, Commit 1: sitewide Futura

Per `docs/batch5-futura-headers-gate.md`, Commit 1. Presentation only, no logic touched.

The `.app` root rule (the site's base font, inherited by anything that does not set its own
`font-family`) switched from a hardcoded `'Outfit', sans-serif` to `var(--display)`, the same
Futura-first token already used by headings. Nine other selectors that separately hardcoded
`font-family: 'Outfit', sans-serif` (`.lang-btn`, `.date-chip`, `.cat-tab`, `.act-book-btn`,
`.notes-area`, `.copy-btn`, `.reset-link`, `.wa-btn`, and the unused `.ww-btn`) were switched to the
same token, so the whole site now reads in one family.

The time-slot card was the specific exception named in the doc: it never declared its own
`font-family`, so it was inheriting Outfit from `.app` (500 weight on the time, default 400 on the
duration sublabel). Changing `.app` to Futura carries the time-slot card along automatically, with
both weights untouched, exactly matching "keep the existing weight per role, only the family
changes." Verified live: computed `font-family` on `.time-main`/`.time-sub` is now Futura, weights
still 500/400.

Grepped for every remaining `font-family: 'Outfit'` declaration: none remain. The `--display`
token itself still lists `'Century Gothic'` and `'Outfit'` as fallbacks after Futura (the doc's own
named exception), and the Google Fonts import for Outfit stays, since the token still points to it
as a fallback face. One deliberate exclusion, flagged here for approval: the pre-hydration `#loading`
splash screen ("Salty Cowboys" in italic Georgia serif) was left untouched. It renders from a
separate inline `<style>` block in `<head>`, before the app's own stylesheet (and its `--display`
token) exists, so it cannot reference the token, and it reads as a deliberate one-off flourish
rather than app content. Flagging in case the intent was for it to be included too.

18 new/updated assertions (nine converted selectors, the `.app` base rule, the reversed time-slot
card exception, the Outfit-import and token-fallback checks, and the `#loading` exclusion).
377/377 assertions and the jsdom smoke test pass.

## 18 Aug 2026 — Batch 4, Commit 1: Step 1 cleanup (two deletions)

Per `docs/batch4-step1-cleanup-accordions.md`, Commit 1. Deletions only, Step 1 (the activity
picker) only.

Removed the dark "Where the money goes" mission-statement card from the top of Step 1. Confirmed
first that it and Step 2's own "What your booking cost funds" card are separate instances (Step 1
used `moneyGoesTitle` + `moneyGoesBody`, Step 2 uses `costFundsTitle` + the same `moneyGoesBody`
text) before deleting, so Step 2's card and its copy are untouched. `moneyGoesTitle` is now removed
as dead code (was Step 1 only); `moneyGoesBody` stays, since Step 2 still reads it.

Removed the floating "Next" bar at the bottom of Step 1. Verified in the source first that each
activity card's "Book →" button is a strict superset of what tapping a card then Next used to do:
Book sets the activity, resets every dependent field, and advances to Step 2 in one click, while
Next only advanced the screen and depended on a card having already been tapped. Nothing was unique
to Next, so it was safe to delete outright, including its now-dead `cta-dock`/`has-dock` CSS and
the `next` translation key in all three languages. Tapping a card to preview/select it before
booking still works exactly as before, only the redundant bottom button is gone.

With the dark card gone, the "Choose an activity" heading now sits directly on the page background
inside a plain `body fu` wrapper (no residual card styling was found around it, so no extra
flattening was needed).

Confirmed the WhatsApp flow is not reachable from Step 1, so neither deletion could touch the
payload. 15 new assertions added (deletions, dead-CSS/dead-key removal, "Book →" as the sole
navigation path, tap-to-select preserved). 363/363 assertions and the jsdom smoke test pass.
Verified live: no dark card, no bottom bar, "Book →" still lands on Step 2 with Step 2's own
cost-funds card intact.

## 18 Aug 2026 — Batch 4, Commit 2: manual toggle on the Step 2 accordions (#3)

Per `docs/batch4-step1-cleanup-accordions.md`, Commit 2 only (Commit 1, the Step 1 activity-picker
cleanup, was not requested and was not touched). Builds directly on the progression-driven
accordions from Batch 3, Commit 5.

Sections "1. Book a date and time" and "2. Who's coming?" were collapse-only before: once
complete, a customer had no way back in short of clearing a field. Now each numbered heading is
clickable once its section is complete, with a small arrow (▾ collapsed, ▴ open) as the affordance,
and the collapsed one-line summary is itself clickable too. Clicking either toggles the section
open or closed. Two new pieces of state do this: `section1ManualOpen` and `section2ManualOpen`,
both plain booleans defaulting to `false`. The existing `section1Complete`/`detailsComplete` flags
were not duplicated, just combined with the manual flag: `section1Collapsed = section1Complete &&
!section1ManualOpen` (same pattern for section 2). Clearing a required field still forces the
section back open regardless of the manual flag, since `Complete` alone goes false.

Section 3 ("Your booking summary") was left as-is, not wrapped in a collapsible header. It has
nothing after it to progress into and collapsing it would hide the Send button and total cost, so
per the spec's own "use judgement" allowance it stays permanently open.

Payload safety: reused the existing pre-accordion baseline from Batch 3, Commit 5 (an even earlier,
stricter checkpoint than "pre-Commit-2", since Batch 3's own accordion work is also still
uncommitted and git has no boundary between the two) rather than capturing a fresh one, since the
underlying `buildWhatsAppMessage`/`handleSend` code was not touched by this commit at all, only new
UI toggle state and `display` styling were added. Verified live: filled the same Beach Photoshoot
booking (2 riders, weights, photographer add-on, notes), collapsed section 1 via progression,
manually reopened it, confirmed all fields (duration, date, time) were exactly as entered, manually
recollapsed it, repeated the same reopen/verify/recollapse cycle for section 2 (riders, weights,
photographer add-on all intact), then sent. Resulting WhatsApp payload is byte-for-byte identical
to the baseline (same MD5 hash, `6a0f0e91e844987796fe1d1c918e6ea2`). Also re-verified the Horse
Whisperer Course's multi-day picker survives a manual reopen/recollapse with all 4 selected days and
the shared start time intact.

11 new assertions added covering the manual-toggle state, the reused completion flags (no parallel
completeness system), and the clickable-heading markup. 353/353 assertions and the jsdom smoke test
both pass.

## 18 Aug 2026 — Batch 3, Commit 5: progression-driven accordions (#3)

Per `docs/step2-batch3.md`, Commit 5, the last and most reversion-sensitive commit in the batch.
Sections "1. Book a date and time" and "2. Who's coming?" now collapse to a one-line summary once
the user finishes them (a new `section1Complete` flag for section 1, reusing `detailsComplete` for
section 2), instead of staying open for the rest of the booking. No manual click-toggle was added;
collapse is entirely driven by existing state.

Payload safety was verified before writing any collapse logic: `buildWhatsAppMessage` and
`handleSend` read only from React state (named params like `formattedDates`, `selectedTime`,
`numPeople`, `riders`), never the DOM, so collapsed sections could not blank out the WhatsApp
message. Collapsed sections are CSS-hidden (`display: none`), not unmounted, so their state stays
live and editable data is never lost. Confirmed live: filled a complete Beach Photoshoot booking
(2 riders, weights, photographer add-on, notes), collapsed both sections through normal
progression, sent, and compared the resulting WhatsApp payload against a pre-accordion baseline.
Byte-for-byte identical (same MD5 hash).

While verifying the Horse Whisperer Course (which has no `duration` value, only a flat price), the
new section 1 summary line was found to render a literal `"null · "` prefix. Fixed by filtering out
falsy parts (`[duration, formattedDates.join(" · "), selectedTime].filter(Boolean).join(" · ")`)
before joining, so the course now shows a clean date/time-only summary. Re-verified live after the
fix.

14 new assertions added covering the collapse mechanism, the state-not-DOM payload guarantee, and
the null-duration summary fix. 342/342 assertions and the jsdom smoke test both pass.

## 18 Aug 2026 — BYO Photographer chip revised to a hairline treatment

Follow-up to Commit 2's dark filled chip, per Ro: too visually loud. `.byo-chip` now uses a thin
`1px solid var(--fog)` border, white fill, dark text, same padding, radius, and pill shape as
before, just quieter. Verified live via computed styles.

## 18 Aug 2026 — Batch 3, Commit 3: header image band (#1)

Per `docs/step2-batch3.md`, Commit 3, isolated per the doc's own instruction. Two decisions the
doc flagged as open were resolved with Ro before building:

- **Image source**: the doc wants a per-activity header image, but only 3 category-level images
  exist (`IMG_RIDES`/`IMG_PHOTOSHOOTS`/`IMG_LESSONS`), no true per-activity set. Per Ro, shipped
  the placeholder path now rather than reusing the category images as a stand-in: a plain grey
  box (`.detail-header-image`, matching the same `var(--fog)` placeholder pattern Commit A used
  for the Step 1 activity card images), 269px tall, full width. Swapping in real per-activity
  images later is a data/asset task, not a code change, once they exist.
- **Card overlap**: per Ro, the white text card overlaps the image's lower edge rather than
  sitting flush below it (`margin-top: -48px` on `.detail-header-card`, pulling it up over the
  image in normal document flow, no `position`/`z-index` needed since it's simply the later
  sibling painting on top). This is the "text-on-card-on-image, not text-on-image" structure
  the doc calls for, so the card needs no scrim of its own, it's opaque white sitting over the
  image, not translucent text directly on it.
- **Back control**: restyled from a bare text link to a small bordered pill button (`1px solid
  var(--earth)` border, white fill, 20px radius, `rgba(0,0,0,0.05)` hover tint), replacing the
  old dusk-colour-that-darkens-on-hover text-link treatment. Verified it's still a real button,
  clicking it still calls `setScreen("activity")` and returns to Step 1.

`.detail-header-image` is a new direct sibling inserted before `.detail-header-card`, no extra
wrapper div needed since both already live as flat children of the Step 2 body.

Business rules: none, presentational. Verified live via `getBoundingClientRect`: image spans
269px (48 to 317), card starts at 269 (exactly 48px up from the image's bottom edge, confirming
the overlap), both card and image share the same 623px column left edge as everything else on
Step 2. Confirmed the BYO Photographer chip from Commit 2 still renders correctly beneath the
new header on photoshoot activities.

### Testing
- 328 / 328 string assertions pass (5 new, 3 rewritten for the new CSS)
- jsdom render passes with zero console errors

## 18 Aug 2026 — Batch 3, Commit 2: BYO Photographer line as a static filled chip (#2)

Per `docs/step2-batch3.md`, Commit 2, with Ro's override on the visual: a filled chip matching
the selected-pill treatment, not an eyebrow label, and not a button since it isn't interactive.

- New `.byo-chip` class: same fill, text colour, radius, padding and font as a selected `.pill`
  (`background: var(--earth)`, `color: var(--sand)`, 24px radius, 9.5px/16.5px padding, Futura
  500 13px), but with no `cursor: pointer` and no hover state, since it's a static label, not a
  selectable control. Rendered as a `<span>`, not a `<button>`, no `onClick`.
- Replaces the `<p className="section-hint">` treatment the line had after the styling-parity
  pass. Same conditional (`isPhotoshoot &&`), same position in the flow (between the header
  card and "1. Book a date and time"), so rides and lessons still never render it.
- Spacing was already correct going into this commit: the styling-parity pass had already
  removed the old negative-margin jam-against-the-heading hack and given the line a real 22px
  slot. Kept that same 22px trailing margin on the new chip so the rhythm is unbroken.

Business rules: none. Confirmed the chip still only renders for photoshoot activities, not
rides, same as before.

### Testing
- 323 / 323 string assertions pass (7 new, 1 rewritten for the markup change)
- jsdom render passes with zero console errors

## 18 Aug 2026 — Batch 3, Commit 1: duration label spacing (#4)

Per `docs/step2-batch3.md`, Commit 1 only (spacing fixes #4 and #6). Mechanical, no logic.

Checked both items live before touching anything, since the styling-parity commit earlier
today already covers most of this ground:

- **#4 duration card**: padding (23px top, 25px bottom, 16.5px sides) and the label's left
  inset already matched the spec exactly, confirmed via `getBoundingClientRect` (label and
  pill row both start at the same left edge). The one real gap: the "DURATION" label sat 10px
  above its pill row, spec wants 14px. Fixed by adding `marginBottom: 14` to that one label's
  inline style. Scoped to the duration label specifically, not the shared `.act-category`
  class, since that class also drives the Number of people, grooming, time slot, and notes
  labels, none of which this commit touches.
- **#6 cost-funds alignment**: already correct. The `.step2-block` mechanism added in the
  styling-parity commit already aligns it with the WhatsApp button and every other Step 2
  card. Verified live: `.cta`, `.detail-header-card`, and `.cost-funds-title` all measure the
  same 623px left edge (`.cta` and `.detail-header-card` at 623 exactly, `.cost-funds-title` at
  624, a 1px rounding artefact). No code change was needed, confirmed rather than assumed.

Business rules: none, presentation only. Commits 2 to 5 of this batch (BYO label, header image
band, restoring #5/#7, and the accordion rework) are out of scope for this pass and were not
touched.

### Testing
- 318 / 318 string assertions pass (3 new)
- jsdom render passes with zero console errors
- Verified live via `getBoundingClientRect` before and after the change

## 18 Aug 2026 — Commit D: em-dash cleanup and decorative emoji removal

Per `docs/booking-engine-structural-spec.md`, Commit D, the last of that structural batch. The
doc originally named 3 known em-dash spots; a full sweep found many more that had crept in
since, so this pass covers every em-dash in user-facing copy, not just the 3 originals.

### Em-dashes (standing CLAUDE.md rule: never use them anywhere in code, copy, prose, or commits)
Swept all three languages plus the WhatsApp message builder and the HTML meta description.
Replaced each with whichever of a period, comma, or light rewrite read best in context:

- Step 3's "WhatsApp has opened..." heading, in all three languages
- Several activity descriptions (Insta Ride, Dressage Masterclass, Join Up, Horse Grooming
  Masterclass, Beach Photoshoot, Group Clinic, the Photoshoots category intro) across en/id/ru
- The HTML `<meta name="description">` tag
- The WhatsApp message builder: the message title, the rider tag-list separator, the
  over-70kg warning line, and the empty-notes placeholder (was a bare em-dash, now reads
  "None")

Left code comments untouched. The task's own scope is "copy," and comments aren't user or
Simone-facing; flagging in case a stricter reading is wanted.

### Decorative emoji
- Removed the flower emoji (🌺) and its wrapping `.confirm-icon` div from the Step 3 confirm
  screen, plus the now-dead `.confirm-icon` CSS rule. `.confirm-title` sits first in the card
  now, `.confirm-screen`'s existing 36px top padding already reads fine without an icon above
  it.
- Removed the seedling-equivalent leaf emoji (🌿) from the Step 2 WhatsApp-confirmation notice.
  It now renders just the text, no icon span.
- Removed the `icon:` field from all 12 entries in the `ACTIVITIES` data (the wave, sunrise,
  and other per-activity emoji). Confirmed dead code first: neither `actObj.icon` nor
  `item.icon` was read anywhere in the render tree, both Commit A's card rebuild and the Figma
  parity batch's header restyle had already removed every call site that used to display them.
  Matches Ro's earlier confirmation to remove per-activity icons too, not just the two
  originally-named decorative spots.
- Functional emoji were left alone: the WhatsApp message's 🐴 title marker and ⚠️ warning, and
  the weight-warning callouts on the riders screen. These signal information to Simone or the
  booker, they aren't decorative.

Business rules: none, copy and presentation only.

### Testing
- 315 / 315 string assertions pass (16 new, 12 rewritten for the removed icon field and
  em-dashes)
- jsdom render passes with zero console errors

## 18 Aug 2026 — Styling parity sub-steps 2+3: one 22px rhythm, one 623px column

Per `docs/step2-styling-parity.md`, sub-steps 2 and 3, done together per Ro's direction: no
per-element nudging, one systematic fix for spacing and one for alignment. Presentation only,
no logic, no copy, no reorder.

### Vertical rhythm: one 22px gap, no per-element margins
Every Step 2 block that used to carry its own ad hoc margin (18px, 16px, 12px, 20px, or a
negative-margin hack to fake tight spacing) now uses the same `margin-bottom: 22px`. Fixed
directly on their own CSS class where that class is Step-2-exclusive (`.detail-header-card`,
`.section-hint`, `.control-card`, `.rider-card`, `.cal-selection-panel`, `.addon-group`,
`.notes-area`, `.notice`, `.price-reveal`). Where the class is shared with Step 1 or Step 3
(`.cta`, `.confirm-summary`, `.fu2`), the 22px was added as a scoped inline style on that one
Step 2 element instead, so nothing outside Step 2 shifted.

- **The BYO Photographer line** (flagged specifically): removed the `marginTop: -10,
  marginBottom: 4` hack that jammed it against the header card above and the next heading
  below. It now sits in `.section-hint`'s normal flow, getting the same real 22px above and
  below as everything else. Same fix applied to the Horse Whisperer course hint, which used
  the identical hack.
- Removed the `marginTop: -6` hack on the date/time hint and the `margin: -6px 0 8px` hack on
  the notes hint (the latter kept a small heading-to-hint gap, since it isn't a between-block
  gap, just no longer negative).
- Removed the inline `marginTop: 24` nudges on section headings 2 and 3. They no longer need
  their own spacing since the block before each of them now carries the trailing 22px.
- The calendar's own internal pieces (header, grid, legend) are untouched and still flush
  against each other, they're one continuous dark card in the frame. The trailing 22px sits on
  `.cal-selection-panel` (the date readout and time slot area below the dark card), which is
  the block that's actually last.
- Card padding for duration, number-of-people, and participant details unified to `23px top,
  25px bottom, 16.5px sides` (`.control-card` now matches `.rider-card`, which already had the
  right values). Other cards (header, summary, notes, time-slot) keep their own
  already-documented padding, not touched.

### Alignment: one 623px column
Steps 1 and 3 share a `.main > * { max-width: 660px }` rule. Rather than change that shared
rule (which would also resize Step 1 and Step 3, out of scope), added a more specific override
`.main > .step2-block { max-width: 671px }` and tagged Step 2's three top-level blocks (details,
summary/total/notes/Send/notice, cost-funds) with that class. 671 = 623 + the existing 24px side
padding on each side (already global via `box-sizing: border-box`), so Step 2's cards land at
exactly 623px content width without touching Step 1 or Step 3's shared 660px rule.

Business rules: none, presentation only.

### Testing
- 300 / 300 string assertions pass (24 new, 15 rewritten for the removed inline margins and
  new classes)
- jsdom render passes with zero console errors
- Verified live via `getBoundingClientRect`: `.detail-header-card`, `.section-hint`,
  `.rider-card`, `.confirm-summary`, `.price-reveal`, `.notes-area`, `.cta`, `.notice` all
  measured `left: 439, width: 623, margin-bottom: 22px` on a completed Beach & Rice Field Ride
  booking, desktop viewport. Confirmed the BYO Photographer line on the Beach Photoshoot now
  reads with visible space above and below it, not jammed against the header card or the
  "1. Book a date and time" heading.

## 18 Aug 2026 — Styling parity sub-step 1: Futura weight 500 across Step 2

Per `docs/step2-styling-parity.md`, sub-step 1 only. Font family and weight only, nothing else.
No size, colour, letter-spacing, line-height, spacing, or logic touched.

### Token check (done first, as asked)
Confirmed live before making any change: `--display` resolves to `'Futura', 'Century Gothic',
'Outfit', sans-serif`, and the browser genuinely renders Futura (not a silent fallback). Checked
via `document.fonts.check('16px Futura')` (true) and a canvas text-width comparison: Futura
measured 274.2px for a test string, distinctly different from Outfit (252.5px), Cormorant
Garamond (244.9px, the old pre-session token), and a generic fallback (266.8px). The token is
correct and was already resolving to real Futura before this commit.

### What was actually wrong
Two separate kinds of drift, both invisible until checked:
1. **Missing weight.** Several rules set `font-family: var(--display)` but never set
   `font-weight`, so headings rendered at the browser's bold default for `h2`/`h3` (700), or
   inherited a stray 600 (`.price-reveal-value`, `.cal-day`'s 400 in the other direction).
2. **Missing family.** Many Step 2 text roles (labels, pills, field values, summary rows, back
   link, description, notes placeholder, confirmation note, cost-funds copy) never set
   `font-family` at all, so they silently inherited `.app`'s base `'Outfit', sans-serif` instead
   of Futura.

### Change
Added `font-family: var(--display); font-weight: 500;` (or just the missing one of the two)
to every Step 2 text role: activity title, section headings 1/2/3, activity description, back
link, eyebrow labels (Duration, Number of people, Participant details, Time slot, Total cost),
field labels, field input values, duration/people pills, weight/experience pills, date readout,
calendar month, calendar weekday, calendar day number, calendar legend, summary row label and
value, Edit link, Total cost label and value, notes placeholder, consent checkbox text,
confirmation note, cost-funds heading and paragraph, WhatsApp button.

`.sum-key` / `.sum-val` are shared with the Step 3 confirm screen's own summary, so that screen
picks up the same fix, consistent rather than a scope violation.

### Left alone, confirmed correct already
- `.time-main` (time-slot time value): stays Outfit, already weight 500. Unedited.
- `.time-sub` (time-slot duration sublabel): stays Outfit, no explicit weight, defaults to 400.
  Unedited. These are the spec's two named exceptions.
- Everything not named in the spec's type-scale table (`.notes-time-hint`, `.days-count`,
  `.date-chip`, `.cat-tab`, Step 1's `.act-name`/`.act-price`/price-tag chips, the sidebar) was
  left untouched. Flagging this: if any of these should also move to Futura 500, say so and
  I will fold it into this same commit before it's finalised.

Business rules: none, presentation only.

### Testing
- 276 / 276 string assertions pass (26 new, 4 rewritten for the added properties)
- jsdom render passes with zero console errors
- Verified live via computed styles: `.section-title`, `.act-category`, `.pill`, `.text-input`,
  `.back-link`, `.detail-desc`, `.cal-month`, `.field-label`, `.notice`, `.hint-link` all read
  `Futura, "Century Gothic", Outfit, sans-serif` at `font-weight: 500`. `.time-main` reads
  `Outfit, sans-serif` at `500`, `.time-sub` reads `Outfit, sans-serif` at `400`, both unchanged
  from before this commit.

## 18 Aug 2026 — Figma parity batch, Commit 5: Step 2 price and summary reorder (isolated)

Per `docs/step2-figma-parity-batch.md`, Commit 5, the risky one. Kept isolated and
independently revertible from Commits 1-4, per the spec's own instruction. Reorders the tail of
Step 2 (everything gated on `datesComplete`) and touches the price display, but no pricing
math, WhatsApp payload, or any other business rule changed.

New order inside the datesComplete-gated block: "3. Your booking summary" (with Edit link,
Total row removed), TOTAL COST, notes, Send, confirmation notice. The participant details card
itself did not move, it was already correctly positioned in section 2 from earlier commits this
session.

- **Summary table**: removed the inline Total row (`sTotal`). Total now lives only in the
  TOTAL COST block below the table. Added an "Edit" link (new key `editLink`) inside the
  summary card, right-aligned below Status. Its `onClick` is `window.scrollTo({top:0,
  behavior:"smooth"})`, nothing else. No handler was invented beyond that: the spec described
  a visual element ("add the Edit link") without specifying behavior, and scroll-to-top is the
  most conservative interpretation, since Step 2 already has every field on-screen for editing.
  Flagging this interpretation in case a different behavior was intended.
- **Price block**: relabeled from a bare value to a "TOTAL COST" label + value pair (new key
  `totalCostLabel`), matching what an earlier restyle spec had already called for but never
  actually implemented. Dropped the `IDR 1,600,000 x 1 PERSON` breakdown line entirely, per the
  spec ("show value only"). `.price-reveal-basis` CSS and the `priceBasis` computation it
  displayed are both removed as dead code, since nothing else read `priceBasis` (confirmed it
  was never passed into `buildWhatsAppMessage`).
- **Position**: the summary table moved from the very bottom of the gated block to directly
  under its own heading (now first), and the TOTAL COST block moved from section 2 (right after
  the participant/addon cards) to directly after the summary table in section 3.
- **Notice**: the "your selected date and time will be confirmed via WhatsApp" note moved from
  before the summary to after the Send button, now the last element in the gated block, right
  before the always-visible cost-funds card from Commit 4.

### Business-rules assessment (per the spec's own instruction)
- `totalPrice` / `totalPriceStr` computation is byte-for-byte unchanged, only where it renders
  moved. Confirmed no other total is computed anywhere.
- `handleSend`'s `buildWhatsAppMessage(...)` call and every field passed into it are unchanged.
  The reorder only touches display order inside the riders screen; it does not touch what gets
  sent to Simone.
- Confirmed `priceBasis` was genuinely dead (not referenced by the WhatsApp message) before
  removing it, rather than assuming.

### Testing
- 249 / 249 string assertions pass (12 new, 9 rewritten for the new order)
- jsdom render passes with zero console errors
- Verified live: summary card shows Activity/Duration/Date & time/Participant/Status with no
  Total row and an Edit link, TOTAL COST block sits directly below it labelled correctly, Send
  stays disabled until every field is complete then enables, notice appears after Send, and the
  always-visible cost-funds card from Commit 4 still sits at the very bottom.

## 18 Aug 2026 — Figma parity batch, Commit 4: Step 2 cost-funds section

Per `docs/step2-figma-parity-batch.md`, Commit 4. Additive, self-contained, static content.

- Added a "What your booking cost funds" card to the bottom of Step 2, after the WhatsApp Send
  button, always visible on the riders screen regardless of booking progress (mirrors how Step
  1's "Where the money goes" card is always visible, not tied to any selection). New key
  `costFundsTitle`.
- Body copy reuses the existing `moneyGoesBody` translation key rather than duplicating it: the
  Figma text quoted in diff #19 is word-for-word identical to what Step 1 already shows.
- Styled as a light card (`#f7f7f7` background, bordered), not the dark card Step 1 uses, so it
  reads as part of Step 2's now-consistently-light layout rather than a jarring dark block.
- Declined the `[horse]` emoji prefix shown in the spec's heading text, consistent with the
  no-decorative-emoji decision from Commit 1 of this same batch. Flagging back rather than
  silently applying: if the Figma frame is authoritative here, say so and I'll add it.

Business rules: none, static content.

### Testing
- 234 / 234 string assertions pass (7 new)
- jsdom render passes with zero console errors

## 18 Aug 2026 — Figma parity batch, Commit 3: Step 2 activity header

Per `docs/step2-figma-parity-batch.md`, Commit 3. Self-contained restructure of the header card
at the top of Step 2. Presentational only.

- Replaced `.detail-header-band` (the dark category-photo hero with white text, added earlier
  this session in Commit B) with `.detail-header-card`: a plain light card, white background,
  1px `var(--fog)` border, matching the bordered-card look used everywhere else on this screen.
  Per Ro's explicit confirmation, since this directly reverses recently-built work.
- The activity description now lives inside this same card, directly under the title, instead
  of in a separate `.detail-intro` block right below it. Its leading wave/sunrise emoji
  (`.detail-emoji`, `actObj.icon`) was dropped per the spec.
- `.detail-intro` and `.detail-emoji` CSS rules removed as dead code once nothing referenced
  them. `IMG_PHOTOSHOOTS` / `IMG_RIDES` / `IMG_LESSONS` and `actCategory` are untouched, they're
  still used by Step 1's category intro photo and the rider/person noun logic.

Business rules: none, presentational only.

### Testing
- 227 / 227 string assertions pass (6 new, 3 rewritten to confirm the old band is gone)
- jsdom render passes with zero console errors

## 18 Aug 2026 — Figma parity batch, Commit 2: Step 2 card containers

Per `docs/step2-figma-parity-batch.md`, Commit 2. Wraps three controls that previously floated
directly on white to match Figma's bordered-card look. Styling only, no logic touched.

- New `.control-card` class (white background, 1px `var(--fog)` border, 14px radius, matching
  the existing `.rider-card` treatment already used further down the same screen) applied to
  the duration selector and the number-of-people selector. Grooming's selector (wet/dry) was
  left alone since it wasn't named in the spec's three targets.
- `.sel-title` (the single selected-date readout, e.g. "May 4, 2026") now renders as a bordered
  field: white background, 1px border, 10px radius, padding, instead of plain text. Font size
  trimmed from 18px to 16px so it reads as a field value rather than a heading.

Business rules: none, presentational only.

### Testing
- 222 / 222 string assertions pass (5 new, 2 rewritten for the new class names)
- jsdom render passes with zero console errors
- Verified live: both control cards and the date-readout field render with visible borders,
  duration and number-of-people selection still work, grooming's own selector is unaffected.

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
