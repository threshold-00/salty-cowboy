# Booking engine structural re-spec (Steps 1 to 3)

Target: `index.html`, the single-file React app. Screens driven by one `screen`
state: `activity` / `riders` / `confirm`. Styling lives in the `css` template
string (from line ~1075), tokens are CSS variables in `:root`.

This is NOT a restyle. The tokens already match the Figma. The visible gap is
structure and layout, and one part of it touches logic. So this spec changes DOM
order, adds blocks, and in one place removes a render gate. It is split into four
commits so the risky part is isolated and revertible on its own.

## Confidence

- Step 2 deltas are verified against the current code (the `detailsComplete`
  gate, the details-first order, the absent in-page summary).
- Step 1 and Step 3 deltas are read from the current screenshots plus the
  earlier frame read. Items I could not re-confirm against the frame are tagged
  `VERIFY`. Drop the Figma PNGs to have those pinned exactly.

Tags used below: `[ADD]` new block, no logic. `[REORDER]` moves existing DOM.
`[LOGIC]` touches state or a render condition, needs the business-rules step.
`[VERIFY]` inferred, confirm against the frame. `[COPY]` text only.

## Commit plan

| Commit | Screen | Touches logic? | Notes |
|---|---|---|---|
| A | Step 1 activity cards | No | Card layout: image area + per-card action |
| B | Step 2 additions | No | Detail header band, in-page summary, numbered headings |
| C | Step 2 reorder + ungate | YES | Calendar first, gate moved off calendar onto Send. Own commit. |
| D | Step 3 + copy cleanup | No | Emoji, em-dashes, optional heading tighten |

Do A, B, D first (all safe). Do C last and alone, with the CLAUDE.md
business-rules assessment, since it touches the same dependencies as the
multi-day selector and the duration-filtered ride slots.

---

## Global preserve rules (all commits)

1. Simone's WhatsApp flow is inviolable. Do not change the message content, the
   number, or the send handler except where a commit explicitly says so.
2. Do not change price logic, the `ACTIVITIES` data, the language switch, or the
   `screen` state machine.
3. Keep the SEND button gated on full completeness. Commit C moves a gate OFF the
   calendar's visibility, it does NOT remove validation from submit.
4. Follow the seven-step workflow. Approval gate before every commit. One commit
   at a time, in the order above.

---

## Commit A. Step 1, activity cards

Current: each `act-card` is a horizontal row, a small emoji chip on the left,
title plus price chips plus description on the right, whole card clickable, one
"Next" button at the page bottom.

Figma: taller cards with a dedicated image area, title, price chips,
description, and a per-card action to proceed.

| Change | Tag |
|---|---|
| Give `act-card` a real image region (the grey placeholder block in the frame) in place of the emoji chip. Keep it as an empty styled container, radius 14, bg `var(--fog)`, until real photos are wired. Do not build image loading. | `[ADD]` |
| Card becomes vertical: image, then title, then price chips row, then description. | `[REORDER]` |
| Per-card action to advance. `VERIFY` whether the frame uses a "Book" button per card or keeps the whole card clickable with the single "Next". If per-card button: it must call the SAME handler the card click calls today (select activity, go to `riders`). Do not invent a new handler. | `[VERIFY]` `[ADD]` |
| "Where the money goes" card: confirm placement. It currently sits at the very top of Step 1. `VERIFY` against the frame whether it belongs here or is the Step 2 "What your booking cost funds" block. Do not move it until confirmed. | `[VERIFY]` |

---

## Commit B. Step 2, structural additions (no logic)

These are all additive. They do not reorder anything and do not touch the gate,
so they are safe to land before the risky Commit C.

| Change | Tag |
|---|---|
| Activity detail header: add the faint image band behind the Back link and title (image at low opacity with a grey overlay, radius 14). Purely decorative. The Back link and title already exist, wrap them over the band. | `[ADD]` |
| Numbered section headings. Add "1. Book a date and time", "2. Who's coming?", "3. Your booking summary" as section headers. In Commit B these sit above the existing blocks in their CURRENT order. Commit C then reorders the blocks so the numbers read correctly top to bottom. (If you would rather not have a 1-2-3 that briefly disagrees with the sidebar stepper between B and C, land B and C together.) | `[ADD]` |
| In-page booking summary block before Send: add a `confirm-summary` style block on the riders screen showing Activity, Duration, Date and time, Riders, Total, Status, reading from the same booking state the confirm screen already uses. This DISPLAYS existing state, it does not compute anything new. Reuse the confirm screen's summary markup so labels stay identical. | `[ADD]` |

Note on the summary block: the confirm screen already builds this exact summary.
Lift its structure, do not author fresh values, so Step 2 and Step 3 cannot drift.

---

## Commit C. Step 2, reorder and ungate (LOGIC, isolate this commit)

This is the one that makes Step 2 actually look like the frame, and the one that
touches behaviour. Do it alone, run the business-rules step, and keep it
independently revertible.

Current order and gate:
- Rider details render first.
- The calendar, time slot, notes and Send render only when `detailsComplete`
  is true (progressive disclosure).

Target order (from the frame):
1. Book a date and time: duration pills, calendar, selected-date notice, time slot
2. Who's coming: number of people, participant details (name, age, permission,
   weight, experience)
3. Your booking summary, then Send

| Change | Tag |
|---|---|
| Move the date-and-time block (duration pills, calendar, time slot) ABOVE the rider-details block. | `[REORDER]` |
| Remove `detailsComplete` from the CALENDAR block's render condition so the calendar is visible immediately. | `[LOGIC]` |
| Keep duration selectable at the top of section 1, ABOVE the calendar, because duration still filters the time slots. Do not detach that binding. | `[LOGIC]` |
| Keep the SEND button gated on full completeness. Move the completeness requirement onto Send (and/or the summary), not the calendar. Submitting an incomplete booking must still be impossible. | `[LOGIC]` |
| Re-check the two known dependents after reordering: the horse-whispering multi-day selector and the duration-filtered ride slots. Confirm both still receive the values they expect now that details come after the calendar. If either breaks, STOP and report. | `[LOGIC]` |

Acceptance for Commit C: calendar shows on entry, duration still filters slots,
weight and experience gating still work, and Send remains impossible until every
required field is set. If any of those four is not true, revert this commit.

---

## Commit D. Step 3 and copy cleanup

Step 3 already matches the frame structurally (heading, summary, copy-message
box, Copy button, Make another booking). Small items only.

| Change | Tag |
|---|---|
| Remove em-dashes everywhere in copy. Current live copy has them in the Step 3 heading ("another window — please hit send"), the WhatsApp message ("New booking request — Salty Cowboys"), and the rider line ("age 4 — Never ridden"). Replace with a period, "at", or a comma as reads best. This is your standing rule. | `[COPY]` |
| Decorative emoji: the flower on Step 3, the wave and sunrise chips on Step 1, the seedling in the Step 2 notice. `VERIFY` against the frames. If a frame includes an emoji and you want an exact match, keep it. If matching the spare editorial tone matters more, remove them. Your call, flag which way you want it. | `[VERIFY]` `[COPY]` |
| Optional heading tighten: "Almost done. Hit send in WhatsApp to confirm." Copy only, apply if you want it. | `[COPY]` |

---

## After each commit

The tell that a commit stayed in scope: for A, B and D the diff is markup and CSS
only, no edits to `useState`, the `screen` conditionals, or handlers. For C the
diff is DOM order plus exactly one gate moved from the calendar to submit, and
the four acceptance checks above all pass. If C touches anything beyond that,
it has grown past its scope.
