# Step 2 styling parity: weights and rhythm

Source of truth: Figma frame `5:1478` Dev Mode export.
Target: live `index.html`, Step 2.
Scope: presentation only. No logic, no copy, no reorder. One isolated commit, independently revertible.

Run the seven-step CLAUDE.md workflow. No em-dashes in copy, comments, or changelog.

---

## The rule that fixes most of this

Every text node in the Figma is **Futura, weight 500**. There is no bold anywhere in the frame. The only exception is the time-slot card duration sublabel, which is **Outfit 400** (lighter). The time-slot time value is **Outfit 500**.

So: nothing is 600 or 700. Any heading or title rendering bold on the live site is drift. Set all text to weight 500 except the two Outfit time-slot lines. This alone clears the "bold weights" complaint.

Do this as sub-step 1 of the commit and eyeball it before touching spacing. It is the highest-value, lowest-risk change.

---

## Type scale (authoritative)

Apply per role. Where the live build already references the right token, this is a no-op. Where it hardcodes bold or a different size, correct it.

| Role | Font | Weight | Size | Colour | Letter-spacing | Line-height |
|---|---|---|---|---|---|---|
| Activity title | Futura | 500 | 22px | #141414 (--earth) | | |
| Section heading (1 / 2 / 3) | Futura | 500 | 22px | #141414 | | |
| Activity description | Futura | 500 | 14px | #5C5C5C (--color-grey-36) | | 19.5px |
| Step 1 helper line | Futura | 500 | 13px | #6E6E6E (--dusk) | | 20.8px |
| Back link | Futura | 500 | 14px | #6E6E6E | | |
| Eyebrow label: Duration, Number of people, Participant details | Futura | 500 | 11px | #6E6E6E | 1.5px | uppercase |
| Eyebrow label: Time slot, Total cost | Futura | 500 | 10px | #6E6E6E | 2px | uppercase |
| Field label: Name, Age, Weight range, Riding experience | Futura | 500 | 11px | #6E6E6E | 0.5px | not uppercase |
| Field input value | Futura | 500 | 14px | #141414 | | |
| Pill: duration / people | Futura | 500 | 13px | sel #F0F0F0 / unsel #141414 | | |
| Pill: weight / experience | Futura | 500 | 12px | sel #F0F0F0 / unsel #141414 | | |
| Date readout | Futura | 500 | 14px | #383838 (--bark) | | |
| Time-slot time | Outfit | 500 | 16px | #F0F0F0 (--sand) | | |
| Time-slot duration sublabel | Outfit | 400 | 14px | #F0F0F0 | | |
| Calendar month | Futura | 500 | 18px | #F0F0F0 | | |
| Calendar weekday | Futura | 500 | 10px | white 30% | 1px | uppercase |
| Calendar day number | Futura | 500 | 13px | state-dependent | | |
| Calendar legend | Futura | 500 | 11px | white 40% | | |
| Summary row label | Futura | 500 | 13px | #6E6E6E | | |
| Summary row value | Futura | 500 | 13px | #141414 | | |
| Summary status value | Futura | 500 | 13px | #1A1A1A (--clay) | | |
| Edit link | Futura | 500 | 14px | #6E6E6E | | underline |
| Total cost value | Futura | 500 | 22px | #141414 | | |
| Notes placeholder | Futura | 500 | 11.5px | #999999 | | 16.1px |
| Consent checkbox text | Futura | 500 | 12px | #444444 (--color-grey-27) | | 18px |
| Confirmation note | Futura | 500 | 12px | #444444 | | 18px |
| Cost-funds heading | Futura | 500 | 18px | #141414 | | |
| Cost-funds paragraph | Futura | 500 | 12.5px | #4A4A4A (--color-grey-29) | | 20px |
| WhatsApp button | Futura | 500 | 18px | #FFFFFF | | |

Sidebar, for completeness: lang toggle Futura 500 11px letter-spacing 0.6px; "Book your experience" Futura 500 26px line-height 31.2px; subtitle Futura 500 12px letter-spacing 0.3px; stepper numbers Futura 500 10px.

---

## Alignment: one left edge

The live sections drift because they use different horizontal padding and max-widths, so headings, helper text, and cards do not line up. Figma's content sits at a consistent effective width of about **623px, centred**, which is the width of every card (duration, people, details, summary, date readout, time-slot row).

Fix: give the whole Step 2 content column one max-width (623px) and one horizontal alignment, so every section heading, helper line, and card shares the same left edge. Do not replicate the Figma's mixed 623 / 671 / 678 wrapper widths; those are artefacts of the frame, not intent. Pick 623 and align everything to it.

---

## Vertical rhythm

Top-level gap between major blocks in the Figma content column: **22px**.

Card padding (duration, number-of-people, details): 23px top, 25px bottom, 16.5px sides. Radius 14px, outline 1px #E3E3E3.

Section heading to its helper line: 10px.

Header band: inner white card radius 14px, padding 13px vertical / 20px horizontal. Inside it: back-link to title block 21px, title to description 5px.

Details card: 24px between field groups (name/age row, weight, experience), 6px label to control, input padding 11.5px vertical / 13.5px horizontal, input radius 10px.

Pills: duration/people padding 9.5px vertical / 16.5px horizontal, radius 24px, 8px between pills. Weight/experience padding 7.5px vertical / 13.5px horizontal, radius 20px, 6px between pills.

Time-slot card: padding 14.5px, radius 12px, min-width 92px, 2px internal gap.

Date readout box: padding 12px vertical / 14px horizontal, radius 10px, background #F7F7F7, outline #DCDCDC.

Summary card: padding 18.5px, radius 14px, outline #E3E3E3. Rows: 7px vertical padding, 1px #E3E3E3 bottom border. Edit link right-aligned, 9px above it.

Total cost: label to value 10px, right-aligned.

Notes box: min-height 84px, padding 17.2px top / 48.5px bottom / 14.5px sides, radius 12px, outline #E3E3E3.

WhatsApp button: padding 17px top / 16px bottom / 16px sides, radius 14px, background #1A1A1A.

Confirmation note box: padding 12px vertical / 14px horizontal, radius 10px, background #F7F7F7, outline #DCDCDC, 8px icon to text.

Cost-funds block: padding 14px vertical / 17px horizontal, heading to paragraph 13px.

---

## Commit scoping

- Sub-step 1: weights to 500 across the board (plus the two Outfit exceptions). Verify visually.
- Sub-step 2: content max-width and left-edge alignment.
- Sub-step 3: vertical rhythm and card padding to the values above.

One commit, no logic touched. Tests: no behavioural change expected. If any smoke assertion checks computed styles or class presence, update expected values. Re-run suite before the approval gate.

---

## Verify, do not assume

- **Font family token.** The Figma is Futura throughout. Confirm the live app's heading token resolves to Futura and not a heavier fallback or a leftover serif. If headings render in a different family, that is a bigger miss than weight and should be fixed in this same commit.
- **Empty-state void.** The large gap under "2. Who's coming?" in the current screenshot is the participant card not rendering because no number of people is selected. That is state, not a styling bug. Test with a fully completed booking before treating any section gap as broken.
