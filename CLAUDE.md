# Salty Cowboys Booking Engine

Front-end booking engine for Salty Cowboys Bali, a horse rescue sanctuary and riding centre run by director Simone. Streamlines Simone's booking intake (previously WhatsApp/email/Instagram DMs) without disrupting her workflow. Simone approves all bookings on WhatsApp and is the source of truth for pricing and operational rules.

## Repo & file layout

```
/
├── index.html          # the app (single file, no build step)
├── CLAUDE.md           # this file
├── CHANGELOG.md        # dated list of shipped changes
├── tests/
│   ├── assert.js       # string-based assertion suite
│   ├── smoke.js        # jsdom render check
│   └── package.json    # test dependencies
└── .github/workflows/
    └── test.yml        # CI: runs tests on every push
```

**Deploy:** GitHub Pages serves `main` at `pursuit-098.github.io/salty-cowboys`. Every push to `main` deploys automatically. No build step, no bundler, no framework config.

**Site tech:** React 18 UMD is inlined at the top of `index.html`; JSX is pre-compiled to `React.createElement` calls (no runtime Babel). All styles are in a single `<style>` block. Trilingual UI (English, Indonesian, Russian). The WhatsApp message sent to Simone is always English so she can read every request consistently.

**Booking flow (3 steps):** 1) choose activity, 2) configure (duration, people, rider details, weight/experience/photographer as applicable) **and** pick a calendar date + time slot + notes, all on one scrollable screen, 3) confirmation. There is no separate calendar screen; both the "1. Book a date and time" and "2. Who's coming?" sections render unconditionally on Step 2 (no button click needed to reveal them). This applies uniformly, including the Horse Whisperer Course's 3-day picker and per-duration ride slot filtering, both of which are driven by component state rather than by screen.

**Step 2 accordions (progression-driven, manually toggleable):** sections "1. Book a date and time" and "2. Who's coming?" each collapse to a one-line summary once their own completion state is true (`section1Complete` = date(s) + time picked; `detailsComplete` = duration + numPeople + grooming-if-needed + all rider fields valid), and can be manually reopened and re-collapsed by clicking the numbered heading (shows a ▾/▴ arrow once clickable) or the collapsed summary line itself. Two small booleans, `section1ManualOpen` and `section2ManualOpen`, track only the manual override; the actual collapsed state is `section1Complete && !section1ManualOpen` (same pattern for section 2), so there is no parallel completeness system, and clearing a required field always forces the section back open regardless of the manual flag. This is purely presentational, CSS-hide (`display: none`) not unmount. `buildWhatsAppMessage`/`handleSend` read exclusively from React state, never the DOM, so collapsing or reopening a section can never blank a field out of the WhatsApp payload. The collapsed summary line filters out `duration` when it is null (Horse Whisperer Course has no duration selector) so it never prints the literal string "null". Section 3 ("Your booking summary") is not collapsible: it has no further step to progress into, and hiding it would hide the Send button and total cost.
**Companion data:** Google Sheet `1EJyp5EWQMLGXz3hOWc5_UK8_pNUdkjoer4Yi9GvYFAE`, "Customer Offerings" tab. This is Simone's human-readable source of truth. When code business rules change, generate a TSV paste block for Ro to paste into the sheet so both stay aligned.

## Conventions (non-negotiable)

- **Never use em-dashes** anywhere in code, copy, prose responses, or commits. Applies across all three languages.
- **Prefer targeted patches over full-file rewrites.** Use `str_replace` style edits, not overwrites.
- **Batch clarifying questions upfront** with recommended defaults. Do not proceed mid-task on unconfirmed assumptions. Fold confirmations into both `index.html` and `CHANGELOG.md` in the same pass.
- **Validate every change before delivering:** run `tests/assert.js` and `tests/smoke.js`. Both must pass.
- **All prices are IDR.**
- **WhatsApp messages are always English** regardless of the UI language the user has selected.
- **Ro's preferred deliverable format:** an updated file plus a matching TSV paste block for the sheet, plus a CHANGELOG.md entry summarising what shifted and why.

## Default change workflow (automatic, no need to ask)

For every spec or pricing change, always do ALL of the following steps in order without being prompted:

1. **Edit `index.html`** with the required code change (targeted patch, not a rewrite).
2. **Update `tests/assert.js`** so assertions reflect the new spec.
3. **Update the "Business rules" section of this file** to match the new spec.
4. **Prepend a dated entry to `CHANGELOG.md`** summarising what changed and why.
5. **Generate a fresh `customer-offerings.tsv` paste block** covering all current offerings, ready for Ro to paste into the Google Sheet "Customer Offerings" tab.
6. **Run both tests** (`node tests/assert.js` and `node tests/smoke.js`). Stop and report if either fails; do not continue.
7. **Show a summary** of all changes made and wait for Ro's explicit approval before running `git commit` and `git push`.

## Commands

```bash
# Install test deps (once)
cd tests && npm install

# Run tests
node tests/assert.js     # string assertions
node tests/smoke.js      # jsdom render check
node --check /dev/stdin < <(node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script>[\s\S]*?<\/script>[\s\S]*?<script>[\s\S]*?<\/script>[\s\S]*?<script>([\s\S]*?)<\/script>/); process.stdout.write(m[1])")
```

## Business rules (current, as of last CHANGELOG entry)

**Top-level order:** Rides, Photoshoots, Lessons (in that tab order; Rides is the default-selected category on load).

**Universal weight cap: 75 kg** (blanket max, max 2 riders/mounted people over 70 kg). Applies to every riding activity (Beach & Rice Field Ride, Insta Ride, Dressage Masterclass) and to Beach Photoshoot (the only photoshoot where riders mount a horse). No other photoshoot, and no ground-based lesson, asks for weight.

**Wording:** "Morning" and "Golden hour" (not Sunrise/Sunset) used everywhere the time-of-day is mentioned, in all three languages.

**Calendar range:** the Step 2 date picker opens on the real current month (derived from `new Date()`, not a hardcoded month), and every date before today is unavailable and unclickable, same greyed-out treatment as a closed Sunday. Today itself is bookable. The "‹" prev-month arrow disables once the calendar is already showing the current month, so there is no way to page back into a fully-past month either. Applies uniformly across every activity, including the Horse Whisperer Course's multi-day picker.

### Photoshoots

| Shoot | Duration | Pricing | Time slots | Group cap |
|---|---|---|---|---|
| Beach | 1 or 1.5 hr | Per horse per hour (IDR 1,750,000 / 2,250,000) | Any start 08:00 to 16:00 | 3 people (2 mounted, 1 standing). Max 75kg per mounted rider |
| Stable | 1, 1.5, 2 or 3 hr | Flat per hour (IDR 1,750,000 / 2,250,000 / 2,750,000 / 3,750,000) | Morning 08:30-11:30 or afternoon 14:30-17:30 | 5 people. No groomed horse included (team assistance only) |
| Rice Field | 1, 1.5 or 2 hr | Flat per hour (IDR 1,750,000 / 2,250,000 / 2,750,000) | 8:00am, plus one fixed afternoon start per duration (1hr → 5:00pm, 1.5hr → 4:30pm, 2hr → 4:00pm) | 5 people. Same "no groomed horse" copy as Stable |
| Paddock | 1, 1.5, 2 or 3 hr | Same as Stable | Same as Stable | 5 people. No horse-touching; no rice field view mentioned in copy |
| Cottages | 1 session (3 hr) | IDR 4,500,000 per session | Morning 08:30-11:30 or afternoon 14:30-17:30 | 6 people per cottage |

**Rice Field no longer clones Stable's config** (29 Aug 2026 RICEFIELD-8AM): it lost its 3hr duration (and the IDR 3,750,000 price that went with it, Stable and Paddock keep theirs unchanged) and moved off the shared morning-or-afternoon-window `SESSION_SLOTS` pattern onto its own `RICEFIELD_SLOTS` table, the same 8am-plus-one-fixed-afternoon-slot pattern used by the rides. Stable and Paddock are unaffected.

Every photoshoot card and the step-2 detail screen show: "BYO Photographer or add a Salty Cowboys photographer" (descriptive text only, not a selectable). Riding-experience selector is never shown for photoshoots (unchanged).

**Photographer add-on** (all photoshoots): a single checkbox, "Add a Salty Cowboy photographer:", not a tier picker. Price and photo count auto-match whichever duration the customer already picked for their own shoot, IDR 2,500,000 for the first hour, plus IDR 500,000 per additional 30 minutes (10 photos per IDR 1,000,000, same rate as before): 1hr = IDR 2,500,000 (25 photos), 1.5hr = IDR 3,000,000 (30 photos), 2hr = IDR 3,500,000 (35 photos), 3hr = IDR 4,500,000 (45 photos). There is no way to add a photographer package for a duration longer or shorter than the shoot itself. Checkbox label shows price and photo count only, no duration; duration still appears in the confirm summary and WhatsApp message. When checked, the computed price is added to the displayed total and included in the WhatsApp message and booking summary.

### Rides

- **Both rides share identical slots**, one shared `RIDE_SLOTS` table keyed by duration: 8:00am, plus one fixed afternoon start per duration (1hr → 5:00pm, 1.5hr → 4:30pm, 2hr → 4:00pm). The 8:00am morning start and the 2hr duration were both added 29 Aug 2026 (BEACH-8AM commit); Ro's same-day correction extended the 8am slot to Insta Ride too so the two rides keep identical availability, rather than Beach getting its own separate slot table.
- **Beach & Rice Field Ride:** 1, 1.5 or 2 hr, per person (IDR 1,600,000 / 2,200,000 / 2,700,000).
- **Insta Ride:** 1, 1.5 or 2 hr, per person (IDR 1,600,000 / 2,000,000 / 2,700,000). Only the 1hr price still matches Beach & Rice Field Ride; 1.5hr no longer matches either (Beach & Rice Field Ride's 1.5hr was raised to 2,200,000, Insta Ride's stayed at 2,000,000). The 2hr price was raised from 2,400,000 to 2,700,000 (PRICE-INSTARIDE commit); Beach & Rice Field Ride's own new 2hr price (BEACH-8AM commit) was set to match it exactly. Same route as the 1.5 hr ride with more photo stops.
- Both rides are now bookable on Saturdays again, at 8:00am only (Saturday afternoons are still closed sanctuary-wide, so the afternoon slot still drops on a Saturday date for both).
- **Weight rules in the UI:** blanket 75 kg max, max 2 riders over 70 kg. Per-horse allocation (Lundstar walk-only max 1 hr, Othello all gaits at 77, Whiskey max 50 kg, others under 70) is handled by Simone on WhatsApp confirmation and intentionally NOT enforced in code. Othello's own 77kg figure is the horse's actual physical capability, not the site's UI cap, and is unaffected by the UI cap moving to 75kg.
- **"I'm booking for someone else" checkbox** (29 Aug 2026 BOOKING-FOR-OTHER, relocated 1 Sep 2026 RIDER-INFO-MODAL): riding activities only (Beach & Rice Field Ride, Insta Ride, Dressage Masterclass, i.e. every activity with `riding: true`). Lives in its own card directly under "3. Your booking summary" (and above the "What your booking cost funds" card), not inside the "Who's coming?" accordion, so it stays visible regardless of whether section 2 is collapsed. Unchecked by default; resets to unchecked both explicitly on every activity-change path and defensively whenever `isRiding` goes false. When checked, adds one line to the WhatsApp payload after the "Group size" line: "Booking on behalf of another rider. 75kg weight guideline shown to the person booking." Unchecked, the payload is unaffected. Not shown for photoshoots or non-riding lessons.
- **Rider info popup** (1 Sep 2026 RIDER-INFO-MODAL): checking the box above opens a popup automatically. It covers everything the actual rider (not the booker) needs to know: arrival time (new copy, "please arrive 15 minutes before the start time"), the 75kg weight guideline, and where the booking cost funds (reusing the existing "What your booking cost funds" copy, not duplicating it). Below that sits a ready-to-copy message, in whichever of the three site languages the booker currently has selected (not always English, unlike the WhatsApp message to Simone), opening with a greeting and a one-line activity/date/time summary, then the same three sections, then a closing line. A "Copy message" button copies it via the same clipboard-then-textarea-fallback pattern already used for the WhatsApp message. Closing the popup (✕ or backdrop click) does not uncheck the box; instead the checkbox's own card shows a short reopen prompt ("We've prepared everything they need to know...") that reopens the same popup on click, so the booker can view or copy it again without unchecking and rechecking. Unchecking the box removes the reopen prompt and closes the popup if it's open (one shared effect keyed on the checkbox state, not scattered across every reset call site). Ten new translation keys (`riderInfo*`), all prefixed to avoid colliding with the existing `bookingForOtherNote` used elsewhere. No pricing or offering data changed, so no Google Sheet update was needed for this one.

### Lessons

Order: Join Up, Horse Whisperer Course, Horse grooming, Group Clinic, Dressage Masterclass.

| Lesson | Max duration | Pricing basis | Price |
|---|---|---|---|
| Join Up | 1.5 hr | Per person | IDR 2,500,000 (1hr) / IDR 3,150,000 (1.5hr) |
| Horse Whisperer Course | 3 days | Flat, 1 or 2 people same price | IDR 22,500,000 total |
| Horse grooming (wet or dry) | 1.5 hr | Per booking (flat) | IDR 1,250,000 (1hr) / IDR 1,875,000 (1.5hr) |
| Group Clinic (Leadership/horsemanship class) | 1.5 hr (fixed) | Flat per session, 3 to 6 people | IDR 6,000,000 |
| Dressage Masterclass | 50 min | Per rider (private) | IDR 2,900,000 |

Lunge Lesson has been removed entirely (activity, pricing, copy, all three languages).

**Lesson start times (each activity has its own flat, duration-independent list, 29 Aug 2026 LESSON-SLOTS-SPLIT):**
- Join Up: 8:30am, 9:30am
- Horse grooming: 8:30am, 9:30am, 10:30am
- Group Clinic: 8:30am only
- Dressage Masterclass: 8:30am, 9:30am

These replace the old shared three-times table (9:30am/10:30am/3:00pm) that Join Up, Horse grooming and Group Clinic all used to draw from, and Dressage's old four-slot table (9:00am/10:00am/4:00pm/5:00pm). All the new slots sit before noon, so the existing Saturday-afternoon closure filter no longer removes anything from any of these four activities, Saturday availability now equals weekday availability for them. Horse grooming's 1.5hr price (IDR 1,875,000) is calculated as 1.5× the 1hr price, per Ro; awaiting Simone's sign-off like the other derived prices below.

**Group Clinic:** the C31 leadership-through-horses copy. 3 to 6 people, 1.5 hr fixed, IDR 6,000,000 flat per session, single 8:30am start time. No riding experience required (ground-based, no weight selector). Title is "Group Clinic (Leadership/horsemanship class)" in all three languages (29 Aug 2026 GROUPCLINIC commit; the parenthetical stays in English in every language). Minimum group size of 3 is enforced by `peopleOptions()`, which now reads a `minPeople` field alongside `maxPeople`, so "1" and "2" are never offered as selectable group-size pills for this activity; `initRiders()` also clamps defensively to the activity's `minPeople` when set.

**Horse Whisperer Course:** 10 hrs total across 3 days (two 3.5 hr sessions + a closing 3 hr session, including 2 hrs choice of grooming or another related activity). Shrunk from 4 days to 3, and Friday dropped, on 29 Aug 2026 (WHISPER-3DAY commit); the old shape was three 3 hr sessions + a closing 1 hr session across Mon/Tue/Thu/Fri. Bookable days restricted to Monday, Tuesday, Thursday only (no Wednesday, no Friday, no Saturday), all inside a single week. Each day uses the same shared start-time choice (8:30am or 9:30am) applied across all three days. Open to all rider levels, explicitly stated in the copy. Only one course booking taken per week (wording changed from "accepted" to "taken" in the same commit). Minimum age 8. Mucking out is no longer listed as an inclusion. Simone rejects duplicate bookings on WhatsApp.

The WhatsApp payload reflects the new shape too: the course-schedule line now reads "Course runs Mon, Tue & Thu within one week" (was "...Thu & Fri..."), and the Activity line's duration suffix is overridden to "3 to 3.5 hr/day" specifically for this activity, since its `durations: ["3hr"]` value doesn't reflect the actual per-day session lengths. Every other activity's payload is unaffected, since the override only fires when `actObj.id === "whisper"`.

### Notes section

Every activity's notes field shows a small hint above the textarea: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know here."

### Main page

Step 1 (the activity picker) opens directly on the "Choose an activity" heading, no card or mission paragraph above it (batch 4, Commit 1 removed the dark "Where the money goes" card, since Step 2's own light "What your booking cost funds" card already carries that copy). Navigation off Step 1 is via each activity card's own "Book →" button only; the global bottom "Next" bar was removed as redundant (Book already sets the activity and advances the screen in one click). Tapping a card still just selects/previews it without navigating.

## Open items (not yet resolved)

- **Both rides regained Saturday availability on 29 Aug 2026** (BEACH-8AM commit, corrected same day to cover Insta Ride too): the new shared 8:00am slot is bookable on Saturdays; each ride's afternoon slot still drops on a Saturday date, same as before. Previously both rides showed zero Saturday availability at all, confirmed acceptable by Ro at the time (consistent with the Horse Whisperer Course also having no Saturday availability); that constraint no longer applies now that both rides have a morning option.
- **Weight selector added to Beach Photoshoot only** (not Stable/Rice Field/Paddock/Cottages), since it's the only photoshoot where riders mount a horse. Confirmed with Ro; flagging for Simone's awareness since it's a new behaviour (photoshoots previously never asked for weight).
- **Paddock/Stable 3 hr price (IDR 3,750,000)** is derived from Simone's existing +500K per 30 min pattern. Awaiting her final sign-off. Rice Field no longer offers a 3hr option (removed 29 Aug 2026 RICEFIELD-8AM), so this no longer applies to it.
- **Insta Ride 1hr/1.5hr prices** (IDR 1,600,000 / 2,000,000) were originally copied directly from Beach & Rice Field Ride, per Ro's explicit instruction. Beach & Rice Field Ride's own 1.5hr price has since been raised to IDR 2,200,000, so only the 1hr figure still matches; Insta Ride's 1.5hr price was not changed to follow it, since Ro's later price update named Beach & Rice Field Ride specifically, not Insta Ride. Awaiting Simone's sign-off, same as the other derived prices on this list.
- **Horse grooming 1.5hr price** (IDR 1,875,000) was calculated as 1.5× the 1hr price, per Ro's explicit instruction. Awaiting Simone's sign-off.
- **Photographer add-on now auto-matches the shoot's own duration** (29 Aug 2026 redesign, per Ro's explicit correction), replacing the old independent 4-tier picker. Awaiting Simone's sign-off on the new IDR 2,500,000-base formula, same as the other derived prices on this list.
- **Dressage Masterclass position:** the new Lessons order only specified 4 items; Dressage was appended at the end (5th position) per Ro's confirmation. No change to its pricing or copy (its slots did change later, see LESSON-SLOTS-SPLIT above).

## Working with Simone

Simone is not technical. Do not expect her to review code. She reviews:
- The live site (or a preview URL) end-to-end as a booker would experience it
- The Google Sheet "Customer Offerings" tab
- Prose summaries of what's changing, no jargon

Deliverables are always: updated `index.html` (deployed), a TSV paste block for the sheet, and a CHANGELOG entry summarising what shifted.
