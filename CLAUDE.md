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

### Photoshoots

| Shoot | Duration | Pricing | Time slots | Group cap |
|---|---|---|---|---|
| Beach | 1 or 1.5 hr | Per horse per hour (IDR 1,750,000 / 2,250,000) | Any start 08:00 to 16:00 | 3 people (2 mounted, 1 standing) |
| Paddock | 1, 1.5, 2 or 3 hr | Flat per hour (IDR 1,750,000 / 2,250,000 / 2,750,000 / 3,750,000) | Morning 08:30-11:30 or afternoon 14:30-17:30 | 5 people |
| Stable | 1, 1.5, 2 or 3 hr | Same as Paddock | Same as Paddock | 5 people |
| Cottages | 1 session (3 hr) | IDR 4,500,000 per session | Morning 08:30-11:30 or afternoon 14:30-17:30 | 6 people per cottage |

**Photographer add-on** (all photoshoots): 1hr = IDR 2,000,000 (20 photos), 1.5hr = IDR 3,000,000 (30 photos), 2hr = IDR 4,000,000 (40 photos). 3hr cottage sessions cap at the 2hr package. Package length matches the shoot duration automatically.

### Rides

- **Beach & Rice Field Ride:** 1 or 1.5 hr, per person (IDR 1,600,000 / 2,000,000).
- **Insta Ride:** fixed 2 hr, per person (IDR 2,400,000). Same route as the 1.5 hr ride with more photo stops.
- **Weight rules in the UI:** blanket 78 kg max, max 2 riders over 70 kg. Per-horse allocation (Lundstar walk-only max 1 hr, Othello all gaits at 78, Whiskey max 50 kg, others under 70) is handled by Simone on WhatsApp confirmation and intentionally NOT enforced in code.

### Lessons

| Lesson | Max duration | Pricing basis | Price |
|---|---|---|---|
| Dressage Masterclass | 50 min | Per rider (private) | IDR 2,900,000 |
| Join Up | 1.5 hr | Per person | IDR 2,500,000 (1hr) / IDR 3,150,000 (1.5hr) |
| Lunge | 1.5 hr | Per person | IDR 2,500,000 (1hr) / IDR 3,150,000 (1.5hr) |
| Horse Care | 1 hr | Per booking (flat) | IDR 1,250,000 |
| Horse Whisperer Course | 3 sessions | Flat, 1 or 2 people same price | IDR 22,500,000 total |

**Horse Whisperer Course:** 10 hrs total across 3 sessions (2 × 3 hr + 1 × 3.5 hr). Must sit inside a single Mon-Sat week. Only one course booking accepted per week. Minimum age 8. Simone rejects duplicate bookings on WhatsApp.

## Open items (not yet resolved)

- **Test WhatsApp number** in `index.html` (`WA_NUMBER`) must be swapped for Simone's real number before go-live.
- **Paddock/Stable 3 hr price (IDR 3,750,000)** is derived from Simone's existing +500K per 30 min pattern. Awaiting her final sign-off.
- **Photographer for 3 hr cottage sessions** is capped at the 2 hr package price. Confirm with Simone if she'd rather offer a bespoke 3 hr rate.

## Working with Simone

Simone is not technical. Do not expect her to review code. She reviews:
- The live site (or a preview URL) end-to-end as a booker would experience it
- The Google Sheet "Customer Offerings" tab
- Prose summaries of what's changing, no jargon

Deliverables are always: updated `index.html` (deployed), a TSV paste block for the sheet, and a CHANGELOG entry summarising what shifted.
