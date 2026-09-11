# Changelog

All notable changes to the Salty Cowboy booking engine, most recent first.

## 11 Sep 2026 - LESSONS-BOOK-FOR-OTHER: booking on someone's behalf opens to Lessons

Ro: "the lessons should be able to get booked by someone else, much like the rides."

`dressage` already had it, because it carries `riding: true`. This adds the other four Lessons:
`joinup`, `whisper`, `masterclass`, `groupclinic`. New flag `canBookForOther = !isPhotoshoot`, which
is exactly Rides plus Lessons today, replacing `isRiding` at all four gates (the render, the defensive
reset effect, the log row and the WhatsApp payload). Photoshoots stay excluded, since Ro named Lessons
and Rides only.

The part that was not a gate change: **the flow it opens is written for riders.** Checking the box
pops a modal whose middle section is a 75kg weight guideline, and the copyable message and the
WhatsApp line to Simone both repeat it. Four of the five Lessons are groundwork and never collect
weight at all, so shipping the gate alone would have told someone booking a Join Up session that their
friend must weigh under 75kg. All three are now gated on `showWeight`:

- `buildRiderInfoMessage` omits the weight block, so the message the booker copies has arrival, cost
  and closing only. No new copy in any language, the section is simply absent.
- The modal renders the same section conditionally, so what is on screen matches what gets copied.
- The WhatsApp line reads "Booking on behalf of another rider. 75kg weight guideline shown..." where
  weight was collected, and "Booking on behalf of someone else. Arrival and cost info shown..." where
  it was not.

One bug came with the gate and is fixed here. `buildRiderInfoMessage` built its date line from
`formattedDates[0]` alone, which was safe while only `beach`, `insta` and `dressage` could reach it,
all single-date. `whisper` carries three dates, so the person being booked for would have been told
they were booked for **one day of a three-day course**. It now mirrors the course/single split that
`buildWhatsAppMessage` already made, reusing `courseDaysTitle` and `timeSlot`, both of which already
exist in all three languages, so again no new copy.

Also renames the log column `grooming` to **`grooming_type`**, after Ro asked twice what it meant. It
holds `wet`, `dry` or blank, and it is which grooming STYLE was picked on the one activity that offers
one, not whether grooming happened. Horse Whispering includes 2 hours of grooming and is correctly
blank in it. Same column position, so the sheet side is paste and re-run `setupHeaders()`, with no
row clearing and no column deleting.

Known and untouched: `bookingForOtherNote` is defined in all three languages and referenced nowhere.
It is the old weight-warning copy, dead since the modal replaced it.

686 assertions pass (up from 675), smoke clean, 0 console errors.

## 11 Sep 2026 - LOG-RIDER-PROFILE: age, weight and experience per rider, schema v2

Ro asked for age, weight and riding experience in the log, names excluded so nothing in the sheet is
linked PII. Weight was already there as `w1`-`w4` head counts, which answer "how heavy is this group"
but not "is the advanced rider the same person as the 12-year-old". Three new columns answer that:

- `ages` (`"34,29,12"`), `weights` (`"w2,w3,w1"`), `experience` (`"e3,e4,e1"`). **Index-aligned**:
  position `i` is the same rider in all three. Raw values, not buckets, because raw can always be
  aggregated later and buckets can never be recovered.
- `riderList` returns `""` instead of `",,"` when a field was never collected. Photoshoots ask for
  neither age nor experience, so those cells are genuinely empty rather than falsely present.
- Names are still not logged and cannot be: `riderList` reads by key, so `riderList("name")` is the
  only way one could reach the row, and `missing('riderList("name")')` asserts it never appears.
- **Three derived columns removed: `is_course`, `weight_asked`, `date_count`.** Ro spotted each in
  turn. What decides whether a derived column earns its place is how painful the derivation is as a
  sheet formula, not whether it is technically redundant:
  - `is_course` was `=activity_id="whisper"`. `whisper` is the only activity with `course: true`.
  - `weight_asked` was `=SUM(w1:w4)>0`, and is now also just an empty `weights`. The comment
    justifying it claimed four zero counts could not be told apart from "asked, everyone was light".
    That was **wrong**: index.html:2958 makes `r.weight` mandatory for every rider whenever
    `showWeight` is on, so "everyone light" is `w1 = num_people`, and four zeros only ever meant not
    asked. The column never earned its place, including on the day it was added.
  - `date_count` was `=COUNTA(SPLIT(dates_iso,","))`.
  `w1`-`w4` stay. Answering "did anyone exceed 70kg" from the string `"w2,w3,w1"` means splitting and
  matching per row, and that is the question that tells Simone she has a horse problem.
  Removed now because the sheet holds only test rows, which is the last moment it costs nothing.
- `LOG_SCHEMA_V` goes 1 to 2, so the rows written before today stay readable as the shape they are.

The three columns are appended at the **end** of `COLUMNS`, after `outcome` and `horse`, which reads
oddly and is deliberate: `setupHeaders()` rewrites row 1 and leaves the data rows alone, so inserting
`ages` next to `w4` where it belongs would shift every header one place right of its own data.

Deploying this is two steps, not one. `doPost` maps the payload onto whatever headers the sheet has
right now, so until `setupHeaders()` is re-run the three new fields are **dropped in silence**.

675 assertions pass (up from 667), smoke clean, 0 console errors. The sheet drops from 29 columns
to 26.

## 10 Sep 2026 - WHISPER-FIXED-SCHEDULE: course times match what Simone actually runs

From Simone, via Ro: "We usually schedule a course on Monday 8.30-12.00, Tuesday 8.30-12.00, Thursday
9.00-12.00. If people need to customize times they can text me."

The app did not match that in three ways at once. It offered a **9:30am start she does not run**, it
applied **one shared time to all three days**, and it therefore **hid that Thursday starts at 9:00**,
half an hour later than Monday and Tuesday. No end time was shown anywhere. The 10-hour total in the
copy (3.5 + 3.5 + 3) already agreed with her schedule, so only the times were wrong.

Since the times are fixed, step 1 no longer offers a choice:

- `WHISPER_TIME` = `"Mon & Tue 8:30am, Thu 9:00am"`, and `WHISPER_SLOTS` is that one value. Keeping it
  a slot list means `availableSlots`, the slot-drop effect and `section1Complete` need no special
  cases. An effect auto-selects it once the course week is picked, so the WhatsApp payload, the
  summary line and the booking log's `time` column all behave exactly as for every other activity.
- Step 1 renders the three real times read-only (`.whisper-schedule`), with a line telling the
  customer to message Simone for anything different, which is her own stated fallback.
- The WhatsApp course line now reads "Course runs Mon 8:30am-12:00pm, Tue 8:30am-12:00pm, Thu
  9:00am-12:00pm, all within one week", so Simone can see at a glance whether a booking matches her
  standard schedule.
- The customer-facing activity description advertised "an 8:30 or 9:30am start each day" in **all
  three languages**. Rewritten in each to state the real per-day starts and the midday finish.
- Deleted a stale comment above the slots that described the shared start "across all four days". The
  course has been 3 days since 29 Aug 2026, so that line had been wrong on two counts for a fortnight.

**One test of mine was wrong and the suite caught it.** A `missing('"9:30am"')` failed with 4 hits:
Join Up, Dressage, Horse grooming and the 2hr ride slots all legitimately run 9:30am. `assert.js`
counts substrings across the whole file with no scoping (see `TODOS.md`), so it cannot express "not
inside `WHISPER_SLOTS`". Replaced with a needle pinning the old `WHISPER_SLOTS` line itself.

Verified in a browser: the schedule renders correctly, and the same booking exercised the
month-straddling course week, one tap on 28 Sep selecting 28 Sep, 29 Sep and 1 Oct.

`tests/assert.js`: 652 to 667. Both suites pass from inside `tests/`, 0 console errors.

## 10 Sep 2026 - CHECKBOXES-UNDER-WHOS-COMING: both optional-extra checkboxes into section 2

Per Ro: "I'm booking for someone else" and "Add a Salty Cowboy photographer" both sit under
"2. Who's coming?". No pricing, copy or offering data changed, so no TSV block.

The photographer add-on was already the last thing in section 2 and stays there. The
booking-for-other checkbox moves back in from its own `step2-section-box` card under the booking
summary, where the 1 Sep 2026 RIDER-INFO-UNDER-SUMMARY change had put it, and now sits directly
above the photographer group. Both use `addon-group` and hide with `section2Collapsed`.

**The tradeoff this makes, stated plainly.** The 1 Sep move existed to keep the checkbox visible
regardless of the accordion. Back inside section 2, it hides once the rider fields are complete and
section 2 auto-collapses. Reopening is one tap on the section heading, or the summary card's Edit
link, which reopens sections 1 and 2. Worth watching for on a real booking: a customer who decides
they are booking for someone else only after filling in the rider details has to reopen the section
to say so.

No state logic changed. The rider-info popup still opens on check and closes on uncheck via the
`bookingForOther` effect, which never depended on where the checkbox rendered. The two checkboxes
are mutually exclusive on screen anyway, since `isRiding` and `isPhotoshoot` never overlap.

- Gate simplified from `screen === "riders" && isRiding && riders.length > 0` to
  `isRiding && riders.length > 0`, since section 2 already sits inside a `screen === "riders"` block.
- `step2-section-box fu step2-block` now has one user again (the summary/total/notes/Send block).
- The section-3 blocked-note now runs straight into `cost-funds-card`.

`tests/assert.js`: 650 to 652. Six needles pinning the 1 Sep position updated, two added. Both suites
pass from inside `tests/`, 0 console errors.

## 10 Sep 2026 - COURSE-WEEK-PICKER: Horse Whisperer date picker books a week at a time

Found by Ro on a real phone during the booking-log acceptance gate. Picking a course date could grey
out every remaining date, leaving 1 of 3 selected, a disabled Send button, and nothing on screen
explaining why. No offering or pricing data changed.

**Two separate bugs, one symptom.**

1. *The part-past week.* The course runs Mon, Tue and Thu. On a Thursday, that week's Monday and
   Tuesday are already in the past, so the Thursday was still tappable but the booking could never be
   completed. Reproduced exactly: today is Thu 10 Sep 2026, and Thu 9/10 was offered while Mon 9/7 and
   Tue 9/8 were not.
2. *The month straddle.* The week of Mon 28 Sep runs 9/28, 9/29 and **1 Oct**. Picking the Monday left
   the only remaining valid days in a month the calendar was not showing, so September appeared
   entirely greyed out. Not yet hit, but it recurs at the end of most months.

**The fix follows from the real constraint.** Mon/Tue/Thu inside one week means there is exactly ONE
valid set of days per week, so picking three dates was theatre; the only real choice is the week.

- `COURSE_DOWS`, `courseWeekDates(s)` and `courseWeekBookable(s)` added at module level.
  `courseWeekDates` walks from the containing Monday and lets `Date` normalise month and year
  overflow, which is what makes the straddling week work.
- `isAvailableDay` now greys out every day of a week that cannot be completed. Days in other bookable
  weeks stay live on purpose, so tapping one moves the booking rather than forcing a clear first.
- `handleDayClick` selects all three days of the week in one tap; tapping a selected day clears it.
- `removeDate` drops the whole week rather than leaving 2 of 3 and a silently disabled Send button.
- `pickCourseDays` copy updated in all three languages: it said "Select 3 days for the course", which
  no longer describes the interaction.
- `weekKey` deleted. The same-week lock was its only caller.

Verified by simulation across September and October 2026: **zero dead-end days**, Thu 9/10 correctly
no longer offered, and the 9/28 week selecting 9/28, 9/29 and 10/1 from any of its three days.

`tests/assert.js`: 640 to 650. Both suites pass from inside `tests/`, 0 console errors.

## 10 Sep 2026 - BOOKING-LOG-ENDPOINT: log endpoint deployed and wired in

Completes the previous entry. The spreadsheet, Apps Script deployment and `LOG_ENDPOINT` are now live.
No offering or pricing data changed.

- New spreadsheet "Salty Cowboy booking log", tab `log`, timezone `Asia/Makassar`, 26 headers written
  by `setupHeaders()` and frozen. Separate from Simone's Customer Offerings sheet.
- Web app deployed. First attempt returned HTTP 401 against an anonymous POST, which is exactly the
  silent failure this project was built to detect: `sendBeacon` would have reported success, the
  try/catch would have seen nothing, and the sheet would have stayed empty indefinitely looking like
  "no bookings". Caught by curl before a single real booking. Redeployed with the access setting
  corrected, same URL.
- Verified end to end: a valid POST appends a row with all fields in the right columns, and a POST
  with an unknown `activity_id` is dropped. Test rows deleted.
- `LOG_ENDPOINT` now holds the `/exec` URL. It is public by necessity, since GitHub Pages serves this
  file from a public repo and the URL is readable from the live page source either way. The earlier
  assertion pinning it EMPTY was wrong, and is replaced by one pinning the exact URL, so a typo or an
  accidental blanking fails loudly instead of silently logging nothing.
- Checked statically that the 26 keys `bookingLogRow` sends match the 26 sheet columns exactly: no
  field dropped, no column permanently blank, and no rider name, age or notes text in the payload.

`tests/assert.js`: 639 to 640. Both suites pass from inside `tests/`, 0 console errors.

**Still unproven:** no booking has been made from a real phone. The acceptance gate has not been run.
Nothing automated can catch a zero-indexed month in `dates_iso`; that has to be read off the sheet.

## 10 Sep 2026 - BOOKING-LOG: write-only booking log, off until an endpoint is pasted in

Phase 1 of the booking log designed in office hours (9 Sep) and reviewed in plan-eng-review (10 Sep).
The site currently measures nothing: no `fetch`, no `localStorage`, no analytics of any kind. This adds
a fire-and-forget row per Send click. Nothing is read back, no availability logic changes, and the site
must keep working with the endpoint unreachable.

No offering or pricing data changed, so no TSV block for the Google Sheet.

**Off by default.** `LOG_ENDPOINT` ships as `""` and `logEvent` returns immediately when it is empty,
so a fork of this repo can never post into Simone's spreadsheet. An assertion pins it empty.

**`index.html`:**

- `LOG_ENDPOINT`, `LOG_SCHEMA_V`, `newRef()`, `SESSION_ID` and `logEvent(type, build)` at module level.
- `bookingLogRow(ref)` inside `App`. A whitelist: 25 named fields, no rider names, no ages, no notes
  text. `notes` contributes only a `has_notes` boolean.
- `handleSend` appends a short `Ref: SC-XXXXXX` to the outbound message and logs the same value, so a
  sheet row can be matched back to Simone's WhatsApp thread. `buildWhatsAppMessage` and its call site
  are byte-identical; the ref is appended to a separate value afterwards.
- Send button latches on first click (`sending`), cleared by `resetAll` and by all three
  activity-change handlers. Fixes an existing customer-facing bug: `window.open` often fails to take
  focus on iOS, so a double tap sent Simone two identical messages.

**`apps-script/Code.gs`:** new, not deployed from this repo, kept here so it stays version-controlled
next to the schema it has to agree with. `doPost` takes a script lock, validates `activity_id` against
the twelve real ids, stamps `ts_server`, and appends by header name rather than by position. Also
`setupHeaders()` and `setupDeadLogTrigger()`.

**Three things worth knowing:**

1. `logEvent` takes a THUNK, not a built row. Calling it as `logEvent("booking", bookingLogRow(ref))`
   would evaluate the builder as an argument, outside the try/catch, and a throw would land between
   `openWhatsApp` and `setScreen("confirm")`: WhatsApp opens, the confirm screen never renders, the
   copy fallback is never shown. Logging must not be able to cost a booking.
2. `dates_iso` uses `s.m + 1`, because `sortedDates` months are zero-indexed (`MONTHS[s.m]`). Nothing
   automated can catch an off-by-one here; it has to be read off the sheet by eye.
3. The PII whitelist cannot be proven by any assertion. `tests/assert.js` counts substrings across the
   whole file and cannot scope to a function body, so pinning `bookingLogRow`'s source is the only
   defence and it only catches an edit to that function. Logged in `TODOS.md`.

`tests/assert.js`: 618 to 639. Seven existing needles updated for the `sending` latch, 21 added.
Both suites pass from inside `tests/`: 639 / 639, 0 console errors.

**Not shipped yet:** the endpoint itself. `LOG_ENDPOINT` is empty, so nothing is logged until the
spreadsheet exists and its `/exec` URL is pasted in. See the setup block at the top of `Code.gs`, and
note step 6: "Who has access: Anyone", not "Anyone with a Google account". That one fails silently.

## 10 Sep 2026 - DOCS-ACCORDION-ACCURACY: fix drifted step 2 accordion docs, add TODOS.md

Documentation only. No change to `index.html`, no change to the deployed site, no offering or pricing
data changed, so no TSV block for the Google Sheet.

`CLAUDE.md:30` had drifted from the code in five ways, all found while planning the booking log:

- It named `section1ManualOpen` / `section2ManualOpen`. Those identifiers do not exist. The code uses
  `section1Override`, `section2Override` and `section3Override` (`index.html:2725-2727`).
- It called them booleans. They are three-state: `null` means never toggled, so the automatic default
  applies; `true` or `false` is an explicit manual choice.
- It gave one collapse formula for both sections ("same pattern for section 2"). Each section has a
  different default. Section 2's is `!section1Complete || detailsComplete` (`2938`), a sequential
  reveal, not a completion flag.
- It said section 3 is not collapsible. Section 3 IS collapsible (`2951`), with an inverted default.
- It did not document `blockedSection` at all (`toggleSection2` / `toggleSection3`, `2752-2766`),
  which blocks opening a section ahead of sequence, shows a note for 3 seconds, and never blocks
  closing. Nor the Edit link's deliberate bypass of that guard.

`TODOS.md` is new: three verified open defects found in the same pass and deliberately not fixed here.
`riders` is not reset by the category-tab handler (`3147-3155`) though every other activity-change path
calls `setRiders([])`; the hero logo (`3112`) returns to the activity screen with all state intact,
unlike `resetAll` (`2815`); and `tests/assert.js` (`5-14`) counts substrings across the whole file with
no function-body scoping, so it cannot express "X does not appear inside function Y".

Both suites pass unchanged: 618 / 618 on `assert.js`, 0 console errors on `smoke.js`.

## 8 Sep 2026 - FOLDER-SINGULAR: local folders renamed to match the singular brand

Local environment change, no effect on the repo contents or the deployed site. Both local folders were
still plural and were the last thing keeping the wrong name in circulation:

```
~/Documents/Salty Cowboys Booking Engine/salty-cowboys
~/Documents/Salty Cowboy Booking Engine/salty-cowboy      <- now
```

The parent was renamed too, so the five sibling folders (`Archive`, `booking.info`, `Images`,
`Product Offering`, `Salty Cowboy Skills`) moved with it. Three things were updated to follow:
the 13 absolute paths in the gitignored `.claude/settings.local.json` (rewritten and re-validated as
JSON, so Ro's permission allowlist keeps matching), Claude Code's project-history directory under
`~/.claude/projects` (renamed to the new path slug so the five previous sessions still resolve), and
the "Naming" line in this repo's `CLAUDE.md`.

Verified after the move: `git status` clean, `origin` intact at `github.com/threshold-00/salty-cowboy`,
HEAD still `1cb59d6`, tests 618/618 with a clean smoke run.

Only `salty-cowboys-tests`, the package name in `tests/package.json`, is still plural. It is the CI npm
cache key (`cache-dependency-path: tests/package.json`), so renaming it would invalidate the cache for
no benefit.

## 8 Sep 2026 - GSTACK-REFERENCE: gstack skills documented in CLAUDE.md, one stale brand plural fixed

Added a "gstack skills" section to `CLAUDE.md`, between "Commands" and "Business rules". gstack was
installed globally on this machine the same day (`~/.claude/skills/gstack`, 52 skills, all prefixed
`/gstack-*`). The section records which skills are worth using here (`/gstack-qa`, `/gstack-investigate`,
`/gstack-review`, `/gstack-spec`), which do not apply (every `/gstack-ios-*` skill, and the deploy
skills, since GitHub Pages already serves `main` on push with no build step), and states plainly that
the "Default change workflow" steps 1 to 7 always take precedence: gstack never overrides the em-dash
ban, the assert.js-plus-CHANGELOG pass, or the approval gate before commit and push. Also notes that
the browser-driving skills run a bundled Chromium and are the first thing the OS kills on an 8GB Mac.

Separately, `tests/package.json` still described itself as the "Salty Cowboys booking engine". Changed
to the singular "Salty Cowboy", which the 3 Sep 2026 BRAND-NAME-SINGULAR pass established as the
correct brand name. That pass cleaned `index.html` (0 plurals remaining, 24 singular) but missed this
one line, which is prose rather than app copy so no assertion caught it.

Deliberately left plural: every occurrence in `CHANGELOG.md` and the dated `docs/` briefs, which are
historical records quoting copy as it stood at the time, the needle string in `tests/assert.js` line
268, which has to contain the plural in order to search for it, and the `salty-cowboys` repo slug,
directory name and package `name` field, since renaming those changes the deploy URL.

Also corrected the test commands in `CLAUDE.md`, in both workflow step 6 and the "Commands" block.
They said `node tests/assert.js` from the repo root, but both test files resolve `../index.html` and
so fail with ENOENT unless run from inside `tests/`. The `node --check` line does read from the repo
root, so an explicit `cd ..` was added ahead of it.

Corrected the repo and deploy URLs in `CLAUDE.md`, which were wrong in two separate ways. The "Deploy"
line named `pursuit-098.github.io/salty-cowboys`, a stale owner. Ro gave `github.com/threshold-00/salty-cowboys`
as the correction, but that plural path returns a 301 from the GitHub API: the repo has been **renamed to
the singular** `github.com/threshold-00/salty-cowboy`, matching the 3 Sep 2026 BRAND-NAME-SINGULAR decision.

Verified on 8 Sep 2026 via the API (`full_name: threshold-00/salty-cowboy`, `has_pages: true`,
`homepage: https://threshold-00.github.io/salty-cowboy/`) and by fetching the live site, which returns
200 with the title "Salty Cowboy - Book your experience". The plural Pages URL is a hard 404 rather than
a redirect, which is why both URLs failed the first check: one had a dead owner, the other a dead slug.

`CLAUDE.md` now records the singular repo and live URL, notes that GitHub 301-redirects the old plural
repo path (so plural links and pushes still work and the rename is easy to miss), and adds a short
"Naming" line listing the only two places the plural legitimately survives: the local folder and the
`salty-cowboys-tests` package name. The `origin` remote still points at the plural path and the local
folder is still plural; both work via the redirect and were left for Ro to change. The stale
`pursuit-098` URL also appears in `docs/step2-figma-parity-batch.md`, left as-is because that is a dated
brief recording what was true when it was written.

Tooling: `gh` 2.100.0 installed via Homebrew this session, not yet authenticated. The API checks above
were done unauthenticated with curl.

No change to `index.html`. Tests pass: 618 / 618 assertions, smoke render clean with 0 console errors.

## 6 Sep 2026 - WEIGHT-LESSONS-LINK: 'Lessons' in the weight warnings is now a link, lighter heading

Both weight warnings (`w3`, over 70kg, and `w4`, over 75kg) told riders that off-saddle
activities live under 'Lessons' but gave them no way to get there. The quoted word is now a
button that switches to the Lessons category and returns to step 1.

Each language gets a `lessonsToken` key holding the exact quoted substring in that language
('Lessons', 'Pelajaran', and the guillemet form for Russian), since the word and its quote marks
differ per language. A helper, `bodyWithLessonsLink`, splits the body around that token and
renders the middle as a button. If the token is not found it returns the plain string unchanged,
so a future copy edit can never blank out a warning body.

`goToLessons` mirrors the existing category-tab reset (activity, duration, group size,
photographer add-on, booking-for-other, grooming, dates, time) so no stale state carries across
from the ride the customer was configuring.

Also lightened `.ww-title` from font-weight 600 to 500, per Ro. Added `.ww-link` (inherits the
body colour, underlined with a 2px offset, darkens on hover).

The minimum-age warning is untouched: it does not mention Lessons. Added 10 assertions to
`tests/assert.js` (618 passing, including a `missing()` guard against the old 600 weight).
`tests/smoke.js` clean. No pricing or offering data changed, so no Google Sheet update needed.

## 3 Sep 2026 - BEACH-SHOOT-MOUNTED: Beach photoshoot walk to the sand is now ridden, not led

The Photoshoots intro paragraph (`introPhotoshoots`) said riders would "walk alongside your horse
down to the sand" for the Beach shoot. Corrected to "sit on your horse for the walk down to the
sand", so the copy matches what actually happens on the day. Indonesian and Russian updated to
match ("menunggangi kuda saat berjalan menuju pasir", "проедете верхом на лошади по пути к воде").

This is the only copy in the app that described the walk down, and it does not change any
operational rule: the Beach shoot was already the one photoshoot where people mount a horse, which
is why it is the only photoshoot with a weight selector (75 kg cap, up to 2 mounted). Nothing else
in `index.html` touched.

Added 4 assertions to `tests/assert.js` (608 assertions, all passing), including a `missing()` guard
against the old wording. `tests/smoke.js` clean, 0 console errors. No pricing or offering data
changed, so no Google Sheet update needed.

## 3 Sep 2026 - MONEYGOES-VERBATIM: funding copy switched to the client's exact given wording

The 2 Sep 2026 CLIENT-COPY-FEEDBACK pass had rewritten the funding copy (`moneyGoesBody`) as an
editorially-smoothed paraphrase of the client's suggestion. The client asked for the literal text
instead, so `moneyGoesBody` (English) now reads: "Every booking goes straight back into the
paddock; vet care, feed, farrier visits, and the horses themselves. Some come in underweight or
scared of people. We give them time until they're ready. Some go back to gentle riding to make
money for their friends, others can go to a family that is curated by us, that will adopt them and
take care of them properly." Indonesian and Russian translated to match the same semicolon/comma
structure and phrasing as closely as each language allows, rather than the smoother paraphrase used
before. Still used by both the Step 2 cost-funds-card and the rider-info modal, no other copy or
code touched.

Updated `tests/assert.js` (604 assertions, all passing) and `CLAUDE.md` to match. No pricing or
offering data changed, so no Google Sheet update needed.

## 3 Sep 2026 - BRAND-NAME-SINGULAR: "Salty Cowboys" reverted to "Salty Cowboy" everywhere

Ro confirmed "Salty Cowboy" (singular) is the correct brand name, reversing part of yesterday's
CLIENT-COPY-FEEDBACK pass, which had standardized the app's mixed usage on "Salty Cowboys"
(plural) after the client flagged the hero logo image as the odd one out. The logo was actually
right all along: it reads "SALTY COWBOY", singular, and always has. Checked the archived source
logo file too (`Images/Archieve/saltycowboylogofinal.avif`), same wording, further confirming
singular is correct.

Every occurrence of "Salty Cowboys" in `index.html` changed to "Salty Cowboy": the page `<title>`
and meta description, the loading-screen label, the logo `alt` text, `byoPhotographer`,
`addonTitle`, `introPhotoshoots`, `notesPlaceholder`, `notice`, `riderInfoMsgIntro` (all three
languages where applicable), plus the WhatsApp message title and the photographer add-on line in
`buildWhatsAppMessage` (always English). 24 occurrences total, a plain global find/replace, no
other wording touched. `CLAUDE.md`'s own title and opening line updated to match ("Salty Cowboy
Booking Engine" / "Salty Cowboy Bali"); the Open Items entry flagging the logo as needing a
corrected asset is now marked resolved, no asset ever needed fixing, only the surrounding copy did.

Code: `sed -i '' 's/Salty Cowboys/Salty Cowboy/g' index.html`, verified against a `node --check`
syntax pass since the replacement touches JS string literals, not just markup. Updated
`tests/assert.js` needles to match (604 assertions, all passing) and inverted the one regex-based
assertion that had been checking for zero leftover singular uses into one checking for zero
leftover plural uses. No pricing or offering data changed, so no Google Sheet update needed.

## 2 Sep 2026 - CLIENT-COPY-FEEDBACK: intro/description copy rewritten across all three languages

A round of client feedback on live copy. No operational rules changed (durations, prices, group
caps, slots are all untouched); this is a copy-only pass across English, Indonesian and Russian.

Rides intro dropped "emerald rice fields" and "especially magical" for plainer language. Insta
Ride's description now leads with "our longest ride at 2 hours" and "more stops for photos",
client-supplied copy adopted closely to verbatim. The "Who's coming?" subtitle is now "A few
details to help us prep for your group." The funding copy (used by both the Step 2 cost-funds-card
and the rider-info modal) was rewritten to cover the two outcomes for a recovered horse: back to
gentle riding to help fund the herd, or adopted out to a vetted family, dropping the "began as a
rescue and still is one" framing. Photoshoots intro opens with "Photos with our rescue horses at
our best spots around the property" instead of "Beautiful, story-telling photos... most scenic
backdrops." Lessons intro simplified to two direct sentences. Horse Whisperer Course description
rewritten in plainer language, closing line changed from "Bring a friend for free" to "This course
is for two people, so bring your friend!" (the separate gift-chip badge on the Step 1 card is
unchanged, still accurate since the course price is flat for 1 or 2 people). Group Clinic's closing
clause changed from "any team or boardroom... horse people alike" to "any team setting... friend
groups that ride."

Two smaller fixes caught in the same pass, not explicitly requested but adjacent to what was being
edited: the mid-sentence "Photographer" in `byoPhotographer` was lowercased (client-reported
capitalization inconsistency in the photoshoot tab), and every remaining singular "Salty Cowboy
[noun]" adjectival use (`addonTitle` in all 3 languages, `introPhotoshoots` in id/ru, the WhatsApp
payload's add-on line) was changed to "Salty Cowboys", matching `byoPhotographer` and the funding
copy which already used the plural. Also caught: `introPhotoshoots` was still quoting the old
photographer add-on price (IDR 2,500,000/25 photos) from before the 1 Sep 2026 PHOTOG-PRICE-FLAT
change, corrected to IDR 2,000,000/20.

"Golden hour" wording convention updated: capitalized only when it starts a sentence, not
everywhere, since the client's given copy used it lowercase mid-sentence in two places.

**Not fixed, flagged for Ro:** the client also reported the hero logo image still reads "SALTY
COWBOY" (singular). It's a base64-encoded raster PNG baked into `index.html`, not text, so it can't
be corrected with a code edit. Checked the archived source file in the parent project folder
(`Images/Archieve/saltycowboylogofinal.avif`) for a ready fix; it has the identical wording, so
there's no corrected asset anywhere in the project to swap in. Needs a regenerated logo file. See
CLAUDE.md Open Items.

Code: no structural changes, translation-object string edits only, across `T.en`, `T.id`, `T.ru`.
Updated `tests/assert.js` (604 assertions, all passing) and `CLAUDE.md`/`CHANGELOG.md` to match. No
pricing or offering data changed, so no Google Sheet update needed for this entry.

## 1 Sep 2026 - RIDE-DURATION-SPLIT + PHOTOG-PRICE-FLAT: rides lose their shared durations, photographer add-on repriced

The two rides no longer offer the same durations. Insta Ride is now 2 hours only (dropped 1hr and
1.5hr); its description now emphasizes that the full 2 hours means more time and more stops to
capture great photos along the way, since it's now the longest ride. Beach & Rice Field Ride is
now 1 or 1.5 hours only (dropped 2hr, which it had only gained a few days earlier in the BEACH-8AM
commit). Both rides still read start times from the same shared `RIDE_SLOTS` table (8:00am plus
one fixed afternoon start per duration), but each activity's own `durations` array now points at a
disjoint subset of it, so the two rides no longer share any duration option at all. Prices for the
durations that remain are unchanged: Beach & Rice Field Ride 1hr IDR 1,600,000 / 1.5hr IDR
2,200,000; Insta Ride 2hr IDR 2,700,000.

The photographer add-on's price formula changed from an IDR 2,500,000-anchored, 500,000-per-30-min
block formula to a flat IDR 2,000,000 and 20 photos per hour, across every photoshoot: 1hr IDR
2,000,000 (20 photos), 1.5hr IDR 3,000,000 (30 photos), 2hr IDR 4,000,000 (40 photos), 3hr IDR
6,000,000 (60 photos). The three shorter tiers are Ro's exact given figures; she didn't give a 3hr
figure (needed for Stable, Paddock, and Cottages, whose only duration is 3hr), so the 3hr price
extrapolates the same flat rate, per her explicit confirmation of that approach, awaiting Simone's
sign-off same as the other derived prices in this file.

Code: `photographerAddonPrice(duration)` simplified from a block-increment formula to `hours *
2000000` / `hours * 20`, reusing the existing `DURATION_HOURS` lookup, no new duration keys added.
`ACTIVITIES` entries for `beach` and `insta` had their `durations` arrays trimmed; each activity's
`prices.*` array in all three languages was trimmed in parallel so indices still line up with the
shorter `durations` array.

Fresh Customer Offerings TSV generated reflecting the new ride durations/prices and photographer
add-on prices (see chat).

## 1 Sep 2026 - RIDER-INFO-MODAL: popup with rider info, ready to copy and forward

The "I'm booking for someone else" checkbox now lives in its own card directly under "3. Your
booking summary" (above the "What your booking cost funds" card), instead of inside the "Who's
coming?" accordion, so it stays visible regardless of whether that section is collapsed. It also
now opens a popup automatically the moment it's checked, instead of just revealing a static
weight-only note. The popup carries everything the
actual rider (not the booker) needs to know before they arrive: arrival time (new copy, "please
arrive 15 minutes before the start time"), the 75kg weight guideline, and where the booking cost
funds, reusing the existing "What your booking cost funds" copy rather than duplicating it. Below
that sits a ready-to-copy message in the booker's own site language (English, Indonesian or
Russian, whichever they currently have selected, unlike the WhatsApp message to Simone which is
always English), opening with a greeting and a one-line activity/date/time summary, then the same
three sections, then a closing line. A "Copy message" button copies it, using the same
clipboard-then-textarea-fallback pattern already used for the WhatsApp message.

Closing the popup (✕ button or backdrop click) does not uncheck the box. In its place, the old
inline note's spot now shows a short reopen prompt ("We've prepared everything they need to
know...") that reopens the same popup on click, so the booker can view or copy the message again
without unchecking and rechecking the box. Unchecking the box removes the reopen prompt and closes
the popup if it happens to be open.

Code: two new state booleans, `showRiderInfoModal` and `riderInfoCopied`. The checkbox's onClick
now sets `bookingForOther` and, only when turning it on, also opens the modal. A single
`useEffect` keyed on `bookingForOther` closes the modal and resets the copy feedback whenever the
box goes false, covering every existing reset path (activity change, category switch, the
defensive `isRiding` effect) without touching each call site individually. New
`buildRiderInfoMessage` function (mirrors `buildWhatsAppMessage`'s shape) builds the copyable text
from ten new `riderInfo*` translation keys plus the existing `costFundsTitle`/`moneyGoesBody`,
`sActivity`/`sDateTime`, and `copyBtn`/`copied` keys, so the money-goes and confirm-screen copy
strings aren't duplicated. The modal itself is new markup (`.rider-info-backdrop`/
`.rider-info-modal`, a `position: fixed` overlay matching the established `.gallery-lightbox`
full-viewport pattern), rendered as the first child of `.app`; its copy box reuses the existing
`.copy-box`/`.copy-heading`/`.copy-text`/`.copy-btn` classes from the confirm screen rather than
inventing new ones. The reopen prompt reuses the existing `.weight-warning`/`.ww-header` classes
from the old note, just with an added onClick and a swapped icon/body. The whole checkbox-plus-
reopen-prompt block moved out of section 2's `addon-group` (which CSS-hides via
`section2Collapsed`, since it no longer needs to) into its own `step2-section-box`, gated on
`screen === "riders" && isRiding && riders.length > 0` and rendered as a new sibling between
section 3's blocked-note and the cost-funds-card; the photographer add-on's `addon-group` is
unaffected and still closes section 2 the same way it did before BOOKING-FOR-OTHER existed.

No pricing or offering data changed, so there's no new `customer-offerings.tsv` paste block for
this entry: the Google Sheet "Customer Offerings" tab is unaffected.

## 30 Aug 2026 - BOOKING-FOR-OTHER: "I'm booking for someone else" checkbox for rides

Added a checkbox at the end of the "Who's coming?" section for every riding activity (Beach &
Rice Field Ride, Insta Ride, Dressage Masterclass), letting a customer flag that they're booking
on behalf of another rider. Not shown for photoshoots or non-riding lessons.

When checked, reveals a note asking the booker to check the weight of the person they're booking
for, reiterating the 75kg guideline and the no-refund policy if it's exceeded, styled like the
existing weight-warning blocks. When checked, adds one line to the WhatsApp payload right after
the "Group size" line: "Booking on behalf of another rider. 75kg weight guideline shown to the
person booking." With the box unchecked, the payload is completely unaffected, this is the only
other intended payload delta in this six-commit batch besides WHISPER-3DAY's course-line and
duration-suffix changes.

Code: new `bookingForOther` boolean state, reset to false on every existing activity-change reset
path (category tab, card click, Book button, resetAll) plus a defensive `useEffect` that resets
it whenever `isRiding` goes false. Rendered gated on `isRiding && riders.length > 0`, as a sibling
right after the photographer add-on block, reusing the `addon-group`/`perm-row`/`perm-box` and
`weight-warning`/`ww-header`/`ww-body` CSS patterns already in use elsewhere. New translation keys
`bookingForOtherLabel` and `bookingForOtherNote` in all three languages. Threaded into
`buildWhatsAppMessage` and `handleSend` the same way `photographerAddon` already is.

Isolated to its own branch (`booking-for-other`) for independent reversion; not yet merged to
`main`. This is the sixth and final commit in the batch: LESSON-SLOTS-SPLIT, BEACH-8AM,
RICEFIELD-8AM, GROUPCLINIC, WHISPER-3DAY, BOOKING-FOR-OTHER.

## 29 Aug 2026 - WHISPER-3DAY: Horse Whisperer Course shrinks from 4 days to 3, drops Friday

The course now runs 10 hours across 3 days instead of 4: two 3.5-hour sessions to build the
foundation, then a closing 3-hour session, including 2 hours choice of grooming or another
related activity. The old shape was three 3-hour sessions plus a closing 1-hour session across
4 days. Bookable days are now Monday, Tuesday and Thursday only, Friday moved from allowed to
blocked (alongside the already-blocked Wednesday and Saturday).

Copy updated in all three languages: the course description, `sessionNote`, `courseWeekNote`,
`whisperHintPre`, `pickCourseDays` and `daysSelected` all drop Friday and change 4/four/empat/
четыре to 3/three/tiga/три, and the description and `sessionNote` now mention the 2-hour
grooming-or-related-activity inclusion. English `sessionNote`'s closing line also changed
wording from "is accepted per week" to "is taken per week".

WhatsApp payload changes (the only two intended deltas across this whole six-commit batch besides
COMMIT 6's photographer line): the course-schedule line now reads "Course runs Mon, Tue & Thu
within one week" (was "...Thu & Fri..."), and the Activity line's duration suffix is overridden
to "3 to 3.5 hr/day" specifically when `actObj.id === "whisper"`, since `durations: ["3hr"]`
doesn't reflect the actual per-day session lengths. Every other activity's payload line is
untouched, since the override is gated on that exact id check.

Code: `whisper.courseDays` 4 -> 3. `isAvailableDay` now blocks `dow === 3 || dow === 5 || dow ===
6` (was `3 || 6`), so Friday (`5`) is blocked alongside Wednesday and Saturday. Updated the two
comments describing the bookable-day pattern and the `requiredDates` comment.

Isolated to its own branch (`whisper-3day`) for independent reversion; not yet merged to `main`.

## 29 Aug 2026 - GROUPCLINIC: minimum group size of 3, title gains a descriptor

Group Clinic previously allowed group sizes from 1 to 6, even though it is designed as a group
session. `peopleOptions()` now reads a `minPeople` field alongside the existing `maxPeople`, and
Group Clinic sets `minPeople: 3`, so the group-size picker only offers 3, 4, 5 or 6, "1" and "2"
are no longer selectable pills. `initRiders()` also clamps its starting count up to the activity's
`minPeople` when set, defensively, on top of the picker already excluding those values.

Title changed to "Group Clinic (Leadership/horsemanship class)" in all three languages, the
parenthetical stays in English in every language, per Ro's instruction to keep the English
descriptor verbatim.

Code: `peopleOptions(actObj)` now computes `Array.from({ length: max - min + 1 }, ...)` starting
at `min` instead of always starting at 1. `groupclinic` activity gained `minPeople: 3`. Title
strings updated in `activities.groupclinic` for `en`/`id`/`ru`.

Isolated to its own branch (`groupclinic`) for independent reversion; not yet merged to `main`.

## 29 Aug 2026 - RICEFIELD-8AM: Rice Field Photoshoot gets its own 8am slot pattern, loses its 3hr option

Rice Field previously cloned Stable's config exactly: same four durations (1/1.5/2/3hr), same
prices, same `SESSION_SLOTS` morning-window-or-afternoon-window time pattern. It now diverges:

- Removed the 3hr duration and its IDR 3,750,000 price (Stable and Paddock are unaffected, they
  keep their own 3hr option and price unchanged).
- Moved off `SESSION_SLOTS` onto a new `RICEFIELD_SLOTS` table using the same 8am-plus-one-fixed-
  afternoon-slot pattern the rides use: 1hr -> 8:00am/5:00pm, 1.5hr -> 8:00am/4:30pm, 2hr ->
  8:00am/4:00pm.

Code: new `RICEFIELD_SLOTS` table. `slotsFor` gained a dedicated `photo_ricefield` branch, placed
before the `SESSION_SLOTS` branch and removed from that branch's own condition (which now only
covers `photo_paddock`/`photo_stable`/`photo_cottages`). `photo_ricefield.durations` dropped
`"3hr"`; its 3hr price entry (IDR 3,750,000) removed from the price array in all three languages.

Isolated to its own branch (`ricefield-8am`) for independent reversion; not yet merged to `main`.

## 29 Aug 2026 - BEACH-8AM: both rides gain an 8am start, Beach & Rice Field Ride gains a 2hr option

Added a new 2hr duration to Beach & Rice Field Ride (previously 1hr/1.5hr only) at IDR 2,700,000,
matching Insta Ride's own 2hr price exactly. Added an 8:00am morning start alongside the existing
fixed afternoon slot for every duration: 1hr -> 8:00am/5:00pm, 1.5hr -> 8:00am/4:30pm, 2hr ->
8:00am/4:00pm.

First pass gave Beach & Rice Field Ride its own separate slot table with the new 8am start,
leaving Insta Ride untouched. Ro corrected this same day: the two rides should keep identical
availability, so Insta Ride gets the 8am start too. Both rides are now bookable on Saturdays
again, at 8:00am only (Saturday afternoons are still closed sanctuary-wide, so each ride's
afternoon slot still drops on a Saturday date).

Code: `RIDE_SLOTS` itself now includes 8:00am for every duration (shared by both rides via the
generic `actObj.riding` branch in `slotsFor`); the separate `BEACH_SLOTS` table and its dedicated
`beach`-only branch from the first pass were removed as redundant. `beach.durations` gained
`"2hr"`. Added the 2hr price entry to the `beach` price array in all three languages.

Isolated to its own branch (`beach-8am`) for independent reversion; not yet merged to `main`.

## 29 Aug 2026 - LESSON-SLOTS-SPLIT: Join Up, Horse grooming, Group Clinic and Dressage each get their own start times

Replaced the shared `LESSON_SLOTS[duration]` table (used identically by Join Up, Horse grooming
and Group Clinic: 9:30am/10:30am/3:00pm regardless of duration) with a flat, duration-independent
array per activity:

- Join Up: 8:30am, 9:30am
- Horse grooming: 8:30am, 9:30am, 10:30am
- Group Clinic: 8:30am only
- Dressage Masterclass: narrowed from 9:00am/10:00am/4:00pm/5:00pm to 8:30am, 9:30am

All new slots sit before noon, so the existing Saturday-afternoon closure filter is now a
structural no-op for these four activities, Saturday availability equals weekday availability
for them going forward, where it previously dropped the 3:00pm slot (lessons) or the 4:00pm/
5:00pm slots (Dressage).

Code: removed the shared `LESSON_SLOTS` constant, added `JOINUP_SLOTS`, `GROOMING_SLOTS` and
`GROUPCLINIC_SLOTS`, narrowed `DRESSAGE_SLOTS`. `slotsFor` gained explicit id-routed branches for
`joinup`/`masterclass`/`groupclinic`; the old catch-all `else list = LESSON_SLOTS[duration] || []`
is now `else list = []`.

Isolated to its own branch (`lesson-slots-split`) for independent reversion; not yet merged to
`main`.

## 29 Aug 2026 - Photographer add-on now auto-matches the shoot's own duration

Replaced the independent 4-tier photographer picker (pick any of 1hr/1.5hr/2hr/3hr regardless
of how long the shoot itself was) with a single checkbox. Price and photo count now auto-match
whichever duration the customer already selected for their photoshoot: IDR 2,500,000 for the
first hour, plus IDR 500,000 per additional 30 minutes, at the same underlying rate as before
(10 photos per IDR 1,000,000). New values: 1hr 2,500,000 (25 photos), 1.5hr 3,000,000
(30 photos), 2hr 3,500,000 (35 photos), 3hr 4,500,000 (45 photos).

This replaces the earlier "make these numbers make sense" tier repricing (28 Aug) and the
"IDR 2,500,000 (1hr) + 500,000/30min across all photoshoots" change from earlier today, which
had been applied to the shoots' own base prices. That base-price change is reverted in full
(Beach/Stable/Rice Field/Paddock are back to their pre-28-Aug prices); Ro clarified the formula
was always meant for the photographer add-on, tied to the shoot's own duration, not the shoot's
base price.

Code: removed `PHOTOGRAPHER_TIERS` and the `addonTiers` translation arrays (all three languages).
Added `photographerAddonPrice(duration)` (the formula) and `durationHrLabel(duration)` (display
formatting). Renamed state `photographerTier` (string tier key) to `photographerAddon` (boolean).
WhatsApp payload field renamed `photographerTier` -> `photographerAddon`; when checked, the
payload line now reads "Add-on: Salty Cowboy photographer (X hr · IDR ... · N edited images)"
using the shoot's own duration instead of an independently chosen tier. Intro copy (all three
languages) updated to describe the new duration-matched pricing.

## 23 Aug 2026 - Calendar can no longer book a past date

Two problems, both in the Step 2 date picker. First, `calMonth`/`calYear` were hardcoded to
`4`/`2026` (May 2026), a leftover from whenever that state was first wired up, so the calendar
opened on a fixed month regardless of the real date, drifting further out of date every month
that passes. Second, `isAvailableDay` only ever checked day-of-week (Sunday closed, Wednesday/
Saturday closed for the Horse Whisperer Course) with no floor at all, so any day of the week in
any month, past or future, was clickable.

Fixed both. `calMonth`/`calYear` now initialize from `new Date()` via lazy `useState` initializers,
so the calendar always opens on the real current month. Added an `isPastDate(year, month, day)`
helper (calendar-date comparison only, time-of-day stripped, so today itself still counts as
bookable) and wired it into `isAvailableDay` as the first check, so a past date now renders
greyed-out and unclickable exactly like a closed Sunday. Also added an `atCurrentMonth` flag that
disables the "‹" prev-month nav button once the calendar is already on the current month, closing
off the one remaining way to browse into a fully-past month. Applies uniformly to every activity,
including the Horse Whisperer Course's multi-day week-locked picker, since all of them route
through the same `isAvailableDay`/`changeMonth` functions.

8 new assertions added covering the helper, the dynamic month/year init, the past-date gate, and
the disabled prev-month button; one old assertion converted to a `missing()` guard confirming the
hardcoded May 2026 default is gone. 521/521 assertions and the jsdom smoke test pass. No pricing
or copy changed, so no TSV update needed.

## 22 Aug 2026 - Live WhatsApp number swapped in for Simone's real number

`WA_NUMBER` and `WA_DISPLAY` (`index.html`, top-of-file constants) were still the placeholder test
number (+61 466 567 953) used throughout development. Swapped to Simone's real WhatsApp number,
+62 812-3731-2248, formatted to match the existing convention: `WA_NUMBER` is digits only with
country code first and no "+"/spaces/dashes ("6281237312248"), `WA_DISPLAY` is the human-readable
form shown in the copy/paste fallback ("+62 812-3731-2248"). Both call sites (the `wa.me` deep
link built in `handleSend`, and the fallback link/display text on the confirmation screen) read
from these constants, so no other code changed.

This resolves the "Test WhatsApp number must be swapped for Simone's real number before go-live"
line in `CLAUDE.md`'s Open Items, now removed since it's done. No assertions locked in the old
number's literal value, so no `assert.js` changes were needed; both test suites still pass.

## 22 Aug 2026 - Beach & Rice Field Ride 1.5hr price raised to IDR 2,200,000

Grepped the price field before editing: `t.prices.beach`, same `{ l, v }` array format as every
other activity, `v` always the full "IDR X,XXX,XXX" string. Current 1.5hr value was "IDR 2,000,000",
Ro's requested "2,200,000" matched that format directly with no conversion needed. Updated all
three languages; 1hr price untouched.

This breaks a documented relationship the same way the earlier PRICE-INSTARIDE commit did: Insta
Ride's 1hr and 1.5hr prices were originally copied directly from Beach & Rice Field Ride
(`CLAUDE.md` Open Items). Insta Ride's 1.5hr price was not raised to match, since Ro's request
named Beach & Rice Field Ride specifically, so now only the 1hr price matches between the two.
Updated `CLAUDE.md`'s business rules and Open Items sections to say so explicitly.

3 assertion descriptions corrected (they claimed insta ride's 1.5hr "still matches beach ride,"
no longer true), 3 new assertions added locking in beach ride's actual new price. 513/513
assertions and the jsdom smoke test pass. Verified live in Chrome: booking a 1.5hr Beach & Rice
Field Ride shows "IDR 2,200,000" in both the on-screen total and the WhatsApp payload's "Total
cost" line, everything else in the payload unchanged. Fresh Customer Offerings TSV generated
reflecting the new price (see chat).

## 22 Aug 2026 - New card photos for Paddock and Rice Field Photoshoot

Ro picked two specific photos for Step 1 card images: a bridal-style shot (woman feeding a horse
over a fence, in a white dress with a flower basket) for Paddock Photoshoot, and the sunset ricefield
photo already sitting in the gallery folder for Rice Field Photoshoot.

Rice Field's card `image` reuses `images/gallery-ricefield-1.jpg` directly rather than duplicating
the file, since it's the exact same photo already processed for that activity's gallery.

Paddock's photo needed real troubleshooting to even reach: the source screenshot's filename uses a
narrow no-break space (U+202F, not a regular space) between the time and "pm", which macOS's
screenshot tool inserts automatically and which no amount of retyping the path (by me or Ro,
including in Ro's own terminal) could match. Found the exact byte sequence via
`os.listdir()` + `repr()` in Python, then addressed the file through Python's `subprocess` using
that exact string rather than a shell-quoted path. Resized to 700px-max JPEG at 78% quality via
`sips`, saved as `images/photo-paddock-card.jpg`.

Also cleaned up `photo_paddock`'s now-dead fields while making this change: `imagePosition`
("center 70%") and `hideCardImage` both only ever mattered while the Step 2 header band could
still show a photo for this activity, but the PHOTO-GALLERY commit made that band never render for
any `isPhotoshoot` activity, so both had been silently inert since that commit landed. Removed
both rather than leaving stale, misleading fields in the data. The `.act-image` JSX's
`!item.hideCardImage` check is left in place as a harmless no-op capability, not ripped out, since
no activity uses it anymore but it costs nothing to keep available.

3 assertions updated (2 rewritten as `missing()` guards for the removed fields), 1 new assertion
added. 510/510 assertions and the jsdom smoke test pass. Verified live in Chrome: Paddock
Photoshoot's Step 1 card now shows the bridal photo; all 5 photoshoot activities now have a real
card image.

## 21 Aug 2026 - Real photos populate all 5 photoshoot galleries

Ro provided 5 folders (Beach, Cottage, Paddock, Ricefields, Stable photoshoot), 4 photos each,
matching the gallery's 4-slot layout exactly. Previewed all 20 before wiring anything in, checked
each against its activity's actual copy/purpose, not just the folder name.

Two items flagged and confirmed with Ro before proceeding: one Paddock photo (a bikini-top fashion
shot) stood out in tone from the other 3 wholesome family/couple shots there - kept as provided,
per Ro's explicit choice. The 4 Ricefields photos read as candid ride/lesson snapshots rather than
styled photoshoot marketing images like the other 4 categories - used anyway, per Ro's explicit
choice, since they're the only Rice Field photos available and still show the real location.

Resized/compressed all 20 (source files 65KB-2.7MB, mixed JPEG exports and PNG screenshots) to
700px-max-dimension JPEGs at 75% quality via `sips`, saved as `images/gallery-{activity}-{1-4}.jpg`.
Added a `gallery` array (4 paths) to each of the 5 photoshoot activities in `ACTIVITIES`, including
`photo_ricefield`, which still has no header/card `image` (none provided for that) but now has a
full gallery same as the other 4.

`.gallery-thumb` and `.gallery-lightbox-photo` both now read `actObj.gallery[i]` as a
background-image when present, falling back to the plain `--fog` placeholder otherwise (the
fallback path is now purely theoretical, since all 5 photoshoot activities have a gallery, but kept
for any future photoshoot activity added without one yet).

7 assertions updated/added. 510/510 assertions and the jsdom smoke test pass. Verified live in
Chrome: Beach Photoshoot's gallery row shows all 4 real photos, opening thumbnail 3 in the lightbox
shows the matching full photo at the correct crop; Rice Field Photoshoot (previously placeholder-only
everywhere) now has a populated gallery too, header card still correctly header-only underneath it.

## 21 Aug 2026 - Final total price added to the WhatsApp payload

Deliberate exception to "never alter the payload shape" (Ro explicitly asked for it): added
`totalPriceStr` as a new named param to `buildWhatsAppMessage`, passed straight from the same
`totalPriceStr` already computed in component state for the on-screen total, no separate
calculation. New line, `"Total cost: " + totalPriceStr` (reads `T.en.totalCostLabel`, the site's
own English label text, rather than a new hardcoded string), inserted right after `Group size:` and
before the blank line into `*Riders:*`. Skipped entirely if `totalPriceStr` is falsy, e.g. mid-flow
before duration/numPeople/selPrice are all chosen. Every other field in the payload is untouched.

3 assertions updated/added, including the existing payload-integrity guard assertion (rewritten to
document why this specific field addition is the sanctioned exception, not silently overwritten).
506/506 assertions and the jsdom smoke test pass. Verified live in Chrome: booked Beach & Rice Field
Ride for 2 riders (IDR 1,600,000 each), on-screen total read "IDR 3,200,000", and the sent payload's
new "Total cost: IDR 3,200,000" line matched it exactly, positioned as described, every other field
unchanged.

## 21 Aug 2026 - Gallery thumbnails open a fullscreen lightbox (extends PHOTO-GALLERY, commit 8b14a43)

Added `lightboxIndex` state (null when closed, 0-3 for which thumbnail is open), reset to null
whenever the user switches activity so a stale lightbox can never carry over. Clicking a
`.gallery-thumb` opens it at that thumbnail's index; prev/next buttons wrap around via modulo
(`(li + 3) % 4` / `(li + 1) % 4`); the close button and a backdrop click both dismiss it; clicking
the photo itself does not (stops propagation before it reaches the backdrop's handler). Photos stay
placeholders, per instruction - no real images added.

Found and fixed a real bug during verification, not just added the feature: the lightbox initially
rendered nested inside `.body.fu`, and `.fu`'s `fadeUp` animation leaves a persistent (identity, but
still present) `transform: translateY(0)` on that ancestor via `animation-fill-mode: both`. A
`transform` on any ancestor creates a new containing block for `position: fixed` descendants, so
`inset: 0` was resolving against `.body`'s own box instead of the true viewport - confirmed live via
`getBoundingClientRect`, the "fullscreen" overlay only covered the `.main` column, leaving the dark
sidebar visibly uncovered. Fixed by portaling the lightbox onto `document.body` via
`ReactDOM.createPortal`, escaping the `.fu` ancestor's containing block entirely.

10 assertions added/updated. 504/504 assertions and the jsdom smoke test pass. Verified live in
Chrome: lightbox now measures exactly `window.innerWidth`/`innerHeight` at (0,0), portal target
confirmed as `document.body`; opened a thumbnail, clicked next (index advances, no crash), closed
via the X button, reopened, closed via backdrop click.

## 21 Aug 2026 - PHOTO-GALLERY: 4-thumbnail gallery row replaces the header image on all photoshoot pages

Grepped and listed the 5 photoshoot pages before editing, approved: Beach, Stable, Rice Field,
Paddock, Cottages Photoshoot. Applies to every one of them uniformly via the existing `isPhotoshoot`
flag; every other category (Rides, Lessons) is completely unaffected.

DOM structure before (every activity, same shared JSX):
```
div.body.fu.step2-block
  div.back-link
  div.detail-header-image          [269px photo band or --fog placeholder]
  div.detail-header-card           [margin-top: -48px, overlaps the band]
    h2.section-title
    p.detail-desc
  span.byo-chip (isPhotoshoot only)
  ...section boxes...
```

DOM structure after, isPhotoshoot only (Rides/Lessons keep the "before" structure unchanged):
```
div.body.fu.step2-block
  div.back-link
  div.gallery-row                  [NEW - 4 thumbnails, replaces the image band]
    div.gallery-thumb x4
  div.detail-header-card           [margin-top: 0, header-only now]
    h2.section-title
    p.detail-desc
  span.byo-chip
  ...section boxes...
```

`.detail-header-image` is gated on `!isPhotoshoot`; `.gallery-row` is gated on `isPhotoshoot`, so
exactly one of the two ever renders for a given activity. `.detail-header-card`'s base CSS still
carries `margin-top: -48px` (designed to overlap 48px onto the image band above it) - left that in
place for non-photoshoot activities, and override it to `0` inline for `isPhotoshoot`, since there's
no band underneath the card to overlap onto anymore.

Width parity: `.gallery-row` is a direct child of the same `.body` wrapper as `.detail-header-image`
and section 1's `.step2-section-box`, so it inherits the identical 623px content width from `.body`'s
own padding with no extra width rule needed. Verified live via `getBoundingClientRect`: gallery row
measured exactly 623px, matching section 1's box exactly.

Tokens: `.gallery-thumb` reuses `var(--fog)` (the same placeholder fill `.detail-header-image`
already used) and the page's existing 14px border-radius; `.gallery-row` reuses the existing 8px gap
convention (`.cat-tabs`/`.pill-row`) and the existing 22px block-rhythm margin. No new CSS custom
properties introduced. `--display`/`--earth`/`--clay` weren't directly invoked since the thumbnails
carry no text or foreground color of their own, matching how `.detail-header-image`'s and
`.act-image`'s existing placeholders also carry none.

**Flagging an interaction with the PADDOCK-IMG commit that just landed:** that commit specifically
preserved Paddock Photoshoot's Step 2 header image while removing its Step 1 card image. This
commit, applying uniformly to the whole photoshoot category as instructed, now replaces Paddock's
Step 2 header image with the gallery row too, superseding that narrower fix. This follows directly
from "applies to EVERY activity in the photoshoot category" - flagging in case that supersession
wasn't intended.

6 assertions added/updated. 494/494 assertions and the jsdom smoke test pass. Verified live in
Chrome: Beach Photoshoot shows 4 placeholder thumbnails at 623px total width with a header-only card
directly below (no gap, no overlap); Beach & Rice Field Ride (non-photoshoot) is unchanged, still
shows its image band with the tuned crop position and the card's base -48px overlap intact.

## 21 Aug 2026 - PADDOCK-IMG: removed the bridal-style photo from the Step 1 card only

Paddock Photoshoot's Step 1 card and Step 2 header band previously both read the same `image`
field, so there was no way to remove one without removing the other. Added a new `hideCardImage:
true` flag to the `photo_paddock` activity entry (the only activity that carries it) and updated
`.act-image`'s conditional style to `item.image && !item.hideCardImage`, so the card now falls back
to the plain grey placeholder while `.detail-header-image` (Step 2's band), which reads
`actObj.image` directly and never checks this flag, keeps showing the photo exactly as before.

Interpreted "the Paddock photoshoot page" as the Step 1 card specifically, since Step 2 only has
one image element (the header band), and the instruction explicitly said not to touch it - the
only other place an image could be "removed" from is the card. Flagging this reading in case it's
not what was meant.

2 assertions updated/added. 489/489 assertions and the jsdom smoke test pass. Verified live in
Chrome: the Step 1 card's image style is now `null` (plain placeholder renders), the Step 2 header
band's inline style is completely unchanged, still showing `images/photo-paddock.avif`.

## 21 Aug 2026 - BYO-COPY: standalone "BYO" spelled out to "Bring your own"

Word-boundary search (regex `\bBYO\b`, scoped to the app's own script to exclude coincidental "BYO"
substrings inside the base64-encoded image constants) found exactly 2 real occurrences: the English
`byoPhotographer` translation value ("BYO Photographer or add a Salty Cowboys photographer") and a
CSS comment describing the resulting chip element. Both updated to "Bring your own Photographer...".
The `byoPhotographer` property key itself was left untouched, since renaming an object key is not a
copy change and would require updating every `t.byoPhotographer` reference site-wide for no visible
benefit. Indonesian and Russian translations never used the literal word "BYO" to begin with
(already fully localized, e.g. ID reads "Bawa fotografer sendiri"), so nothing to change there.

Count: 2 occurrences replaced, 0 remaining anywhere in the file.

2 assertions updated/added (1 needle updated for the new text, 1 new `missing()` guard). 488/488
assertions and the jsdom smoke test pass. Verified live in Chrome: both the Step 1 card's BYO note
and the Step 2 chip now read "Bring your own Photographer or add a Salty Cowboys photographer".

## 21 Aug 2026 - PRICE-INSTARIDE: Insta Ride 2hr price raised to IDR 2,700,000

Grepped the price field before editing per instruction: `t.prices.insta` is an array of
`{ l: label, v: value }` pairs, `v` always the full "IDR X,XXX,XXX" format (never abbreviated).
Current 2hr value was "IDR 2,400,000". Confirmed with Ro that the shorthand "2,700" in the request
should conform to that existing format, i.e. "IDR 2,700,000", before writing it. Updated all three
languages (EN/ID/RU), 1hr and 1.5hr prices untouched.

This is the only place the 2hr price is stored: `unitPrice` is computed by stripping non-digits
straight out of this same string (`parseInt(String(selPrice.v).replace(/[^0-9]/g, ""), 10)`), so
there's no separate numeric constant elsewhere to keep in sync. Insta Ride is `riding: true`, so
the total multiplies by group size (per person), same as before.

Breaks a previously documented business rule: `CLAUDE.md` said Insta Ride's prices matched Beach &
Rice Field Ride's linear per-half-hour rate ("same as Beach & Rice Field Ride, per Ro"). That's
still true at 1hr and 1.5hr, but the new 2hr price is no longer the same rate (2,700,000 instead of
the 2,400,000 the linear pattern would give). Updated the business-rules note in `CLAUDE.md` to
say so explicitly rather than leaving a stale claim in place.

Verified live in Chrome: booking Insta Ride at 2hr for 1 person shows "IDR 2,700,000" in the total
cost line. Confirmed the WhatsApp payload does not include price at all (by design, Simone handles
pricing separately), so it's fully unaffected by this change, same fields, same shape.

3 stale assertions updated (needle values only). 487/487 assertions and the jsdom smoke test pass.
Fresh Customer Offerings TSV generated reflecting the new price (see chat).

## 21 Aug 2026 - REJECT-COPY: weight-rejection title and body reworded

Exact find/replace of the English weight-rejection block (`w4Title`/`w4Body`), confirmed exactly
one occurrence before editing. Title: "So sorry, we can't accommodate this weight" -> "Sorry, we
can't accommodate this weight". Body: "You'd be very welcome to try our off-saddle activities
under 'Lessons' instead." -> "You're welcome to try our off-saddle activities under 'Lessons'
instead. Unfortunately we do not refund bookings for people over 75kg." Apostrophe style matched
to the file's existing straight-apostrophe convention (confirmed by byte inspection before
editing, not assumed). Indonesian and Russian `w4Title`/`w4Body` are untouched, since the find text
was English-specific and those translations use different wording entirely.

5 new assertions added (2 positive, 2 `missing()` guards against the old phrasing, 1 confirming
ID/RU stayed untouched). 487/487 assertions and the jsdom smoke test pass. Verified live in
Chrome: selecting "Over 75 kg" now shows the new title and body text exactly.

## 21 Aug 2026 - WEIGHT-THRESHOLD: universal weight cap lowered 77kg to 75kg

Business rule change per Ro's explicit request. Every instance of the 77kg weight cap replaced
with 75kg across `index.html`: the two weight-bucket labels ("70-77 kg" -> "70-75 kg", "Over 77 kg"
-> "Over 75 kg"), the informational body copy under the 70-77kg bucket ("up to 77kg each" -> "up to
75kg each"), the group-size/weight-cap descriptions for Beach & Rice Field Ride, Insta Ride,
Dressage Masterclass and Beach Photoshoot ("Max 77kg per rider" / "per mounted rider" -> 75kg), and
the code comment documenting the rule. All three languages (EN/ID/RU) updated identically.

No numeric weight-gate constant exists anywhere in the code: the gate is entirely categorical,
keyed on which bucket button the user selects (`rider.weight === "w4"`), so this was purely a copy
change with no logic to touch (the task description assumed a separate numeric constant; there
isn't one, confirmed by grep). The 75kg mid-tier note about Othello's own physical carrying
capacity in `CLAUDE.md`'s per-horse allocation note is a fact about that horse, not the site's UI
cap, and was deliberately left at 77 rather than changed to match.

Verified live in Chrome: selecting "Over 75 kg" still correctly shows the rejection block and
disables Send; selecting "70-75 kg" (the new top allowed bucket) shows only the informational
heavier-horse note and Send stays enabled. Confirmed the WhatsApp payload shape is unchanged, the
weight value still flows from React state into the rider line unaltered except for now reading the
updated bucket label ("70-75 kg").

3 new assertions added (missing-77kg guards mirroring the existing missing-78kg ones from the prior
77kg change), 3 existing assertions updated. 482/482 assertions and the jsdom smoke test pass.

## 20 Aug 2026 — Real photos added for 9 more activities; crop position made data-driven

Added real photos (Ro-provided, all already reasonably web-sized) for: Insta Ride, Beach
Photoshoot, Stable Photoshoot, Paddock Photoshoot, Cottages Photoshoot, Join Up, Horse Whisperer
Course, Horse grooming, Group Clinic, and Dressage Masterclass. Copied the 9 `.avif` files
straight into `images/` (already small, 22-146KB each, no reprocessing needed); the Horse
Whisperer Course photo was a 708KB PNG, converted to a 99KB JPEG via `sips`. Rice Field Photoshoot
still has no photo (none provided for it - clones Stable's config, but doesn't clone its image)
and keeps the plain placeholder, same as before.

Verified every photo against its activity before wiring it in (checked each against the copy /
what the activity actually is, not just the filename) and checked both the Step 1 card and the
Step 2 header band for all ten now-photographed activities.

Two needed a crop fix, both on the Step 2 header band specifically (fixed 269px tall, much wider
on desktop than mobile - explained in an existing code comment from the beach-ride fix): Insta
Ride's source photo is a wide scenic beach shot with the rider small and low in an otherwise
empty-sky frame, so a plain centered crop showed nothing but sky at the true 623px desktop width;
Paddock Photoshoot's rider and horse are also positioned low in its source photo, so centered cut
both out entirely, showing only trees and a cottage roof. Refactored `backgroundPosition` from the
hardcoded `"center 28%"` (tuned only for beach-ride) to `actObj.imagePosition || "center"` - an
optional per-activity field in `ACTIVITIES`, since each photo's own composition dictates whether it
needs a crop bias at all (most don't). Set `imagePosition: "center 28%"` on beach (carrying forward
its existing tuned value), `"center 80%"` on insta, `"center 70%"` on photo_paddock. Found the same
way as the original beach-ride tuning: testing values live in the browser at the true 623px desktop
width, not by calculation.

12 new assertions added, 1 stale assertion updated. 479/479 assertions and the jsdom smoke test
pass. Verified live in Chrome: all 10 photographed activities' cards and Step 2 headers, Rice Field
still shows its placeholder, and both fixed crops (Insta Ride, Paddock Photoshoot) now show their
full subject instead of empty background.

## 20 Aug 2026 — Beach & Rice Field Ride photo swapped again, crop re-tuned

Swapped the photo once more (Ro provided a different shot of the same session; same 3120x4160
source dimensions, resized/compressed the same way, saved over `images/beach-ride.jpg`). This
photo's composition differs from the previous one - the horse's eyes aren't covered by its mane -
so the crop needed re-tuning rather than reusing the prior value. `backgroundPosition` moved from
`"center 20%"` to `"center 28%"`, found the same way (testing live at the true 623px desktop
width): this value gets the rider's full smiling face AND the horse's eyes/forehead both in frame
together, a clean result this specific photo's composition actually allows.

1 stale assertion updated. 465/465 assertions and the jsdom smoke test pass. Verified live in
Chrome at the true 623px desktop column width, and in the full Step 2 page context.

## 20 Aug 2026 — Section 3 (booking summary) now waits for all of section 2, not just section 1

Section 3 previously auto-opened as soon as `datesComplete` was true (a date picked, per
`requiredDates`) - it didn't even wait for a time slot, let alone any of section 2's fields
(numPeople, rider details, grooming). Flagged as a bug: the summary could appear well before the
booking was actually ready to review.

Introduced `section3Complete = section1Complete && detailsComplete` (both a full date+time AND
every section-2 field) and switched every place that previously read `datesComplete` for section
3's own state to this new flag instead: `section3Collapsed`'s default, its override-reset
`useEffect`, `toggleSection3`'s open-ahead-of-sequence guard, and the collapsed-hint text that
decides between the "complete the steps above" placeholder and the price/heading. `section2Blocked`
was already correctly scoped to `section1Complete`; only section 3's own gate was too loose.

The blocked-note shown when opening section 3 early no longer says "Please pick a date first" (now
misleading, since dates could be fully picked and it would still block on section 2's own fields)
- reworded to "Please complete steps 1 and 2 first" in all three languages.

7 stale assertions updated to match. 465/465 assertions and the jsdom smoke test pass. Verified
live in Chrome: picked a date and time (section 1 complete) with section 2 still empty - section 3
correctly stayed collapsed showing "Complete the steps above to see your summary", not the price.
Filled in numPeople and the rider's fields - section 3 auto-opened immediately with the full
summary and total cost. Confirmed the reworded blocked-note text on a fresh booking too.

## 20 Aug 2026 — Beach & Rice Field Ride photo swapped, desktop crop tuned to keep both faces in frame

Swapped the Beach & Rice Field Ride photo for a different shot Ro provided (both 3120x4160
originals, resized/compressed to 825x1100 via `sips`, saved over `images/beach-ride.jpg`).

The Step 2 header band is a fixed 269px tall but stretches to the full column width - 623px on
desktop versus a much narrower mobile width - so covering a portrait photo needs far more vertical
cropping on desktop, and a plain centered position was cutting the rider's face out of frame
entirely there. Added `backgroundPosition: "center 20%"` (was plain `"center"`) to bias the crop
upward. Tuned by testing values directly in the live browser at the true 623px desktop width, since
the calculated crop window didn't match observed rendering closely enough to trust outright; 20% is
the best available balance for this specific photo, keeping the rider's full smiling face in frame
along with the horse's ear/forehead (its eyes are covered by its own mane in this shot, so a
full view of both faces literally isn't available in any crop of this particular photo). Re-tune
this value if the source photo is ever swapped again.

1 stale assertion updated. 465/465 assertions and the jsdom smoke test pass. Verified live in
Chrome at the true 623px desktop column width.

## 20 Aug 2026 — Real photo added for Beach & Rice Field Ride (first activity image)

Replaced the grey placeholder for Beach & Rice Field Ride with a real photo, on both the Step 1
activity card and the Step 2 header band. Source photo (3120x4160, 701KB) resized and compressed
to 825x1100 (130KB) via `sips`, saved to a new `images/` directory as `images/beach-ride.jpg`.

Data-only change per the plan already noted in the `.detail-header-image` CSS comment ("ship the
placeholder path per Ro, swap to real images later as a data-only change"): added an `image` field
to the `beach` activity's entry in `ACTIVITIES`, and both `.act-image` (Step 1 card) and
`.detail-header-image` (Step 2 header) now render that as a `background-image` when present,
falling back to their existing plain grey/`--fog` placeholder otherwise. Every other activity is
untouched and still shows the placeholder, since none of them have an `image` field yet.

2 stale assertions updated, 1 new assertion added. 464/464 assertions and the jsdom smoke test
pass. Verified live in Chrome: the photo renders correctly, well-cropped, on both the Step 1 card
and the Step 2 header, and Insta Ride's card still shows the plain placeholder as before.

## 20 Aug 2026 — Instagram and Airbnb Listings links added to the dark sidebar

Added "Instagram" (https://www.instagram.com/salty.cowboy/?hl=en) and "Airbnb Listings"
(https://www.airbnb.com/users/profile/1470526584044287896?previous_page_name=PdpHomeMarketplace)
as two small underlined links right under the "Horse rescue sanctuary & riding centre" subtitle in
the dark sidebar, so they show on every screen (Step 1, 2, and confirm). Both open in a new tab
with `rel="noopener noreferrer"`. Link labels are translated for ID (brand names Instagram/Airbnb
stay in Latin script per convention); the URLs themselves are the same across all three languages.

7 new assertions added. 463/463 assertions and the jsdom smoke test pass. Verified live in Chrome:
both links render with the correct href/target/rel, and persist onto Step 2 after picking an
activity.

## 20 Aug 2026 — Logo click returns to the activity selection screen

Clicking the "Salty Cowboys" logo in the sidebar now calls `setScreen("activity")`, the same
navigation the Step 2 "← Back" link already uses, from any screen (Step 1, 2, or the confirm
screen). Added `cursor: pointer` to `.hero-logo` as the click affordance. Deliberately no field
resets, matching the existing back-link's behaviour exactly, not "Make another booking"'s full
`resetAll()`.

2 new assertions added. 457/457 assertions and the jsdom smoke test pass. Verified live in Chrome:
clicked the logo from Step 2 (calendar/rider details filled in) and landed back on the activity
cards.

## 20 Aug 2026 — Confirm screen heading and Copy button set to regular weight

"WhatsApp has opened in another window. Please hit send to make the booking request" (the confirm
screen's `<h2>`) had no explicit `font-weight` in its CSS, so it fell back to the browser's default
bold `<h2>` styling. Added `font-weight: 400`. The "Copy message" button was explicitly set to
`font-weight: 600` (semibold); changed to `400` to match.

2 new assertions added. 455/455 assertions and the jsdom smoke test pass. Verified live in Chrome:
both elements now compute to `font-weight: 400`.

## 20 Aug 2026 — Fixed section 3 / funds card / blocked-note width on mobile

Flagged by a mobile screenshot: "3. Your booking summary", the notes textarea, Send button, the
⏳ notice, and the "What your booking cost funds" card were all rendering wider than sections 1
and 2's box above them, some nearly flush against the screen edge with no inset at all.

Root cause, in two layers. First: every rule that gave section 3's box, the funds card, and the
blocked-note their page-level horizontal inset lived inside `@media (min-width: 900px)` — the
desktop-only two-pane layout block. Below 900px (every phone), none of it applied, so these three
(all direct `.main` children, unlike sections 1/2 which sit inside `.body` and inherit `.body`'s
own unconditional 24px padding) had zero page inset and rendered edge-to-edge.

Second, deeper bug found while writing the fix: the desktop rule was using
`padding-left/right: 24px` to create that inset, but padding never shrinks a block element's own
outer width when box-sizing is border-box (global rule on this codebase) — the border edge stays
at 100% of the container regardless of padding, padding only insets the *content* inside that
edge. On desktop this was invisible, because `max-width: 623px` plus an inherited
`margin-left/right: auto` (from `.main > *`) did the actual shrink-and-center work; padding-left/
right:16.5px was only ever handling the internal text inset, a separate concern. On mobile, with
no such centering margin set anywhere and the container already narrower than 623px (so max-width
never triggered either), there was nothing left to shrink the box at all.

Fixed with one base (all-viewport-widths) rule: `width: calc(100% - 48px)` reproduces `.body`'s
"inset by 24px on each side" behavior directly, at any container width, so it matches sections 1/2
on mobile exactly the way `.body`'s own padding always did; `max-width: 623px` with
`margin-left/right: auto` takes over once the container is wide enough to hit that cap, centering
the box exactly like before on desktop. `padding-left/right: 16.5px` is unchanged, still doing only
the internal text-inset job. blocked-note is included in this same rule by name (not via the
shared `.fu` class it deliberately doesn't carry, since `.fu` also carries a fadeUp entrance
animation that gets stuck at opacity 0 on frequently re-rendering elements like this one).

5 assertions updated (2 stale from moving/consolidating the CSS block, 1 rewritten for the
blocked-note width rule it made redundant), 2 new assertions added locking in the calc()-based
rule and the deliberate .fu exclusion. 453/453 assertions and the jsdom smoke test pass. Verified
live in Chrome at a 500px-wide viewport (this environment's browser automation renders a fixed
viewport regardless of window resize, so true mobile pixel widths couldn't be forced, but 500px is
already well below the old 623px/671px breakpoints and exercises the exact regression): section 1's
box, section 3's box, the funds card, and the blocked-note all measured identically at 382px wide
with matching left/right edges.

## 20 Aug 2026 — Fixed stale date/time surviving an activity switch

Found while implementing a request that Step 2 always land with accordion 1 open and 2/3 closed on
a fresh activity: `selectedDates`/`selectedTime` were never cleared when the user picked a new
activity (category tab, card tap, or the "Book" button). `duration`/`numPeople`/`riders` already
reset on activity change, but not the date/time. If a previously-picked date and time slot happened
to still be valid for the new activity (same `requiredDates`, same slot available at the new
activity's auto-selected duration, e.g. Beach & Rice Field Ride and Insta Ride both offer a 1hr
5:00pm slot), `section1Complete` would already read true on arrival, so accordion 1 landed
pre-collapsed and accordion 2 auto-opened on a date/time the user never actually confirmed for that
activity.

Fixed by adding `setSelectedDates([]); setSelectedTime(null);` alongside the existing
duration/numPeople/riders resets in all three activity-change entry points (category tab click,
act-card tap, and the per-card "Book" button). Duration auto-selecting to the first option and
accordion 1 opening now both follow automatically from the existing completeness-driven collapse
logic once section1Complete correctly reads false, no separate accordion-open code was needed.

3 assertions updated (stale reset-list needles), 1 new assertion added (category tab click, which
had no prior coverage of its reset list). 452/452 assertions and the jsdom smoke test pass. Verified
live in Chrome: booked Beach & Rice Field Ride through to a confirmed 1hr / 5:00pm slot, went back,
picked Insta Ride (same 1hr / 5:00pm slot available) via its "Book" button, and confirmed duration
auto-selected to 1hr, section 1's chevron shows open with no date or time carried over from the
previous activity, and sections 2 and 3 stayed collapsed.

## 20 Aug 2026 — Step 2: Edit reopens both accordions, hourglass added to the WhatsApp notice

**Edit link now reopens sections 1 and 2.** Clicking "Edit" on the booking summary previously only
scrolled to the top of the page, leaving both accordions collapsed even though the user's intent
is to review or change something already entered. New `handleEditClick` sets `section1Override` and
`section2Override` to `false` (open) directly, then scrolls to top. Deliberately bypasses
`toggleSection2`'s precondition guard, since Edit is an explicit "let me change something" request
from a fully-completed booking, not sequential progression, so the guard's blocked-note would never
be the right response here.

**Hourglass emoji added to the WhatsApp confirmation notice.** "Your selected date and time will be
confirmed by Salty Cowboys through WhatsApp." now reads "⏳ Your selected date and time will be
confirmed by Salty Cowboys through WhatsApp." in all three languages. This is a different string
from the confirm screen's Status value ("Awaiting approval"), which stays hourglass-free per Ro's
earlier explicit decision (diff #16, declined) — that decision was scoped to the Status field, not
this notice sentence.

**Duration auto-select on landing, reconfirmed still working.** No change needed; verified live that
the first duration option is still selected automatically when Step 2 first renders.

4 new assertions, 4 updated (2 stale from the Edit link's onClick change, 2 rescoped from a
file-wide "no hourglass anywhere" check down to "not glued onto the awaiting value specifically",
now that the emoji legitimately exists elsewhere in the file). 451/451 assertions and the jsdom
smoke test pass. Verified live in Chrome: filled out a full booking through to the summary,
confirmed the notice shows the hourglass, then clicked Edit and confirmed both section 1 (calendar)
and section 2 (rider fields) render open with their full content, not just their headings.

## 20 Aug 2026 — Step 2: blocked-note width matched to its card, gap set to 20px

Flagged by a screenshot: the blocked-note (the small dismissible "please pick a date first"
style message shown when a section is opened ahead of its own precondition) was wider than the
accordion card above it and sat flush against it with no gap.

Root cause: the note and its card are both direct children of `.main`, but the card is actually
inside a `.body` wrapper (671px max-width, 24px side padding, 623px content) while the note only
inherited the generic `.main > *` rule (660px max-width, no side padding) — 37px wider than the
card, and misaligned on the right edge. The old `margin-top: -22px` was there to cancel the card's
own 22px trailing margin so the two sat flush with zero gap.

Fixed by giving `.blocked-note` its own explicit `max-width: 623px` (matching the card's outer
width exactly, box-sizing is border-box globally so no extra padding math needed) and changing
`margin-top` from `-22px` to `-2px`, cancelling only 2px of the card's 22px trailing margin and
leaving a clean 20px gap. Verified live via `getBoundingClientRect`: note and card now both
measure 623px wide with identical left and right edges, and the gap between them is exactly 20px.

1 assertion updated (CSS needle only, same coverage). 447/447 assertions and the jsdom smoke test
pass.

## 20 Aug 2026 — Step 2: fixed uneven spacing under sections 1 and 2, centering re-verified

**Uneven bottom spacing under sections 1 and 2, fixed.** Flagged by a screenshot showing extra
whitespace under the collapsed cards for "1. Book a date and time" and "2. Who's coming?" (section
3 was already correct). Root cause: when `dateTimeHint` and `section2Subtitle` were made permanent
(always rendered, not conditionally removed) in an earlier batch, they never got the same
`marginBottom: 0`-while-collapsed fix that section 3's equivalent hint paragraph already had.
Both paragraphs stay visible in the collapsed state and sit right before their section's
`display:none` (not unmounted) body content, so the generic
`.step2-section-box > *:last-child { margin-bottom: 0; }` CSS rule targets the wrong, hidden
DOM-last child instead of the visible hint paragraph. Fixed by adding an explicit
`marginBottom: sectionCollapsed ? 0 : undefined` to each paragraph's inline style, conditional
(not unconditional) since both still need their normal 22px margin while the section is open.
Verified live via `getBoundingClientRect`: all three sections now measure `topGap: 24,
bottomGap: 26` consistently in the collapsed state (sections 1 and 2 previously measured
`bottomGap: 48`).

**"Centre horizontally aligned" text, re-checked against a reference screenshot, no change made.**
The same report asked for accordion text to be horizontally centred. Compared current rendering
against a reference screenshot of the intended look: heading and subtitle left-aligned, chevron on
the far right. That is exactly what the current `.section-title-toggle`
(`display: flex; justify-content: space-between`) and `.section-toggle-arrow` CSS already produce,
so no centering CSS was touched. The uneven spacing above was the only real defect behind the
original report.

**Sequential auto-open, reconfirmed already working.** The same report also asked that the next
accordion open automatically once the current one's fields are complete. This was implemented and
verified in an earlier batch (section 2 opens once `section1Complete`, section 3 once
`datesComplete`) and nothing in this fix touches that logic, so no change was needed here either.

5 assertions updated (needle text only, same coverage). 447/447 assertions and the jsdom smoke test
pass.

## 19 Aug 2026 — Step 2: blocked-note, duration auto-select re-added, alignment verified

**Blocked-note.** Trying to open section 2 or 3 ahead of sequence (its own precondition isn't met
yet) now shows a small dismissible note instead of opening — "Please pick a date and time first"
for section 2 (its real gate is `section1Complete`, dates *and* time), "Please pick a date first"
for section 3 (its gate is `datesComplete` only, time isn't required for it). Closing an
already-open section is never blocked, only opening one early is. Auto-dismisses after 3s, or the
user can close it with the × button. New `toggleSection2`/`toggleSection3` helpers centralize the
check instead of duplicating it across each section's heading and hint-paragraph click handlers.

Caught and fixed a real bug during verification, not just added the feature: the note's initial
CSS reused the shared `fadeUp` keyframe animation, but this is one large monolithic App component
with many hooks, and it re-renders often enough that the animation kept restarting from frame
zero — the note was rendering correctly (right text, right position, `display:flex`) but stuck at
`opacity: 0` for its *entire* visible lifetime, verified via `getAnimations()` showing
`currentTime` never advancing past 0 even 400ms+ after mount. Removed the animation entirely;
simplest fix, appears immediately at full opacity.

**Duration auto-select re-added.** The `useEffect` that defaults `duration` to
`actObj.durations[0]` was part of an earlier batch that got fully reverted along with three
unrelated fixes in the same commit. Re-added on its own this time.

**Heading/subtitle alignment, verified not broken.** Checked whether section 2's heading and
subtitle stay left-aligned at the same inset before and after filling in rider details, per a
screenshot flagging a possible regression. Measured via `getBoundingClientRect` in both states:
both land at the same 606px absolute position (17.5px inset) whether the card is empty or fully
filled in and auto-collapsed. No regression found, no change made.

7 new assertions, 10 updated. 447/447 assertions and the jsdom smoke test pass. Verified live in
Chrome: blocked-note shows correct per-section text and dismisses both by timer and by button,
closing an open section is never blocked, duration auto-selects on landing, and all three chevrons
render in the correct orientation for their actual open/collapsed state (confirmed via screenshot
after `getComputedStyle` gave contradictory readings for SVG `transform` in this environment — the
DOM's actual inline `style` attribute, the real source of truth for what React rendered, matched
the visual result; treated the computed-style readings as an SVG measurement artifact, not a bug).

## 19 Aug 2026 — Step 2: sequential reveal, permanent section hints

Two follow-ups to the chevron/mockup work above, both confirmed via quick clarifying questions
before implementing since they materially changed the accordion's default behaviour.

- **Section 2 starts closed.** Previously it opened by default until its own fields were complete.
  Now: closed when the user first lands on Step 2 (nothing to work on yet), auto-opens the instant
  section 1 completes (a sequential, step-by-step reveal), and still auto-collapses again once
  section 2's own fields are filled in — a compound default (`!section1Complete || detailsComplete`)
  rather than a single completion flag. `section1Complete` had to move earlier in the component
  (declared right after section 1's own block) since section 2's new default depends on it.
- **Permanent hints, not data summaries.** Section 1's `dateTimeHint` and section 2's new
  `section2Subtitle` now stay visible regardless of collapse state, doing double duty as the
  click-to-reopen affordance while collapsed. The old collapsed-only data summaries (duration/date/
  time for section 1, "3 people" for section 2) are removed entirely — matches Ro's mockup, which
  only shows the static subtitle line, never a data-driven one.

Manual override and the "clearing a required field forces back open" safety guarantee are
unaffected by either change.

4 new/updated assertions covering the reordering and new default formula, plus fixes to every
assertion describing the now-removed data-summary lines. 440/440 assertions and the jsdom smoke
test pass. Verified live in Chrome: section 2 closed on entry with subtitle showing, auto-opens on
section 1 completion, section 1's hint persists through collapse, section 2 stays open until fully
filled in (not just numPeople) before auto-collapsing again.

## 19 Aug 2026 — Step 2: always-visible chevron, open/close any time (Figma mockup)

Ro sent a Figma mockup of section 2's header: stroke chevron far right (not the old filled
`▾`/`▴` text glyphs positioned inline after the title), plus a request that all three accordions
be freely open/closeable at any time, not just once complete.

- **Chevron:** new `SectionChevron(open)` helper draws a 16x16 inline SVG, 1.5px `currentColor`
  stroke, rotated 180deg between down (closed) and up (open) instead of swapping glyphs.
  `.section-title-toggle` now lays the header row out `flex` with `justify-content: space-between`,
  chevron far right opposite the section number. Applied to sections 1, 2 and 3.
- **Always-open/closeable:** replaced the `section1ManualOpen`/`section2ManualOpen`/
  `section3ManualCollapse` booleans with a tri-state override per section (`null` = no manual
  interaction yet, use the default auto behaviour; `true`/`false` = user has explicitly toggled it).
  The heading is clickable at all times now for sections 1 and 2, not just once complete. The
  existing safety guarantee is preserved via a `useEffect` per section that resets the override to
  `null` the moment its required fields become incomplete again, so a manually-collapsed section
  can never end up hiding fields the user still needs to fix.
- **Section 3 exception:** its chevron is always visible (per the mockup), but the click-to-toggle
  stays gated on `datesComplete`. Section 3 has no fields of its own and starts genuinely empty;
  opening it early would show a blank summary and a premature-looking Send button, the same risk
  flagged earlier this session for a similarly-worded request. Chevron-visible-but-inert until
  `datesComplete` was the safest way to satisfy the visual ask without reopening that risk.
- **Section 2 subtitle:** added "A few details so we can ensure you have the best experience"
  (English) plus ID/RU translations, matching the mockup exactly, shown under the heading whenever
  section 2 is open. This is new copy, not reused from the existing unused `detailsHint` key (whose
  wording differs) — flagging for Simone's review same as any other new customer-facing text.

7 new assertions, 22 updated. 436/436 assertions and the jsdom smoke test pass. Verified live in
Chrome: chevron position/rotation, manual collapse/reopen on an incomplete section 2, section 3's
chevron visible-but-inert before dates are picked.

## 19 Aug 2026 — Step 2: fix oversized bottom padding on sections 1-3

Ro flagged from a screenshot that all three accordion cards had noticeably more whitespace below
their content than above it. Root cause, verified live via getBoundingClientRect rather than
guessed: whichever element ends up last inside a `.step2-section-box` usually carries its own
trailing `margin-bottom`, meant to space it from a *next sibling block* elsewhere on the page
(`.section-hint`'s 22px, `.cal-selection-panel`'s 22px, etc). When that same element happens to
also be the box's own last child - true for every section in the empty/initial state Ro's
screenshot showed - that margin bled into the box's own 25px bottom padding instead, roughly
doubling the visible gap (up to 48px measured, against a 24px top).

Fixed in two parts:
- `.step2-section-box > *:last-child { margin-bottom: 0; }` handles the general case (the box's
  own padding becomes the sole source of bottom spacing, regardless of which specific element ends
  up last for a given completion state).
- Section 3's collapsed-state hint paragraph needed its own explicit `marginBottom: 0`, since its
  true DOM-last sibling is a `display: none` element (the rest of the section's content, hidden
  but still present), so the generic `:last-child` selector was zeroing the wrong element's margin
  and missing the visible one.

Verified live across every completion state (empty, section 1 collapsed, mid-selection): top and
bottom gaps land within 1-2px of each other everywhere, all attributable to the border.

2 assertions updated/added. 429/429 assertions and the jsdom smoke test pass.

## 19 Aug 2026 — Step 2: fix oversized gap between section 2 and section 3

Ro flagged the gap between "2. Who's coming?" and "3. Your booking summary" as much bigger than
the gap above it, from a screenshot. Root cause: `.body` is shared between Step 1 (where it wraps
*all* of that screen's content, including the last activity card, so its 112px bottom padding
correctly lands at the true page end) and Step 2 (where it only wraps sections 1+2 — section 3 and
the funds card were pulled out as separate top-level siblings during an earlier commit this
session). Step 2's copy of that same 112px was landing between section 2 and section 3 instead of
at the real end of the page, stacking with section 2's own 22px margin-bottom for 134px total,
visibly bigger than the 22px rhythm everywhere else.

Added `.body.step2-block { padding-bottom: 0; }`, scoped to Step 2's instance only (Step 1's
`.body` has no `step2-block` class and keeps its full 112px). Verified live: section1-to-section2
and section2-to-section3 gaps are now both exactly 22px, and Step 1's trailing 112px is untouched.

1 new assertion. 428/428 assertions and the jsdom smoke test pass.

## 19 Aug 2026 — Step 2: fix text inset regression from the width-parity commit

The previous width-parity fix (`.step2-section-box.step2-block.fu`, `.cost-funds-card.step2-block.fu`
pinned to `padding-left/right: 0`) went further than intended: it zeroed section 3's and the funds
card's horizontal padding entirely instead of only cancelling the `.fu` page-inset that was
overriding their own component padding. Text in both cards ended up sitting ~1px from the card
edge (just the border), while sections 1/2 kept their normal 16.5px inset — exactly the "3." and
funds-card text sitting further left than "2." that Ro flagged from a screenshot.

Fixed by giving both cards their own explicit `padding-left/right: 16.5px` instead of `0`. The
funds card's own base padding is normally 18px, but Ro asked for all card text to align exactly,
so it's pinned to the same 16.5px as sections 1-3 (its 19px top/bottom padding is untouched, that
wasn't part of the complaint). Verified live via `getBoundingClientRect`: all four cards now share
identical width (623), left offset, and heading text inset (17.5px), exactly equal.

1 assertion updated. 427/427 assertions and the jsdom smoke test pass.

## 19 Aug 2026 — Step 2: card width parity (centering came free)

Section 3's box and the funds card were rendering 48px wider than Section 1's actual card: both
carry `.step2-block` *and* `.fu`, so the generic `.fu:not(.body):not(.confirm-screen)` page-inset
rule was adding its own 24px/side padding on top of the 671px allowance meant for `.body` to
subtract that same padding from, while Section 1's card sits nested inside `.body` and never
carries the inset itself. Added a higher-specificity override
(`.step2-section-box.step2-block.fu`, `.cost-funds-card.step2-block.fu`) pinning both to 623px
with zero page-level padding. Section 1 was not touched.

A second "cards aren't centered" fix was requested alongside this, but checking it against the
live DOM first (`getBoundingClientRect` on all four cards) showed centering was never actually
broken — `margin: 0 auto` was already inherited from the existing `.main > *` rule. What looked
like off-center cards in a screenshot was the width mismatch itself: a 671px-wide box centered in
the same space sits 24px further left than a 623px box next to it. No separate centering rule was
added; verified live that all four cards land at the exact same width (623) and left offset
(584.5), not just close.

1 new assertion. 427/427 assertions and the jsdom smoke test pass.

## 19 Aug 2026 — Step 2: section 3 becomes a closed-by-default accordion

Section 3 ("Your booking summary") previously didn't render at all until `datesComplete`. It now
always renders on the riders screen, starting collapsed with a static hint ("Complete the steps
above to see your summary"), and auto-opens once `datesComplete` becomes true — same reveal
timing as before, just a collapse instead of a hide. Once open, the heading becomes clickable
(matching sections 1/2) and toggles a new `section3ManualCollapse` state, so the user can manually
close it again; the collapsed hint then shows the running total price instead of the static text.

Section 2 ("Who's coming?") is unchanged — it still renders open by default and auto-collapses
once `detailsComplete`, per Ro's explicit call to leave it as-is.

This followed up on a request that initially asked to remove the render gates on sections 2/3 and
the WhatsApp CTA entirely (so an empty summary and an active-looking Send button would show before
any date was picked) framed as "Figma parity." That didn't match this codebase: the quoted
subtitle copy didn't exist anywhere in the file, and `tests/assert.js` already documented the
`datesComplete` gate as a deliberate decision from earlier project history. Flagged it and asked
before touching anything; Ro clarified she wanted the sections visible-but-collapsed instead,
which is what shipped here. `handleSend`/`buildWhatsAppMessage` still read exclusively from React
state, confirmed unchanged.

9 new assertions, 12 updated. 426/426 assertions and the jsdom smoke test pass. Verified live in
Chrome: section 3 collapsed pre-datesComplete, auto-opened on datesComplete with Send correctly
disabled (details still incomplete), manual collapse/reopen toggle both work.

## 19 Aug 2026 — Root-cause fix: body copy wasn't actually rendering lighter

Ro reported that after three rounds of lightening body-copy font-weight (500→400→300→200), the
card description still looked unchanged on her own machine. Root cause: `'Futura'` is listed
first in the `--display` font stack, and macOS ships system Futura with only Medium and Bold
weights, no Light/Regular/300/200 face. Since Futura resolves successfully on any Mac that has it
installed (which is most of them, it's a stock system font), every `font-weight` request below
~500 was silently clamping back to the same Medium face — none of the earlier weight changes had
anywhere lighter to land, even though they *looked* like they worked in this session's own
Chrome-automation screenshots (that environment evidently doesn't have Futura installed, so it was
falling through to the Outfit web font and actually showing the requested weight, masking the bug).

**Fix:** added a second font-family token, `--body: 'Century Gothic', 'Outfit', sans-serif;`
(deliberately excludes Futura), and switched every body-copy class from the earlier sweep onto it:
`.act-desc`, `.detail-desc`, `.section-hint`, `.cat-intro-text`, `.days-count`, `.notice`,
`.cost-funds-body`, `.notes-area::placeholder`, `.notes-time-hint`, `.session-note`, `.byo-note`,
`.price-note`, `.sat-note`, `.copy-fallback`, `.copy-text`, `.confirm-sub`. Headings, tabs, price
values/labels, chips, links, and buttons stay on `--display` (Futura first), untouched.

7 new assertions, 26 updated. 416/416 assertions and the jsdom smoke test pass.

**Follow-up:** with the `--body` fix in place, Ro could finally see the actual weight difference
and decided 200 was too light. `.act-desc` and `.detail-desc` are back to weight 300, matching the
rest of the body-copy set. The Outfit web-font import dropped the 200 weight again since nothing
uses it now.

**Follow-up 2:** `.act-name` (Step 1 card heading) bumped 14px → 16px per Ro's ask. Weight stays
500, unaffected by the body-copy work above (headings were explicitly excluded from that sweep).

**Follow-up 3:** the "🎁 Bring a friend for free" chip (Horse Whisperer Course only) moved from
after the price pills to directly under the card heading, before the description. Its own
`margin-top: 8px` was dropped since `.act-titledesc`'s 9px flex gap now spaces it on both sides.


## 19 Aug 2026 — Sitewide: lighten body copy one weight step

Lightens all body copy (descriptions, intro paragraphs, hints, and notes) across all three steps
by one font-weight step: 500→400, 400→300 (or the implicit 400 default→300 where no weight was set
explicitly). Headings, category tabs, price pills, duration labels, chips, links, and buttons are
untouched, per Ro's explicit scope call.

**Weight 500 → 400:** `.section-hint` (Step 1 + Step 2 hints), `.cat-intro-text` (Step 1 intro
paragraph), `.days-count`, `.notice` (confirmation note), `.cost-funds-body`,
`.notes-area::placeholder`.

**Weight 400 → 300 (or implicit default → explicit 300):** `.act-desc` (Step 1 card description),
`.session-note`, `.byo-note`, `.price-note`, `.sat-note`, `.notes-time-hint`, `.copy-fallback`,
`.copy-text` (the WhatsApp message preview), `.confirm-sub`.

**Follow-up 1:** `.detail-desc` (Step 2's activity card description) landed at 400 in the sweep
above, but Ro asked for card descriptions specifically to go lighter still, so it was brought down
to 300 to match `.act-desc` — both are now the same weight.

**Follow-up 2:** Ro then asked for card descriptions at weight 200 specifically. `.act-desc` and
`.detail-desc` are now both `font-weight: 200`. This only renders visibly lighter than 300 for
visitors who fall back to the Outfit web font (the `--display` stack is `'Futura', 'Century
Gothic', 'Outfit', sans-serif`, and neither Futura nor Century Gothic ships a 200 face on any
system, so they'd just clamp to their lightest available weight regardless) — so the Google Fonts
Outfit import was widened from `wght@300;400;500;600` to `wght@200;300;400;500;600` to actually
serve that face rather than silently rendering identical to 300.

**Explicitly left alone:** headings (`.section-title`), category tabs (`.cat-tab`), price values
and duration labels (`.pt-value`, `.pt-label`), chips (`.byo-chip`, `.free-chip`), eyebrow labels
(`.act-category`, `.rider-label`, `.field-label`, etc.), links (`.hint-link`, `.copy-fallback a`),
and all buttons.

7 new assertions, 13 updated. 413/413 assertions and the jsdom smoke test pass. Verified live in
Chrome across Step 1 (card description, intro paragraph), Step 2 (activity description, section
hints, cost-funds card), confirming the lightened copy reads clearly next to unchanged headings.

## 19 Aug 2026 — Step 1: remove intro header photo band, restore boxed intro

Removes the full-width header photo band above the Step 1 category intro paragraph, matching
Figma (no image above the intro copy). Structural only; the typography pass above is untouched.

- **Removed:** the `<img className="cat-intro-img">` element and its CSS rule. No shared component
  with Step 2's header image band (`.detail-header-image`) — confirmed the two are entirely
  separate classes/elements before touching anything; Step 2 is unaffected.
- **`.cat-intro` restored to a bordered box**, reversing the batch 5, Commit 2 full-bleed/no-card
  look now that there's no image left to bleed: `#f7f7f7` fill, 1px `--fog` border, 16px radius,
  padding 14px top/bottom, 17px sides. The intro paragraph now sits directly under the category
  tab row, inside this box.
- **Cleanup:** removed `.cat-intro-text`'s `margin-top: 12px` (was spacing the text from the now-
  gone image above it; the box's own padding replaces it). The 22px tabs-to-intro block gap was
  already correct and needed no change.
- The three embedded image constants (`IMG_PHOTOSHOOTS`, `IMG_RIDES`, `IMG_LESSONS`) are now
  unreferenced dead code, left in place pending a decision on trimming them.

3 assertions updated, 2 added. 406/406 assertions and the jsdom smoke test pass (body size dropped
~54KB with the three embedded images no longer rendered). Verified live in Chrome: intro box
renders correctly on Step 1, Step 2's header image band is untouched, Book navigation still works.

## 19 Aug 2026 — Figma typography pass, Step 1: activity picker

Sets Step 1's text roles (font size, weight, family) to Figma values. Styling only, no layout,
selection logic, navigation, data binding, selected-state fill, or check badge changes.

- **Card title (`.act-name`):** 22px → 14px. Was rendering far larger than the card content
  around it. Weight already 500.
- **Book button label (`.act-book-btn`):** 13px → 18px. Weight already 500.
- **Duration eyebrow (`.pt-label`):** 11px → 10.5px. Weight/uppercase/letter-spacing already
  matched.
- **Card description (`.act-desc`):** line-height 19.5px → 18px. Size/weight already matched.
- **Intro paragraph (`.cat-intro-text`):** added explicit `font-weight: 500` (was inheriting the
  implicit 400 default). Size 12.5px and line-height 1.6 (= 20px) already matched.

**Already matched Figma, left unchanged:** "Choose an activity" heading (22px/500), category tabs
(14px/500), price value (13px/500).

5 assertions updated, 1 added. 405/405 assertions and the jsdom smoke test pass. Verified live in
Chrome.

## 19 Aug 2026 — Figma card rebuild, Step 1: two-column activity cards

Restructures the Step 1 activity cards to match the Figma render: a two-column row (title,
description and price pills on the left; image and Book button on the right) instead of the
previous single vertical column. Structural and styling only, same as the spacing audit above.
No selection logic, navigation, or data binding changed.

- **Card layout:** new `.act-left` (title, description, price pills, stacked 22px apart, 9px
  between title and description) and `.act-right` (image, then Book button below it at the
  image's own width, right-aligned) wrap the existing content. Book button's `onClick` (activity
  selection resets + `setScreen("riders")`) and the card's own select-only `onClick` are untouched,
  verified live: card-body click still just selects/previews, Book still selects and advances to
  Step 2.
- **Responsive:** two-column row only applies at the existing 900px desktop breakpoint (same one
  the rest of the site's desktop layout switches on); below that, cards stay a single stacked
  column so mobile bookers aren't left with a cramped, unreadably narrow image. Caught and fixed a
  cascade bug along the way: the desktop override has to be placed in source order *after* the
  mobile-first base rule, since an earlier `@media` block matching at the same specificity still
  loses to a later unconditional rule for the same selector, media match or not. Also caught (via
  live render, not just code review) that `flex-wrap: wrap` was silently defeating the "image
  shrinks to fit" intent: wrap decides line breaks using each column's un-shrunk basis
  (316+284=600px, more than the 578px available inside the 623px content column), so the image
  column dropped to its own line regardless of its `flex-shrink`. Switched to `flex-wrap: nowrap`
  so shrinking actually runs.
- **Price pills:** now render one per duration, stacked vertically, still driven entirely from
  `t.prices[item.id]` (Beach & Rice Field Ride shows 2, Insta Ride shows 3) — no durations or IDR
  values hardcoded from the Figma export.
- **Font weights** (Futura throughout was already correct sitewide): price value (`pt-value`)
  700→500 and Book button 600→500, matching the title/value/heading/Book = 500 hierarchy.
  `act-desc` gets an explicit `font-weight: 400`.
- **Colours:** `pt-label` (duration label) moves off `var(--dusk)` to near-black at 60% opacity
  (`rgba(20, 20, 20, 0.6)`) — Figma exported this swatch as `rgba(0.11,0.11,0.11,0.60)`, a
  fractional-channel export glitch, not a real value; used our near-black token at 60% instead.
  Price pill background and image placeholder now use the captured raw greys (`#eeeeee`,
  `#d9d9d9`) rather than the `--fog`/`--sand` tokens, per explicit instruction that these stay as
  captured.

**Not touched, flagged for a decision:** the intro box's fill colour (`#f7f7f7`) was listed in the
same "greys as captured" instruction, but the intro box isn't one of "the activity cards," and its
card treatment was explicitly flagged last round as a deliberate batch 5, Commit 2 reversal
(full-bleed image, no border). Left it alone rather than guess; let me know if you want that
applied too.

10 new/updated assertions. 404/404 assertions and the jsdom smoke test pass. Verified live in
Chrome at desktop width (Rides and Photoshoots categories, multiple durations) and confirmed the
select-vs-Book click behaviour is unchanged.

## 19 Aug 2026 — Figma spacing audit, Step 1: content column, cards, pills, CTA

Applies the non-flagged resolved values from a spacing/layout audit of Step 1 (the activity
picker) against a Figma export. Presentation only, no state or business-rule changes.

- **Content column bottom padding:** `.body` grows from a flat 24px to 24px sides/top, 112px
  bottom, matching the Figma content-column spec (this is shared with Step 2, which also uses
  `.body`, so both steps now get the extra bottom breathing room).
- **22px block rhythm (override):** the export's raw 24px gap between Step 1's top-level blocks
  (heading, category tabs, intro, card list) is instead set to 22px to match Step 2's already-locked
  rhythm, per explicit direction. New scoped rule `.body:not(.step2-block) > .section-title` gives
  Step 1's heading a 22px trailing gap without touching the shared `.section-title` class used
  everywhere else. `.cat-tabs` padding/margin was restructured (was an ad hoc 4px/14px padding +
  2px margin) so its own trailing space is exactly 22px. `.cat-intro`'s trailing margin moved from
  18px to 22px.
- **Activity card padding (override):** the export's raw value (16px sides/13px top-bottom) is
  discarded in favour of the locked Step 2 card padding (23px top/16.5px sides/25px bottom), per
  explicit direction, for consistency with `.control-card` and `.step2-section-box`. Flagged as a
  divergence from the raw export at review time.
- **Activity card inner gap:** 6px to 12px, per the Figma export.
- **Card image placeholder height:** 140px to 233px, matching the Figma export's aspect ratio (fill
  colour and 14px radius were already correct).
- **Price pill:** padding 5px/11px to 5px/10px, row gap 6px to 8px.
- **CTA button ("Book →"):** padding 9px/18px to a flat 16px, radius 12px to 14px (matches the
  site's other 14px-radius cards). Full-width sizing from batch 5, Commit 2 is kept as-is; the
  Figma export's fixed 284x56px was an intentional, already-shipped divergence, not touched here.

**Flagged, not applied (need Ro's call before touching):**
- Doubled top padding on `.main` + `.body` (48px effective vs Figma's 24px target). Shared with
  Step 2's already-locked layout, so fixing it is out of this audit's scope.
- No dedicated "text-block" sub-column exists inside `.act-card` (Figma wants a nested 316px column
  with its own padding, 22px inner gap, and 9px title/desc micro-gap). Structural addition, not a
  value tweak.
- Category tabs' active state is filled (`background`/`border-color: var(--earth)`) where Figma
  specifies an unfilled 1px `--clay` outline. The filled look is a real, already-shipped visual
  choice, not a stray pixel value.
- Category tabs' inactive outline uses `--fog` (#e3e3e3, ≈black-11%) vs Figma's black-15%
  (≈#d9d9d9). Minor tone gap, recommend keeping `--fog` for token consistency unless exact parity
  matters.
- Intro box (`.cat-intro`) has no card treatment at all (full-bleed image + plain text), per an
  explicit batch 5, Commit 2 reversal. Figma wants it boxed (radius 16px, padding 17px/14px, 1px
  `--fog` outline). Reapplying the box would reverse that recent decision.

6 new assertions added, 4 updated for the new spacing values. 398/398 assertions and the jsdom
smoke test pass.

## 19 Aug 2026 — Batch 5, Commit 3: Step 2 boxing + destructure BYO / duration / back

Per `docs/batch5-futura-headers-gate.md`, Commit 3. Step 2 (booking flow) only, presentation only,
reverses two recently-approved visuals per explicit client direction.

**Bounding boxes.** Sections "1. Book a date and time" and "2. Who's coming?" are now each wrapped
in a new `.step2-section-box` div (border, 14px radius, 23px/16.5px/25px padding, matching the
existing card system), so the accordion separation reads clearly even before a section collapses.
Section 3 ("Your booking summary") already had its own top-level wrapper div, so it only needed the
same `step2-section-box` class added, not a new wrapper.

This was the riskiest part of the commit: wrapping existing JSX siblings in two new container divs
without breaking the surrounding `React.createElement` call tree. Verified structurally with an
acorn AST parse (not just string matching) before and after: the outer Step 2 div went from 21
top-level children to 9, with the new section-1 box containing exactly its intended 8 children
(heading through cal-selection-panel) and the new section-2 box containing exactly its intended 7
(the grooming picker, which visually sits above heading 2 but has always counted toward section 2's
completion state, through the photographer add-on). Nothing lost, nothing duplicated. `node --check`
passed after every edit.

**BYO line:** already a hairline (changed earlier this session per direct client feedback), so this
bullet needed no code change; confirmed still correct.

**Duration is no longer boxed.** Removed `.control-card` from the duration control specifically
(only duration was named; numPeople, rider cards, and the photographer add-on keep their own nested
card styling inside the new outer box, per the doc's literal scope). Its 22px trailing margin, lost
along with `.control-card`, was restored via inline style so spacing is unchanged. The 14px
label-to-pill gap was already inline and untouched.

**Back button** moved out of `.detail-header-card` to sit above the header image band, on white, as
the first element in Step 2. Pill/button chrome (border, padding, background) removed; it is now a
plain Futura 500 text link matching the `.hint-link` hover convention (color darken, no background
tint).

**Known pre-existing gap, not fixed here:** at mobile/tablet widths (below 900px), Step 2's three
top-level containers only get their 24px content-column inset via a desktop-only CSS rule
(`.main > .fu:not(.body):not(.confirm-screen)`). Section 3 and the cost-funds card were already
missing that inset below 900px before this commit (confirmed `.cost-funds-card` has the identical
gap today); adding a border to section 3 surfaces it more visibly. Fixing the responsive gap
touches shared layout rules beyond this commit's named scope, so it was left as-is and is flagged
here for a decision on whether to fix now or separately.

Payload safety: reused the same pre-accordion baseline from earlier in this batch, since this
commit only restructures wrapper `div`s and CSS, and never touches `buildWhatsAppMessage`,
`handleSend`, or any state value. Verified live: filled the same Beach Photoshoot booking (2 riders,
weights, photographer add-on, notes) inside the new boxed sections, sent, and confirmed the payload
is byte-for-byte identical to baseline (same MD5 hash, `6a0f0e91e844987796fe1d1c918e6ea2`). Also
re-verified the Horse Whisperer Course's multi-day picker still works correctly inside the new box.

9 new/updated assertions, plus fixes to 9 assertions made stale by the restructuring. 393/393
assertions and the jsdom smoke test pass.

## 19 Aug 2026 — Batch 5, Commit 2: Step 1 headers + full-width Book

Per `docs/batch5-futura-headers-gate.md`, Commit 2. Step 1 (activity picker) only, presentation only.

The category intro block (the image + description shown above the activity cards, one per
Rides/Photoshoots/Lessons tab) no longer reads as a clickable card: removed its background,
border, radius, and clipping. The image now bleeds edge to edge of the standard content column via
negative margins matching `.body`'s 24px padding, rather than sitting flush inside the old card's
own bounds. The description text lost its own padding so its left/right edges land exactly where
the act-cards below it start, not offset by old card padding. Verified live with `getBoundingClientRect`:
the image spans the full `.body` width, and the text's left/right edges match the act-card's
left/right edges to the pixel, across all three category tabs.

Each activity card's "Book →" button is now full width (`display: block; width: 100%`, replacing
`align-self: flex-start`), matching the same full-width button convention already used by the main
`.cta` button elsewhere in the app. Confirmed the click handler is untouched: it still sets the
activity, resets every dependent field, and advances to Step 2 in one click. Verified live.

7 new/updated assertions. 384/384 assertions and the jsdom smoke test pass.

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
