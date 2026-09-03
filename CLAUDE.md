# Salty Cowboy Booking Engine

Front-end booking engine for Salty Cowboy Bali, a horse rescue sanctuary and riding centre run by director Simone. Streamlines Simone's booking intake (previously WhatsApp/email/Instagram DMs) without disrupting her workflow. Simone approves all bookings on WhatsApp and is the source of truth for pricing and operational rules.

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

**Wording:** "Morning" and "golden hour" (not Sunrise/Sunset) used everywhere the time-of-day is mentioned, in all three languages. "Golden hour" is capitalized only when it starts a sentence (2 Sep 2026 CLIENT-COPY-FEEDBACK: the client's given copy for the Rides intro and Insta Ride used lowercase "golden hour" mid-sentence, so that's now the standard rather than treating it as a capitalized proper noun everywhere).

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

Every photoshoot card and the step-2 detail screen show: "BYO Photographer or add a Salty Cowboy photographer" (descriptive text only, not a selectable). Riding-experience selector is never shown for photoshoots (unchanged).

**Photographer add-on** (all photoshoots): a single checkbox, "Add a Salty Cowboy photographer:", not a tier picker. Price and photo count auto-match whichever duration the customer already picked for their own shoot. Flat rate of IDR 2,000,000 and 20 photos per hour (1 Sep 2026 PHOTOG-PRICE-FLAT, replacing the old IDR 2,500,000-anchored block formula): 1hr = IDR 2,000,000 (20 photos), 1.5hr = IDR 3,000,000 (30 photos), 2hr = IDR 4,000,000 (40 photos), 3hr = IDR 6,000,000 (60 photos). The 1/1.5/2hr figures are Ro's exact given values; the 3hr figure (Stable, Paddock, and Cottages' only duration) extrapolates the same flat rate, per Ro's explicit confirmation, awaiting Simone's sign-off like the other derived prices below. There is no way to add a photographer package for a duration longer or shorter than the shoot itself. Checkbox label shows price and photo count only, no duration; duration still appears in the confirm summary and WhatsApp message. When checked, the computed price is added to the displayed total and included in the WhatsApp message and booking summary.

### Rides

- **Rides no longer share a duration set** (1 Sep 2026 RIDE-DURATION-SPLIT): both still read from the same shared `RIDE_SLOTS` table keyed by duration (8:00am, plus one fixed afternoon start per duration: 1hr → 5:00pm, 1.5hr → 4:30pm, 2hr → 4:00pm), but each activity's own `durations` array now points at a disjoint subset of it, so the two rides no longer offer any of the same duration options. `RIDE_SLOTS` itself is unchanged and still shared infrastructure; only which of its entries each activity draws from has split.
- **Beach & Rice Field Ride:** 1 or 1.5 hr only (2hr removed), per person (IDR 1,600,000 / 2,200,000).
- **Insta Ride:** 2 hr only (1hr/1.5hr removed), per person (IDR 2,700,000, unchanged from before the split). Copy now emphasizes that the full 2 hours means more time and more stops for photos along the way, since it's now our longest ride.
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

### Client copy feedback (2 Sep 2026 CLIENT-COPY-FEEDBACK)

A round of client feedback replaced several customer-facing copy blocks across all three languages, no operational rules (durations, prices, group caps, slots) changed as part of this pass:

- **Rides intro** (`introRides`): dropped "emerald rice fields" and "especially magical" as too AI-sounding, in favor of plainer language. Still says Morning/golden hour, not Sunrise/Sunset.
- **Insta Ride description** (`descs.insta`): rewritten to lead with "our longest ride at 2 hours" and "more stops for photos", client-supplied copy adopted closely to verbatim.
- **"Who's coming?" subtitle** (`section2Subtitle`): now "A few details to help us prep for your group." (was "...so we can ensure you have the best experience").
- **Funding copy** (`moneyGoesBody`, used by both the Step 2 cost-funds-card and the rider-info modal): rewritten to cover the two outcomes for a recovered horse, back to gentle riding, or adopted out to a family, dropping the "Salty Cowboys began as a rescue and it still is one" framing. **Updated again 3 Sep 2026 (MONEYGOES-VERBATIM):** switched from an editorially-smoothed paraphrase to the client's exact given wording ("Some go back to gentle riding to make money for their friends, others can go to a family that is curated by us..."), at the client's explicit request for the literal text rather than the polished version.
- **Photoshoots intro** (`introPhotoshoots`): opening sentence simplified to "Photos with our rescue horses at our best spots around the property" (was "Beautiful, story-telling photos... most scenic backdrops"); rest of the paragraph (BYO/add-on note, per-horse pricing note) unchanged in substance. **Updated again 3 Sep 2026 (BEACH-SHOOT-MOUNTED):** the Beach shoot sentence changed from "you'll walk alongside your horse down to the sand" to "you'll sit on your horse for the walk down to the sand" in all three languages, so the copy matches what actually happens; no operational rule changed, the Beach shoot was already the only photoshoot where people mount a horse. Caught and fixed in the same pass: this paragraph's stated photographer add-on price was still the old IDR 2,500,000/25-photo figure from before PHOTOG-PRICE-FLAT, now corrected to IDR 2,000,000/20.
- **"Photographer" capitalization** (`byoPhotographer`, English only): lowercased the mid-sentence "Photographer" in "Bring your own Photographer or add a..." per the client's report of inconsistent capitalization in the photoshoot tab.
- **Brand name consistency**: every remaining singular "Salty Cowboy [noun]" adjectival use (`addonTitle` in all 3 languages, `introPhotoshoots` in id/ru, the WhatsApp payload's add-on line) changed to "Salty Cowboys", matching `byoPhotographer` and the funding copy, which already said "Salty Cowboys". The client separately flagged that the hero logo image itself still reads "SALTY COWBOY" (singular). **Superseded 3 Sep 2026 (BRAND-NAME-SINGULAR):** Ro confirmed "Salty Cowboy" singular, not "Salty Cowboys", is the correct brand name, the logo was right all along. Every remaining "Salty Cowboys" in the app, the 6 changed by this bullet plus everywhere else it already said "Salty Cowboys" before this pass (page `<title>`, meta description, loading-screen label, `byoPhotographer`, `notesPlaceholder`, `notice`, `riderInfoMsgIntro`, `introPhotoshoots` in en, the WhatsApp message title, logo `alt` text), 24 occurrences total, was changed back to "Salty Cowboy". See Open Items.
- **Lessons intro** (`introLessons`): simplified to two direct sentences, dropped the "natural horsemanship" flourish.
- **Horse Whisperer Course description** (`descs.whisper`): rewritten in plainer, more direct language; the closing line changed from "Bring a friend for free" to "This course is for two people, so bring your friend!" (the `friendFree` gift-chip badge on the Step 1 card is unchanged and still accurate, since the course price is flat for 1 or 2 people either way).
- **Group Clinic description** (`descs.groupclinic`): closing clause changed from "the same skills that carry into any team or boardroom... business teams and horse people alike" to "...any team setting... business teams, and friend groups that ride."

### Notes section

Every activity's notes field shows a small hint above the textarea: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know here."

### Main page

Step 1 (the activity picker) opens directly on the "Choose an activity" heading, no card or mission paragraph above it (batch 4, Commit 1 removed the dark "Where the money goes" card, since Step 2's own light "What your booking cost funds" card already carries that copy). Navigation off Step 1 is via each activity card's own "Book →" button only; the global bottom "Next" bar was removed as redundant (Book already sets the activity and advances the screen in one click). Tapping a card still just selects/previews it without navigating.

## Open items (not yet resolved)

- **Both rides regained Saturday availability on 29 Aug 2026** (BEACH-8AM commit, corrected same day to cover Insta Ride too): the new shared 8:00am slot is bookable on Saturdays; each ride's afternoon slot still drops on a Saturday date, same as before. Previously both rides showed zero Saturday availability at all, confirmed acceptable by Ro at the time (consistent with the Horse Whisperer Course also having no Saturday availability); that constraint no longer applies now that both rides have a morning option.
- **Weight selector added to Beach Photoshoot only** (not Stable/Rice Field/Paddock/Cottages), since it's the only photoshoot where riders mount a horse. Confirmed with Ro; flagging for Simone's awareness since it's a new behaviour (photoshoots previously never asked for weight).
- **Paddock/Stable 3 hr price (IDR 3,750,000)** is derived from Simone's existing +500K per 30 min pattern. Awaiting her final sign-off. Rice Field no longer offers a 3hr option (removed 29 Aug 2026 RICEFIELD-8AM), so this no longer applies to it.
- **Insta Ride's 1hr/1.5hr prices are moot as of 1 Sep 2026 (RIDE-DURATION-SPLIT)**: Insta Ride is now 2hr-only, so its former 1hr (IDR 1,600,000) and 1.5hr (IDR 2,000,000) price points, previously flagged here as copied from Beach & Rice Field Ride and awaiting sign-off, no longer exist and don't need one.
- **Horse grooming 1.5hr price** (IDR 1,875,000) was calculated as 1.5× the 1hr price, per Ro's explicit instruction. Awaiting Simone's sign-off.
- **Photographer add-on now auto-matches the shoot's own duration** (29 Aug 2026 redesign, per Ro's explicit correction), replacing the old independent 4-tier picker. The underlying rate moved from an IDR 2,500,000-anchored block formula to a flat IDR 2,000,000/20-photos per hour rate on 1 Sep 2026 (PHOTOG-PRICE-FLAT), per Ro's exact figures for 1/1.5/2hr. Awaiting Simone's sign-off on the 3hr figure (IDR 6,000,000, 60 photos), which extrapolates that same flat rate since Ro didn't give a 3hr figure directly, only confirmed the extrapolation approach; this is the only tier without a directly-given number.
- **Dressage Masterclass position:** the new Lessons order only specified 4 items; Dressage was appended at the end (5th position) per Ro's confirmation. No change to its pricing or copy (its slots did change later, see LESSON-SLOTS-SPLIT above).
- **RESOLVED 3 Sep 2026 (BRAND-NAME-SINGULAR):** the hero logo image reading "SALTY COWBOY" (singular) was flagged 2 Sep 2026 as a possible mismatch against copy that said "Salty Cowboys" elsewhere. Ro confirmed "Salty Cowboy" (singular) is the correct brand name, so the logo asset was right all along; every text instance of the plural was changed to match it instead (see CLIENT-COPY-FEEDBACK below), no image asset ever needed fixing.

## Working with Simone

Simone is not technical. Do not expect her to review code. She reviews:
- The live site (or a preview URL) end-to-end as a booker would experience it
- The Google Sheet "Customer Offerings" tab
- Prose summaries of what's changing, no jargon

Deliverables are always: updated `index.html` (deployed), a TSV paste block for the sheet, and a CHANGELOG entry summarising what shifted.
