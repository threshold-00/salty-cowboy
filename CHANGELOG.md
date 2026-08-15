# Changelog

All notable changes to the Salty Cowboys booking engine, most recent first.

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
