# Booking engine restyle spec (Steps 1 to 3)

Target: `index.html`, the single-file React app. Three screens, driven by one
`screen` state: `activity` (Step 1), `riders` (Step 2), `confirm` (Step 3).
`step = screen === "activity" ? 1 : screen === "riders" ? 2 : 3`.

Source: the Figma "Booking Engine" frames, Step 1 (node 8:3820), Step 2
(node 5:1478), Step 3 (node 5:3176), plus the shared design-token system below.
Tokens are consistent across all three screens.

This is a RESTYLE pass. Look changes only, behaviour unchanged.

Suggested order: do Step 1 first (near-pure restyle, safest pipeline test), then
Step 3, then Step 2 last (it carries the `detailsComplete` gate). Land each
screen as its own commit through the CLAUDE.md seven-step workflow, stopping at
the approval gate each time.

---

## Global hard rules (apply to every screen)

1. Restyle existing elements. The DOM already uses the class names referenced
   below. Edit their styles and class attributes. Do not rebuild them as new
   `React.createElement` blocks and do not rename classes.
2. Do not touch logic. Preserve every `useState`, `onClick`, `onChange`, the
   `screen` conditionals, the `ACTIVITIES` data, all price logic, and the
   WhatsApp flow. Change look, not behaviour.
3. Ignore the Figma font-family names. The export substitutes them
   (Futura / Cormorant / Outfit) and they are unreliable. Keep the fonts already
   loaded in `index.html`. Change size, weight, colour, spacing, letter-spacing
   and line-height only, not the font family.
4. If any item would require editing conditional rendering, state or a handler,
   STOP and ask. Flag it, do not infer it.
5. Remove decorative emoji (horse, hourglass, clipboard, checkmark) from
   headings and labels across all screens. Keep the meaning in the text. This
   matches the spare editorial tone.
6. Follow the CLAUDE.md seven-step workflow. Stop at the approval gate. Show the
   diff before committing.

## Design tokens (shared reference)

Colours:

| Token | Hex | Used for |
|---|---|---|
| earth | `#141414` | sidebar bg, primary text, selected pill bg, calendar bg |
| clay | `#1a1a1a` | CTA button bg, Status value |
| cream / white | `#ffffff` | card bg, main bg |
| sand | `#f0f0f0` | light text on dark |
| grey/97 | `#f7f7f7` | intro card fill, notice fill, copy-box fill |
| fog | `#e3e3e3` | card and input borders |
| alto | `#dcdcdc` | notice and copy-box border |
| dusk | `#6e6e6e` | labels, secondary text |
| scorpion | `#5c5c5c` | body / description text |
| tundora | `#4a4a4a` | intro and cost-funds body text |
| grey/27 | `#444444` | perm-row, notice, copy-text |
| clay/dk | `#ededed` | completed step dot |
| placeholder | `#999999` | notes-area placeholder, unselected tab text |
| white alphas | `rgba(255,255,255, .06 / .1 / .2 / .3 / .35 / .45 / .55)` | dividers, muted text and cells on dark |

Radii: cards `14px`, calendar container `14px`, calendar day cells `8px`,
cal-nav buttons `8px`, duration/people pills `24px`, weight/experience
field-pills `20px`, price-tag `300px` (fully round), notice `10px`, copy-box
`12px`, notes-area and inputs `10 to 12px`, perm-box `6px`, buttons `12 to 14px`.

Type: section and card headings `22px`; calendar month `18px`; cost-funds and
intro heading `18px`; time-main `16px`; CTA text `18px`; body, description and
summary values `13 to 14px`; intro body `12.5px` line-height `20px`; uppercase
labels `11px` letter-spacing `1.5px`; tiny uppercase labels `10px` letter-spacing
`2px`.

Shared pill / card pattern: selected = bg `#141414`, border `#141414`, text
`#f0f0f0`. Unselected = bg white, border `#e3e3e3`, text `#141414`. Primary CTA =
bg `#1a1a1a`, text white, radius 14.

---

## Step 1 (activity screen)

Preserve: the category filter state and its `onClick`, the `ACTIVITIES` data, and
each card's Book action (selects the activity and moves to the riders screen).

| Element (class) | Target look |
|---|---|
| `button.cat-tab` (Rides / Photoshoots / Lessons) | Editorial monochrome tab bar. Selected: text `#141414`, weight up, 1px underline indicator. Unselected: text `#999`, no underline. VERIFY against the frame, this is the one treatment I could not re-read exactly. If the frame uses filled tabs instead, use the shared pill pattern (selected earth fill / sand text, unselected white / fog border, radius 24). Selected category is existing state, leave the logic alone. |
| `div.cat-intro` | bg `#f7f7f7`, radius 14, padding ~18 to 20. Heading 18 to 22px `#141414`. Body 12.5px `#4a4a4a` line-height 20. |
| `div.act-card` | bg white, 1px `#e3e3e3` border, radius 14, generous padding. Calm and spacious. |
| activity name in `act-card` | 22px `#141414`. |
| activity description in `act-card` | 14px `#5c5c5c`, line-height ~19.5px. |
| `span.price-tag` (duration and price chips) | Fully round radius 300. Subtle fill `#f7f7f7` or 1px `#e3e3e3` border, text 11 to 13px `#141414`, small padding (px ~11 py ~5). Keep the two chips reading as a pair. |
| activity image area | Real imagery still a placeholder. Style the empty state: radius 14, bg `#e3e3e3`. Do not wire up image loading. |
| Book button in `act-card` | Primary CTA look: bg `#1a1a1a`, text white, radius 12 to 14. If the frame shows an outline button, use white bg / 1px `#141414` border / `#141414` text. Keep its onClick exactly. |

No numbered body headings on this screen.

---

## Step 2 (riders screen)

Extra hard rules for this screen:

- Do not change the order. The live app renders rider details first, and the
  calendar block only after `detailsComplete` is true. Keep that order. Do NOT
  move the calendar above the details to match the mock.
- Do not remove or alter the `detailsComplete` gate. Calendar, time slot, notes
  and send stay gated behind it.
- Drop the leading numerals from the section headings ("1. Book a date and
  time", etc). Use the heading styling as plain titles. Reason: the sidebar
  already carries a 1-2-3 stepper, and the live order differs from the mock, so
  numbered body headings would collide and mislabel.

Preserve: duration to time-slot filtering, the number-of-people, weight-range
and experience selections, the name/age inputs, the under-18 permission
conditional, all price logic, and the WhatsApp send.

| Element (class) | Target look |
|---|---|
| `div.steps` / `div.step-dot` | 22px dots, ~11px radius, 1px border. Done: bg `#ededed`, mark `#111`. Current: border `#ededed`, text `#ededed`. Upcoming: border `rgba(255,255,255,.2)`, text `rgba(255,255,255,.3)`. `div.step-line` completed portion `#ededed`, rest `rgba(255,255,255,.1)`. Active dot derives from `step`, leave that logic alone. |
| `div.rider-card` | bg white, 1px `#e3e3e3` border, radius 14, padding pt 23 / pb 25 / px 16.5. |
| uppercase field labels | 11px, letter-spacing 1.5px, uppercase, `#6e6e6e`. |
| `button.pill` (duration, number of people) | Shared pill pattern. Radius 24, px 16.5 py 9.5. Selection stays bound to state. |
| `button.field-pill` (weight range, experience) | Shared pill pattern. Radius 20, px 13.5 py 7.5, text 12px. |
| `input` (Name, Age) | bg white, border `#e3e3e3`, radius 10, padding ~13.5 / 11.5, text 14px `#141414`, label 11px `#6e6e6e`. |
| `div.perm-row` / `div.perm-box` | Row: bg `#f7f7f7`, border `#dcdcdc`, radius 10, text 12px `#444`. Box: bg `#1a1a1a`, radius 6, check white. Keep the under-18 conditional that shows this row. |
| `div.cal-header` | bg `#141414`, top corners radius 14, month text `#f0f0f0` 18px. cal-nav buttons 30px, radius 8, border `rgba(255,255,255,.2)`, arrow `#f0f0f0`. |
| `div.cal-grid` | bg `#141414`, px 24 py 16, 3px gap. Day-name headers 10px uppercase `rgba(255,255,255,.3)` letter-spacing 1px. |
| `div.cal-day` | Available: bg `rgba(255,255,255,.14)`, border `rgba(255,255,255,.3)`, text `#f0f0f0`, radius 8. Unavailable: no bg, text `rgba(255,255,255,.2)`. Selected: bg white, border `rgba(255,255,255,.3)`, text `#141414`. The available/unavailable/selected class assignment is existing logic, keep it. |
| `div.cal-legend` | bg `#141414`, top border `rgba(255,255,255,.06)`, bottom corners radius 14, text 11px `rgba(255,255,255,.4)`. Dots 10px radius 3: available bg `rgba(255,255,255,.35)` border `rgba(255,255,255,.5)`, selected bg `#ededed`, unavailable bg `rgba(255,255,255,.08)`. |
| `div.time-card` | Selected: bg `#141414`, border `#141414`, radius 12, padding 14.5, time-main 16px `#f0f0f0`, sub 14px `#f0f0f0`. Unselected: white bg, border `#e3e3e3`, text `#141414`. Selection stays bound to state. |
| `div.notice` | bg `#f7f7f7`, border `#dcdcdc`, radius 10, text 12px `#444`, padding ~14 / 12. |
| `div.price-reveal` (total cost) | "Total cost" label 10px uppercase letter-spacing 2px `#6e6e6e` right-aligned. Amount 22px `#141414`. Value from existing price logic, do not recompute. |
| `textarea.notes-area` | bg white, border `#e3e3e3`, radius 12, min-height 84, placeholder `#999` 11.5px. |
| `button.cta` (Send request via WhatsApp) | bg `#1a1a1a`, radius 14, text 18px white centred, pt 17 pb 16. Keep the WhatsApp onClick exactly. |
| cost-funds block | heading 18px `#141414`, body 12.5px `#4a4a4a` line-height 20. |

Flagged as structural, do NOT build this pass (list back to me instead):

- The decorative image band behind the activity detail header (faint image ~20%
  opacity with grey overlay). If the current header has no band, leave it flat.
- The in-page booking summary block on Step 2 (`confirm-summary` with sum-rows,
  Edit link). In the live app this lives only on the confirm screen. Do not add
  a second copy to the riders screen this pass.

---

## Step 3 (confirm screen)

Preserve: the copy-to-clipboard handler, the "make another booking" reset, the
summary values read from booking state, and the content of the prefilled
WhatsApp message. Do not change the WhatsApp message text or the number inside
it (that is a go-live data item, see below).

| Element (class) | Target look |
|---|---|
| `div.confirm-screen` | Centred column, comfortable vertical rhythm, cream background consistent with the other screens. |
| confirm heading | 22px `#141414`. Optional copy tighten below, styling unchanged either way. |
| `div.confirm-summary` | bg white, 1px `#e3e3e3` border, radius 14, padding ~18.5. |
| `div.sum-row` | Label 13px `#6e6e6e` left, value 13px `#141414` right-aligned. 1px `#e3e3e3` bottom border on every row except the last. |
| Status value in `sum-row` | colour `#1a1a1a` (e.g. "Awaiting approval"). |
| total row | "Total" label 10px uppercase letter-spacing 2px `#6e6e6e`, amount 22px `#141414`. Value from existing state, do not recompute. |
| `div.copy-box` | bg `#f7f7f7`, 1px `#dcdcdc` border, radius 12, padding ~14 to 16. |
| `div.copy-text` (prefilled WhatsApp message) | 13px `#444`, line-height ~19px. Do not alter the message content. |
| copy button | Compact. bg `#1a1a1a` / text white / radius 12, or white bg with 1px `#141414` border. Keep the clipboard onClick exactly. |
| "Make another booking" link | Underlined link, 14px `#6e6e6e`. Keep the reset onClick that returns to the activity screen. |

Flagged, decide separately (not restyle):

- Heading copy (optional). The live heading is long ("WhatsApp has opened in
  another window, please hit send to make the booking request"). Tighter option:
  "Almost done. Hit send in WhatsApp to confirm." Copy change, not logic. Apply
  only if you want it.
- Label consistency (optional). Step 2 uses "Participant", this screen and the
  WhatsApp message use "Riders". If you want them to match, standardise on
  "Riders" for rides and lessons, but note it may need to be activity-aware for
  photoshoots. Flag, do not silently change.

Go-live data note (not part of this pass): the WhatsApp number in the copy
message (`+61 466 567 953`) renders on this screen. Confirm whether it is
Simone's live number or still the placeholder, since it appears in both the
visible copy and the paste message. Handled as data, not a restyle edit.

---

## After the pass (every screen)

The honest tell that this stayed a restyle: the diff is styles and class
attributes on elements that already existed. No new `React.createElement` blocks,
and no edits to `useState`, the `screen` conditionals, the `detailsComplete`
gate, the `ACTIVITIES` data, price logic, or any `onClick` / `onChange`.
