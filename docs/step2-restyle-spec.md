# Step 2 (riders screen) restyle spec

Target: `index.html`, the `screen === "riders"` view.
Source of truth: the Figma "Step 2" frame (node 5:1478). All tokens below are
taken from that frame's design context.

This is a RESTYLE pass. Look changes only, behaviour unchanged.

## Hard rules (do not violate)

1. Do not change the order. The live app renders rider details first, and the
   calendar block only after `detailsComplete` is true. Keep that order. Do NOT
   move the calendar above the details to match the mock.
2. Do not remove or alter the `detailsComplete` gate. The calendar, time slot,
   notes and send button stay gated behind it.
3. Do not touch state, handlers, or data. Preserve every `useState`, `onClick`,
   `onChange`, the duration to time-slot filtering, the WhatsApp send, the
   ACTIVITIES data, and the `screen` conditionals.
4. Restyle existing elements. The DOM already uses these class names. Edit their
   styles and class attributes. Do not rebuild elements as new
   `React.createElement` blocks and do not rename classes.
5. Ignore the Figma font-family names. The export substitutes them
   (Futura / Cormorant / Outfit) and they are unreliable. Keep whatever fonts
   are already loaded in `index.html`. Change size, weight, colour, spacing,
   letter-spacing, and line-height only, not the font family.
6. If any item below would require editing conditional rendering, state, or a
   handler, STOP and ask. Flag it, do not infer it.
7. Follow the CLAUDE.md seven-step workflow. Stop at the approval gate. Show the
   diff before committing.

## Design tokens (reference)

Colours:

| Token | Hex | Used for |
|---|---|---|
| earth | `#141414` | sidebar bg, primary text, selected pill bg, calendar bg |
| clay | `#1a1a1a` | CTA button bg, Status value |
| cream / white | `#ffffff` | card bg, main bg |
| sand | `#f0f0f0` | light text on dark |
| grey/97 | `#f7f7f7` | intro card fill, notice fill |
| fog | `#e3e3e3` | card and input borders |
| alto | `#dcdcdc` | notice border |
| dusk | `#6e6e6e` | labels, secondary text |
| scorpion | `#5c5c5c` | body / description text |
| tundora | `#4a4a4a` | cost-funds body text |
| grey/27 | `#444444` | perm-row text, notice text |
| clay/dk | `#ededed` | completed step dot |
| placeholder | `#999999` | notes-area placeholder |
| white alphas | `rgba(255,255,255, .06 / .1 / .2 / .3 / .35 / .45 / .55)` | dividers, muted text and cells on dark |

Radii: cards `14px`, calendar container `14px`, calendar day cells `8px`,
cal-nav buttons `8px`, duration/people pills `24px`, weight/experience
field-pills `20px`, price-tag `300px`, notice `10px`, notes-area and inputs
`10 to 12px`, perm-box `6px`.

Type: section headings `22px`; calendar month `18px`; time-main `16px`; CTA text
`18px`; body and summary values `13 to 14px`; uppercase labels `11px` with
`1.5px` letter-spacing; tiny uppercase labels `10px` with `2px` letter-spacing;
cost-funds heading `18px`, body `12.5px` / line-height `20px`.

## Change list (each item: restyle the element if it exists in the riders DOM)

| Element (class) | Target look |
|---|---|
| `div.steps` / `div.step-dot` | 22px dots, ~11px radius, 1px border. Done dot: bg `#ededed`, mark in `#111`. Current dot: border `#ededed`, text `#ededed`. Upcoming dot: border `rgba(255,255,255,.2)`, text `rgba(255,255,255,.3)`. `div.step-line` completed portion `#ededed`, rest `rgba(255,255,255,.1)`. Which dot is active is derived from `step` state, leave that logic alone. |
| `div.rider-card` | bg white, 1px `#e3e3e3` border, radius 14, padding pt 23 / pb 25 / px 16.5. |
| `div.rider-label` uppercase labels | 11px, letter-spacing 1.5px, uppercase, colour `#6e6e6e`. |
| `button.pill` (duration, number of people) | Selected: bg `#141414`, border `#141414`, text `#f0f0f0`. Unselected: bg white, border `#e3e3e3`, text `#141414`. Radius 24, px 16.5 py 9.5. Selection state stays bound to existing state. |
| `button.field-pill` (weight range, riding experience) | Same selected/unselected colours as pills. Radius 20, px 13.5 py 7.5, text 12px. |
| `input.text-input` (Name, Age) | bg white, border `#e3e3e3`, radius 10, padding ~13.5 / 11.5, text 14px `#141414`, label 11px `#6e6e6e`. |
| `div.perm-row` / `div.perm-box` | Row: bg `#f7f7f7`, border `#dcdcdc`, radius 10, text 12px `#444`. Box: bg `#1a1a1a`, radius 6, check in white. Keep the under-18 conditional that shows this row. |
| `div.cal-header` | bg `#141414`, top corners radius 14, month text `#f0f0f0` 18px. cal-nav buttons: 30px, radius 8, border `rgba(255,255,255,.2)`, arrow `#f0f0f0`. |
| `div.cal-grid` | bg `#141414`, px 24 py 16, 3px gap between cells. Day-name headers 10px uppercase `rgba(255,255,255,.3)` letter-spacing 1px. |
| `div.cal-day` | Available: bg `rgba(255,255,255,.14)`, border `rgba(255,255,255,.3)`, text `#f0f0f0`, radius 8. Unavailable: no bg, text `rgba(255,255,255,.2)`. Selected: bg white, border `rgba(255,255,255,.3)`, text `#141414`. The available / unavailable / selected class assignment is existing logic, keep it. |
| `div.cal-legend` | bg `#141414`, top border `rgba(255,255,255,.06)`, bottom corners radius 14. Text 11px `rgba(255,255,255,.4)`. Dots 10px radius 3: available bg `rgba(255,255,255,.35)` border `rgba(255,255,255,.5)`, selected bg `#ededed`, unavailable bg `rgba(255,255,255,.08)`. |
| `div.time-card` | Selected: bg `#141414`, border `#141414`, radius 12, padding 14.5, time-main 16px `#f0f0f0`, sub 14px `#f0f0f0`. Unselected: mirror with bg white, border `#e3e3e3`, text `#141414`. Selection stays bound to state. |
| `div.notice` | bg `#f7f7f7`, border `#dcdcdc`, radius 10, text 12px `#444`, padding ~14 / 12. |
| `div.price-reveal` (total cost) | "Total cost" label 10px uppercase letter-spacing 2px `#6e6e6e`, right-aligned. Amount 22px `#141414`. Value comes from existing price logic, do not recompute. |
| `textarea.notes-area` | bg white, border `#e3e3e3`, radius 12, min-height 84, placeholder `#999` 11.5px. |
| `button.cta` ("Send request via WhatsApp") | bg `#1a1a1a`, radius 14, text 18px white centred, pt 17 pb 16. Keep the WhatsApp onClick exactly. |
| cost-funds block (`div.cat-intro-text` variant) | heading 18px `#141414`, body 12.5px `#4a4a4a` line-height 20. Remove the leading emoji from the heading (see numbering / emoji note). |

## Flagged as structural, do NOT build this pass

These appear in the mock but are not in the current riders DOM. Adding them is a
structure change, out of scope for a restyle. List them back to me, do not build:

- The decorative image band behind the activity detail header (faint image at
  ~20% opacity with a grey overlay). If the current header has no such band,
  leave it flat and flag it.
- The in-page booking summary block on Step 2 (`confirm-summary` with sum-rows,
  Edit link). In the live app this lives only on the confirm screen. Do not add
  a second copy to the riders screen on this pass.

## Numbering and emoji

- Drop the leading numerals from the section headings ("1. Book a date and
  time", "2. Who's coming?", "3. Your booking summary"). Use the heading styling
  as plain titles. Reason: the sidebar already carries a 1-2-3 stepper, so
  numbered body headings collide with it, and the live order differs from the
  mock's order anyway.
- Remove decorative emoji (the horse, hourglass, clipboard) from headings and
  labels. Keep the meaning in the text. This matches the spare editorial tone.

## After the pass

The honest tell that this stayed a restyle: the diff is styles and class
attributes on elements that already existed. No new `React.createElement` blocks,
no edits to `useState`, the `screen` conditionals, the `detailsComplete` gate, or
any `onClick` / `onChange`.
