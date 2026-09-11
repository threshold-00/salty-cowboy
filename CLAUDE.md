# Salty Cowboy Booking Engine

Front-end booking engine for Salty Cowboy Bali, a horse rescue sanctuary and riding centre run by director Simone. Streamlines Simone's booking intake (previously WhatsApp/email/Instagram DMs) without disrupting her workflow. Simone approves all bookings on WhatsApp and is the source of truth for pricing and operational rules.

## Repo & file layout

```
/
├── index.html          # the app (single file, no build step)
├── apps-script/        # Apps Script for the booking log endpoint, NOT deployed from here
├── CLAUDE.md           # this file
├── CHANGELOG.md        # dated list of shipped changes
├── tests/
│   ├── assert.js       # string-based assertion suite
│   ├── smoke.js        # jsdom render check
│   └── package.json    # test dependencies
└── .github/workflows/
    └── test.yml        # CI: runs tests on every push
```

**Repo:** `github.com/threshold-00/salty-cowboy`, **singular**, verified against the GitHub API on 8 Sep 2026. The repo was renamed from the plural at some point, matching the 3 Sep BRAND-NAME-SINGULAR decision. GitHub still 301-redirects the old plural path, so plural links and pushes keep working and the rename is easy to miss. An older `pursuit-098` owner reference in this file was stale.

**Deploy:** GitHub Pages serves `main` at **`https://threshold-00.github.io/salty-cowboy/`**, singular, returning 200 on 8 Sep 2026. Every push to `main` deploys automatically. No build step, no bundler, no framework config. Note the plural `.github.io/salty-cowboys` URL is **not** a redirect, it is a hard 404, so the singular one is the only address that works.

**Naming, in one place:** everything is singular "Salty Cowboy" as of 8 Sep 2026: the brand, the repo, the live URL, and the local folder `~/Documents/Salty Cowboy Booking Engine/salty-cowboy`. The single remaining plural is the `salty-cowboys-tests` package name in `tests/package.json`, left alone because renaming it would bust the CI npm cache key (`cache-dependency-path: tests/package.json`) for no benefit. Anything else plural is either a historical record or a mistake.

**Site tech:** React 18 UMD is inlined at the top of `index.html`; JSX is pre-compiled to `React.createElement` calls (no runtime Babel). All styles are in a single `<style>` block. Trilingual UI (English, Indonesian, Russian). The WhatsApp message sent to Simone is always English so she can read every request consistently.

**Booking flow (3 steps):** 1) choose activity, 2) configure (duration, people, rider details, weight/experience/photographer as applicable) **and** pick a calendar date + time slot + notes, all on one scrollable screen, 3) confirmation. There is no separate calendar screen; both the "1. Book a date and time" and "2. Who's coming?" sections render unconditionally on Step 2 (no button click needed to reveal them). This applies uniformly, including the Horse Whisperer Course's 3-day picker and per-duration ride slot filtering, both of which are driven by component state rather than by screen.

**Step 2 accordions (progression-driven, manually toggleable):** sections "1. Book a date and time" and "2. Who's coming?" each collapse to a one-line summary once their own completion state is true (`section1Complete` = date(s) + time picked; `detailsComplete` = duration + numPeople + grooming-if-needed + all rider fields valid), and can be manually reopened and re-collapsed by clicking the numbered heading (shows a ▾/▴ arrow once clickable) or the collapsed summary line itself. Three override values, `section1Override`, `section2Override` and `section3Override` (`index.html:2725-2727`), track only the manual toggle. Each is **three-state, not boolean**: `null` means the user has never toggled that section, so the automatic default applies; `true` or `false` is an explicit manual choice that wins until it is reset. The collapsed state is therefore `sectionNOverride !== null ? sectionNOverride : <default>`, and each section has a **different** default:

- **Section 1** (`index.html:2929`): default is `section1Complete`. Open until its own fields are done, then collapsed.
- **Section 2** (`index.html:2938`): default is `!section1Complete || detailsComplete`. This is a sequential reveal, not a completion flag. Closed while section 1 is unfinished (nothing to work on yet), opens the moment section 1 completes, collapses again once its own fields are done.
- **Section 3** (`index.html:2951`): default is `!section3Complete`, where `section3Complete = section1Complete && detailsComplete`. Inverted from the other two, because section 3 has no fields of its own: it starts collapsed and auto-opens once both 1 and 2 are done.

There is no parallel completeness system, and clearing a required field always forces the section back open, because each section's reset effect sets its override back to `null` the moment its own precondition goes false.

**Section 3 IS collapsible** (this reverses the earlier "not collapsible" note, which is no longer true).

**Opening ahead of sequence is blocked, closing never is.** `toggleSection2` and `toggleSection3` (`index.html:2752-2766`) check the section's precondition only when it is currently collapsed. If it is not met they set `blockedSection` to 2 or 3, which renders a small dismissible note under that section's card and auto-clears after 3 seconds. Closing an already-open section is never blocked.

**The "Edit" link on the booking summary bypasses the guard deliberately**, opening sections 1 and 2 directly, because it is a request to review everything already filled in rather than sequential progression.

This is all purely presentational, CSS-hide (`display: none`) not unmount. `buildWhatsAppMessage`/`handleSend` read exclusively from React state, never the DOM, so collapsing or reopening a section can never blank a field out of the WhatsApp payload. The collapsed summary line filters out `duration` when it is null (Horse Whisperer Course has no duration selector) so it never prints the literal string "null".

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
6. **Run both tests** from inside `tests/` (`cd tests && node assert.js && node smoke.js`). Both resolve `../index.html`, so they fail with ENOENT if run from the repo root. Stop and report if either fails; do not continue.
7. **Show a summary** of all changes made and wait for Ro's explicit approval before running `git commit` and `git push`.

## Commands

```bash
# Install test deps (once)
cd tests && npm install

# Run tests (from inside tests/, both resolve ../index.html)
cd tests
node assert.js           # string assertions
node smoke.js            # jsdom render check

# Syntax-check the inlined JSX (from the repo root)
cd ..
node --check /dev/stdin < <(node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script>[\s\S]*?<\/script>[\s\S]*?<script>[\s\S]*?<\/script>[\s\S]*?<script>([\s\S]*?)<\/script>/); process.stdout.write(m[1])")
```

## gstack skills (installed 8 Sep 2026)

[gstack](https://github.com/garrytan/gstack) is installed globally at `~/.claude/skills/gstack`, prefixed, so every command is `/gstack-*` and never the bare name. It is an execution accelerator only. It has no opinion on whether the thing being built is right, and no user research skills, so it never decides product direction for this repo.

**The "Default change workflow" above always wins.** gstack skills do not replace steps 1 to 7. In particular they do not override the em-dash ban, the "update assert.js and CHANGELOG.md in the same pass" rule, or the requirement to wait for Ro's explicit approval before `git commit` and `git push`. If a gstack skill wants to commit, push, or deploy on its own, stop and ask.

Worth reaching for here:

- `/gstack-qa` drives a real browser through the booking flow and fixes what it finds. The closest thing to a genuine end-to-end check, since `smoke.js` only does a jsdom render.
- `/gstack-investigate` for tracing a bug through `index.html`, which is one large single file.
- `/gstack-review` for a second pass on a change before it goes to Ro.
- `/gstack-spec` for turning a new batch of client feedback into a written spec before touching code.

Not applicable:

- Every `/gstack-ios-*` skill. There is no iOS app.
- `/gstack-setup-deploy` and `/gstack-land-and-deploy`. GitHub Pages already serves `main` on push, there is no build step, and nothing here needs a deploy pipeline.

**Machine constraint:** the browser skills (`/gstack-qa`, `/gstack-browse`, `/gstack-scrape`, `/gstack-landing-report`) drive a bundled Chromium. Ro's Mac has 8GB of RAM and the OS kills these first under pressure. Run them with other apps closed, and expect to retry.

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

**Photographer add-on** (all five photoshoots: Beach, Stable, Rice Field, Paddock, Cottages): a single checkbox, "Add a Salty Cowboy photographer:", not a tier picker. Sits at the bottom of **"2. Who's coming?"**, directly after the "I'm booking for someone else" checkbox, hidden with `section2Collapsed`. Price and photo count auto-match whichever duration the customer already picked for their own shoot. Flat rate of IDR 2,000,000 and 20 photos per hour (1 Sep 2026 PHOTOG-PRICE-FLAT, replacing the old IDR 2,500,000-anchored block formula): 1hr = IDR 2,000,000 (20 photos), 1.5hr = IDR 3,000,000 (30 photos), 2hr = IDR 4,000,000 (40 photos), 3hr = IDR 6,000,000 (60 photos). The 1/1.5/2hr figures are Ro's exact given values; the 3hr figure (Stable, Paddock, and Cottages' only duration) extrapolates the same flat rate, per Ro's explicit confirmation, awaiting Simone's sign-off like the other derived prices below. There is no way to add a photographer package for a duration longer or shorter than the shoot itself. Checkbox label shows price and photo count only, no duration; duration still appears in the confirm summary and WhatsApp message. When checked, the computed price is added to the displayed total and included in the WhatsApp message and booking summary.

### Rides

- **Rides no longer share a duration set** (1 Sep 2026 RIDE-DURATION-SPLIT): both still read from the same shared `RIDE_SLOTS` table keyed by duration (8:00am, plus one fixed afternoon start per duration: 1hr → 5:00pm, 1.5hr → 4:30pm, 2hr → 4:00pm), but each activity's own `durations` array now points at a disjoint subset of it, so the two rides no longer offer any of the same duration options. `RIDE_SLOTS` itself is unchanged and still shared infrastructure; only which of its entries each activity draws from has split.
- **Beach & Rice Field Ride:** 1 or 1.5 hr only (2hr removed), per person (IDR 1,600,000 / 2,200,000).
- **Insta Ride:** 2 hr only (1hr/1.5hr removed), per person (IDR 2,700,000, unchanged from before the split). Copy now emphasizes that the full 2 hours means more time and more stops for photos along the way, since it's now our longest ride.
- Both rides are now bookable on Saturdays again, at 8:00am only (Saturday afternoons are still closed sanctuary-wide, so the afternoon slot still drops on a Saturday date for both).
- **Weight warnings link through to Lessons** (6 Sep 2026 WEIGHT-LESSONS-LINK): in both the over-70kg (`w3`) and over-75kg (`w4`) warnings, the quoted word 'Lessons' is a button that calls `goToLessons`, switching `activeCat` to Lessons and returning to step 1 with the same state reset the category tabs perform. The linked substring per language lives in `lessonsToken`, because the word and its quote marks differ ('Lessons', 'Pelajaran', «Уроки»); `bodyWithLessonsLink` splits the body on it and falls back to the plain string if absent. The minimum-age warning is unaffected. `.ww-title` is font-weight 500.
- **Weight rules in the UI:** blanket 75 kg max, max 2 riders over 70 kg. Per-horse allocation (Lundstar walk-only max 1 hr, Othello all gaits at 77, Whiskey max 50 kg, others under 70) is handled by Simone on WhatsApp confirmation and intentionally NOT enforced in code. Othello's own 77kg figure is the horse's actual physical capability, not the site's UI cap, and is unaffected by the UI cap moving to 75kg.
- **"I'm booking for someone else" checkbox** (29 Aug 2026 BOOKING-FOR-OTHER, relocated 1 Sep 2026 RIDER-INFO-MODAL): riding activities only (Beach & Rice Field Ride, Insta Ride, Dressage Masterclass, i.e. every activity with `riding: true`). Lives at the bottom of **"2. Who's coming?"**, alongside the photographer add-on, both wrapped in `addon-group` (10 Sep 2026 CHECKBOXES-UNDER-WHOS-COMING, per Ro, reversing the 1 Sep move to its own card under the booking summary). **Consequence to keep in mind:** it now hides with `section2Collapsed`, so once the rider fields are complete and section 2 auto-collapses, the checkbox is off screen until the user reopens section 2 (one tap on the heading, or the summary card's Edit link, which reopens sections 1 and 2). That visibility is exactly what the 1 Sep move was protecting and what this change trades away. The two checkboxes never appear together, since `isRiding` and `isPhotoshoot` are mutually exclusive. Unchecked by default; resets to unchecked both explicitly on every activity-change path and defensively whenever `isRiding` goes false. When checked, adds one line to the WhatsApp payload after the "Group size" line: "Booking on behalf of another rider. 75kg weight guideline shown to the person booking." Unchecked, the payload is unaffected. Not shown for photoshoots or non-riding lessons.
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

**Horse Whisperer Course:** 10 hrs total across 3 days (two 3.5 hr sessions + a closing 3 hr session, including 2 hrs choice of grooming or another related activity). Shrunk from 4 days to 3, and Friday dropped, on 29 Aug 2026 (WHISPER-3DAY commit); the old shape was three 3 hr sessions + a closing 1 hr session across Mon/Tue/Thu/Fri. Bookable days restricted to Monday, Tuesday, Thursday only (no Wednesday, no Friday, no Saturday), all inside a single week. Because that leaves **exactly one valid set of days per week**, the picker books a week at a time (10 Sep 2026 COURSE-WEEK-PICKER): tapping any offered day selects all three via `courseWeekDates`, tapping a selected day clears the week, and removing one chip removes all three. A week is only offered when `courseWeekBookable` says all three of its days are still ahead, which is what stops a part-past week from being tapped into a state it can never complete. **Times are FIXED, not chosen** (10 Sep 2026 WHISPER-FIXED-SCHEDULE, from Simone's own message): **Monday 8:30am to 12:00pm, Tuesday 8:30am to 12:00pm, Thursday 9:00am to 12:00pm.** Thursday starts later than the other two. Step 1 renders these read-only instead of pickable slot cards, since there is nothing to choose, and tells the customer to message Simone if they need different times, which is her stated fallback. `WHISPER_SLOTS` is a one-entry list holding `WHISPER_TIME` (`"Mon & Tue 8:30am, Thu 9:00am"`) so `availableSlots`, the slot-drop effect and `section1Complete` need no special cases; an effect auto-selects it once the course week is picked, and that string is what reaches the WhatsApp payload, the summary line and the booking log's `time` column. The previous 8:30/9:30am pair was a choice she does not offer, applied one time to all three days, and hid Thursday's later start; it was also still described that way in the customer-facing activity description in all three languages. Open to all rider levels, explicitly stated in the copy. Only one course booking taken per week (wording changed from "accepted" to "taken" in the same commit). Minimum age 8. Mucking out is no longer listed as an inclusion. Simone rejects duplicate bookings on WhatsApp.

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

## Booking log (10 Sep 2026 BOOKING-LOG)

Write-only. One row per Send click, `navigator.sendBeacon` to an Apps Script `/exec` endpoint, into a
**separate** spreadsheet from Simone's Customer Offerings sheet. Nothing is ever read back. No
availability, capacity or pricing logic depends on it, and the site must keep working with the endpoint
unreachable.

**The endpoint URL is committed, and public.** GitHub Pages serves `index.html` from a public repo, so
the live page cannot log without it; it is also readable from the page source by anyone. `doPost`
validates `activity_id` against the twelve real ids, so junk rows need a lucky guess and are cheap to
delete. If it is ever abused, create a NEW deployment (which issues a new URL) and update
`LOG_ENDPOINT`. Setting it to `""` turns logging off locally without touching anything else. An
assertion pins the exact URL, so a typo or an accidental blanking fails loudly rather than silently
logging nothing.

**Rules that are easy to break by accident:**

- `logEvent(type, build)` takes a **thunk**. Never `logEvent("booking", bookingLogRow(ref))`: that
  evaluates the builder as an argument, outside the try/catch, and a throw lands between
  `openWhatsApp` and `setScreen("confirm")`, stranding the customer on a dead screen with no copy
  fallback. Logging must never be able to cost a booking.
- `bookingLogRow` is a **whitelist**, not a filter. Rider **names** and free-text notes must never
  reach it; `notes` contributes only a `has_notes` boolean. `tests/assert.js` cannot scope an
  assertion to a function body, so nothing automated can prove this. The pinned source block is the
  only defence and it only catches an edit to that one function. Ages, weights and experience ARE
  logged as of schema v2 (11 Sep 2026), names still are not, and `missing('riderList("name")')` is
  what keeps it that way.
- Dates come from `sortedDates` with `s.m + 1`, never from `formattedDates` (English prose).
  `sortedDates` months are **zero-indexed**. No test can catch an off-by-one; read the sheet by eye.
- `duration` logs the **raw** state value (`"3hr"`), not the WhatsApp display suffix
  (`"3 to 3.5 hr/day"`), so the column stays groupable.
- **There is no `weight_asked` column and there should not be one.** It existed from 10 Sep to 11 Sep
  on the stated grounds that four zero counts could not be told apart from "asked, everyone was
  light". That was false: `index.html:2958` makes `r.weight` mandatory for every rider whenever
  `showWeight` is on, so "everyone light" is `w1 = num_people` and four zeros only ever meant not
  asked. Do not re-add it.
- **Schema v2 (11 Sep 2026 LOG-RIDER-PROFILE)** adds `ages`, `weights` and `experience`: comma-joined,
  **index-aligned** per-rider lists, so position `i` is the same person in all three. `riderList`
  returns `""` rather than `",,"` when a field was never asked (photoshoots collect neither age nor
  experience), so an empty cell reads as "not collected" and a populated one always has `num_people`
  entries. It also **drops three derived columns**: `is_course` (true only for `whisper`, so it
  restated `activity_id`), `weight_asked` and `date_count`. `w1`-`w4` stay, redundant with `weights`
  on purpose.
- **The test for a derived column is how painful the derivation is in a sheet formula**, not whether
  it is technically redundant. Only `w1`-`w4` pass it: counting "bookings with anyone over 70kg" from
  the string `"w2,w3,w1"` means splitting and matching per row in Sheets, versus `=SUM(w3:w4)`, and
  that number is the one telling Simone she has a horse problem. The three that failed and were
  removed on 11 Sep: `is_course` (`=activity_id="whisper"`), `weight_asked` (`=SUM(w1:w4)>0`, or just
  an empty `weights`), `date_count` (`=COUNTA(SPLIT(dates_iso,","))`). Apply this test to any column
  proposed in future; two of those three were added by me without being asked for.
- **`booking_for_other`** covers Rides AND Lessons as of 11 Sep 2026 (`canBookForOther = !isPhotoshoot`,
  Ro's request). The weight guidance inside that flow (the modal section, the copyable message and the
  WhatsApp line) is gated separately on `showWeight`, because four of the five Lessons are groundwork
  and never ask for weight. Do not re-couple the two: opening the gate without gating the copy tells
  someone booking a Join Up session their friend must be under 75kg.
- **`grooming_type`** (renamed from `grooming`, 11 Sep 2026) is `wet`, `dry` or blank. It is which
  grooming STYLE was chosen on the one activity that offers a choice, whose id is `masterclass` and
  whose customer-facing name is "Horse grooming (wet or dry)". It is NOT "did they groom": Horse
  Whispering includes 2 hours of grooming and is correctly blank here. The old name was ambiguous
  enough that Ro asked what it meant twice.
- **New columns go at the END of `COLUMNS`.** `setupHeaders()` rewrites row 1 in place and does not
  touch the rows under it, so inserting mid-list shifts the headers off the data and silently
  mislabels every existing row. This is why `ages`/`weights`/`experience` sit after the manual
  `outcome` and `horse` columns rather than next to `w1`-`w4` where they belong logically.
- **Changing `COLUMNS` is a two-part deploy.** `doPost` maps the payload onto whatever headers the
  sheet currently has, so a client that sends a key with no matching header **drops it silently**.
  Push the site and re-run `setupHeaders()`, or the new fields go nowhere and nothing reports it.
- The `Ref: SC-XXXXXX` line appended in `handleSend` is the **join key** between a sheet row and
  Simone's WhatsApp thread. `outcome` and `horse` ship as empty columns and are only fillable because
  of it.
- `apps-script/Code.gs` appends **by header name**, never by position, and its `VALID_ACTIVITY_IDS`
  must be kept in sync with `ACTIVITIES` in `index.html`.

**The two silent failure modes.** A deployment set to "Anyone with a Google account" instead of
"Anyone" redirects the POST to a login page while `sendBeacon` still returns `true`. And creating a
*new* deployment issues a *new* `/exec` URL, orphaning the old one. Both produce a spreadsheet
identical to "no bookings", for weeks. `setupDeadLogTrigger()` is the only thing that tells them apart.

**Phase 2 (funnel events on step 2) is designed but not built.** See the design doc in
`~/.gstack/projects/rowenabaulch/`.

## Open items (not yet resolved)

- **The booking log endpoint is live but unproven on a real device** (10 Sep 2026): spreadsheet, Apps Script deployment and `LOG_ENDPOINT` are all wired up and verified by curl, but no booking has been made from an actual phone yet. The acceptance gate (7 steps, including reading the date cell by eye for the zero-indexed month) has not been run.
- **Is Salty Cowboy supply-constrained or demand-constrained?** Unconfirmed and load-bearing for what the booking log is for. One question to Simone settles it: is she turning bookings away for lack of horse-hours, or does she have empty hours she wants filled?
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
