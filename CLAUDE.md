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

**Universal weight cap: 77 kg** (blanket max, max 2 riders/mounted people over 70 kg). Applies to every riding activity (Beach & Rice Field Ride, Insta Ride, Dressage Masterclass) and to Beach Photoshoot (the only photoshoot where riders mount a horse). No other photoshoot, and no ground-based lesson, asks for weight.

**Wording:** "Morning" and "Golden hour" (not Sunrise/Sunset) used everywhere the time-of-day is mentioned, in all three languages.

### Photoshoots

| Shoot | Duration | Pricing | Time slots | Group cap |
|---|---|---|---|---|
| Beach | 1 or 1.5 hr | Per horse per hour (IDR 1,750,000 / 2,250,000) | Any start 08:00 to 16:00 | 3 people (2 mounted, 1 standing). Max 77kg per mounted rider |
| Stable | 1, 1.5, 2 or 3 hr | Flat per hour (IDR 1,750,000 / 2,250,000 / 2,750,000 / 3,750,000) | Morning 08:30-11:30 or afternoon 14:30-17:30 | 5 people. No groomed horse included (team assistance only) |
| Rice Field | Same as Stable (cloned config) | Same as Stable | Same as Stable | 5 people. Same "no groomed horse" copy as Stable |
| Paddock | 1, 1.5, 2 or 3 hr | Same as Stable | Same as Stable | 5 people. No horse-touching; no rice field view mentioned in copy |
| Cottages | 1 session (3 hr) | IDR 4,500,000 per session | Morning 08:30-11:30 or afternoon 14:30-17:30 | 6 people per cottage |

Every photoshoot card and the step-2 detail screen show: "BYO Photographer or add a Salty Cowboys photographer" (descriptive text only, not a selectable). Riding-experience selector is never shown for photoshoots (unchanged).

**Photographer add-on** (all photoshoots): three tick boxes, one per tier, mutually exclusive (only one selectable at a time), independent of the shoot's own duration. Tick box labels show price and photo count only, no duration (e.g. "IDR 2,000,000 (20 photos)"); duration still appears in the price breakdown, confirm summary, and WhatsApp message. Tiers: 1hr = IDR 2,000,000 (20 photos), 1.5hr = IDR 3,000,000 (30 photos), 2hr = IDR 4,000,000 (40 photos). No tier above 2hr is offered, even for 3hr shoots. Selected tier's price is added to the displayed total and included in the WhatsApp message and booking summary.

### Rides

- **Beach & Rice Field Ride:** 1 or 1.5 hr, per person (IDR 1,600,000 / 2,000,000). Fixed slots: 1hr → 5:00pm, 1.5hr → 4:30pm.
- **Insta Ride:** 1, 1.5 or 2 hr, per person (IDR 1,600,000 / 2,000,000 / 2,400,000, same as Beach & Rice Field Ride, per Ro). Fixed slots: 1hr → 5:00pm, 1.5hr → 4:30pm, 2hr → 4:00pm. Same route as the 1.5 hr ride with more photo stops.
- Rides no longer offer a morning start; each duration has exactly one fixed afternoon start time. Since Saturday afternoons are closed, **rides currently show zero available slots on any Saturday** (worth flagging to Simone, see Open items).
- **Weight rules in the UI:** blanket 77 kg max, max 2 riders over 70 kg. Per-horse allocation (Lundstar walk-only max 1 hr, Othello all gaits at 77, Whiskey max 50 kg, others under 70) is handled by Simone on WhatsApp confirmation and intentionally NOT enforced in code.

### Lessons

Order: Join Up, Horse Whisperer Course, Horse grooming, Group Clinic, Dressage Masterclass.

| Lesson | Max duration | Pricing basis | Price |
|---|---|---|---|
| Join Up | 1.5 hr | Per person | IDR 2,500,000 (1hr) / IDR 3,150,000 (1.5hr) |
| Horse Whisperer Course | 4 days | Flat, 1 or 2 people same price | IDR 22,500,000 total |
| Horse grooming (wet or dry) | 1.5 hr | Per booking (flat) | IDR 1,250,000 (1hr) / IDR 1,875,000 (1.5hr) |
| Group Clinic | 1.5 hr (fixed) | Flat per session, up to 6 people | IDR 6,000,000 |
| Dressage Masterclass | 50 min | Per rider (private) | IDR 2,900,000 |

Lunge Lesson has been removed entirely (activity, pricing, copy, all three languages).

**Join Up and Horse grooming share three fixed start times:** 9:30am, 10:30am, 3:00pm. The old 5:00pm slot is gone. Horse grooming's 1.5hr price (IDR 1,875,000) is calculated as 1.5× the 1hr price, per Ro; awaiting Simone's sign-off like the other derived prices below.

**Group Clinic** (new): the C31 leadership-through-horses copy. Up to 6 people, 1.5 hr fixed, IDR 6,000,000 flat per session, same three start times as Join Up/Horse grooming. No riding experience required (ground-based, no weight selector).

**Horse Whisperer Course:** 10 hrs total across 4 days (three 3 hr sessions + a closing 1 hr session). Bookable days restricted to Monday, Tuesday, Thursday, Friday only (no Wednesday, no Saturday), all inside a single week. Each day uses the same shared start-time choice (8:30am or 9:30am) applied across all four days. Open to all rider levels, explicitly stated in the copy. Only one course booking accepted per week. Minimum age 8. Mucking out is no longer listed as an inclusion. Simone rejects duplicate bookings on WhatsApp.

### Notes section

Every activity's notes field shows a small hint above the textarea: "Times here not suitable? Let us know in the notes."

### Main page

The initial activity screen opens with a "Where the money goes" mission paragraph (all three languages), above the "Choose an activity" heading.

## Open items (not yet resolved)

- **Test WhatsApp number** in `index.html` (`WA_NUMBER`) must be swapped for Simone's real number before go-live.
- **Rides now show zero Saturday availability.** The new fixed ride slots (4:00pm/4:30pm/5:00pm) are all in the afternoon, and Saturday afternoons are closed sanctuary-wide. This is a direct, mechanical consequence of the two rules combined. Confirmed acceptable by Ro (consistent with the Horse Whisperer Course also having no Saturday availability).
- **Weight selector added to Beach Photoshoot only** (not Stable/Rice Field/Paddock/Cottages), since it's the only photoshoot where riders mount a horse. Confirmed with Ro; flagging for Simone's awareness since it's a new behaviour (photoshoots previously never asked for weight).
- **Paddock/Stable/Rice Field 3 hr price (IDR 3,750,000)** is derived from Simone's existing +500K per 30 min pattern. Awaiting her final sign-off.
- **Insta Ride 1hr/1.5hr prices** (IDR 1,600,000 / 2,000,000) were copied directly from Beach & Rice Field Ride, per Ro's explicit instruction. Awaiting Simone's sign-off, same as the other derived prices on this list.
- **Horse grooming 1.5hr price** (IDR 1,875,000) was calculated as 1.5× the 1hr price, per Ro's explicit instruction. Awaiting Simone's sign-off.
- **Photographer add-on sold independent of shoot duration** (any tier up to 2 hr, regardless of how long the shoot itself is). Confirm with Simone that this matches her intent.
- **Dressage Masterclass position:** the new Lessons order only specified 4 items; Dressage was appended at the end (5th position) per Ro's confirmation. No change to its pricing, copy, or slots.

## Working with Simone

Simone is not technical. Do not expect her to review code. She reviews:
- The live site (or a preview URL) end-to-end as a booker would experience it
- The Google Sheet "Customer Offerings" tab
- Prose summaries of what's changing, no jargon

Deliverables are always: updated `index.html` (deployed), a TSV paste block for the sheet, and a CHANGELOG entry summarising what shifted.
