# Step 2 batch 3: header, accordions, spacing, regressions

Source of truth: Figma frame `5:1478`.
Target: live `index.html`, Step 2. Applies to all activities unless noted.
Run the seven-step CLAUDE.md workflow per commit. No em-dashes in copy, comments, or changelog. Approval gate before each commit. Hold push until the whole batch is verified.

Build order is safest first. Commits 4 and 5 touch the WhatsApp payload and each carry a business-rules gate. Keep them isolated for independent reversion.

---

## Commit 1: spacing fixes (mechanical)

Same rhythm system as the styling-parity pass. No logic.

- **Duration card (#4):** internal spacing is uneven. Set card padding to 16.5px sides, 23px top, 25px bottom. Label ("DURATION") to pill row gap per the type scale (14px). Pills: 8px between, radius 24px. Confirm the label sits at the same left inset as the pills, not hanging right.
- **Cost-funds alignment (#6):** the block sits at a different left inset than the WhatsApp button above it. Align both to the single 623px content column left edge. This is the same one-edge fix from the styling pass; if that pass already set the column, this is just bringing the cost-funds block into it.

Business rules: none. Presentation only.
Tests: no behavioural change. Update any computed-style assertions if present.

---

## Commit 2: BYO line into a label (#2, additive)

- Wrap "BYO Photographer or add a Salty Cowboys photographer" in a label treatment (eyebrow/pill style, matching the DURATION label convention: Futura 500, 11px, #6E6E6E, uppercase, letter-spacing 1.5px, or the pill style if a filled chip is intended). Confirm which of the two visuals is wanted before finalizing; default to the eyebrow label unless told otherwise.
- Give it real space above and below so it stops jamming against the section heading. It should read as belonging to the photoshoot header, not floating between blocks.

Business rules: none. This is a photoshoot-only line; confirm it still renders only for photoshoot activities and not for rides.
Tests: presence assertion for photoshoot activity only.

---

## Commit 3: header image band (#1, visual, isolated)

Structure: full-width image band with the existing white text card sitting on top of it. This is text-on-card-on-image, not text-on-image, so no scrim or legibility treatment is needed. This is close to the original Figma header band (a ~269px band with a floating white card), so favour restoring that structure over inventing a new one.

- Add a full-width image band behind the header card. Image is per-activity (each activity supplies its own header image); provide a sensible fallback/placeholder where an activity has none, so the band never renders broken.
- The text card (Back, title, description) sits on top, unchanged in content.
- Restyle the Back control to read as a button (bordered or filled affordance), not a bare text link.

Business rules: none. Presentational.
Tests: confirm the band renders across activities and the fallback path works when no image is set.

Decision still open: confirm the per-activity image source (field on the activity object, or a mapped asset). If images are not yet available, ship the placeholder path now and swap real images later as a copy/asset task, not code.

---

## Commit 4: restore regressions (#5, #7) [BUSINESS-RULES GATE on #7]

Both worked before the A/B/C commits and were dropped in commit A's layout rebuild. This is a restore, not a new build. Diff the current Step 2 against the pre-A state of these two sections and reinstate what was lost.

- **#5 "2. Who's coming?" content:** section renders empty in states where it should show the participant/party-size content. Locate what commit A's `act-card` rebuild removed or detached and restore it. Verify against a state where a party size IS selected, and confirm the participant details card mounts.
- **#7 photoshoot photographer add-on:** the photographer selection boxes (BYO vs add a Salty Cowboys photographer, and any tier options) are missing for photoshoot activities. Restore them.

Business rules (for #7): the photographer add-on affects price and the WhatsApp payload. After restoring:
- Confirm the add-on selection feeds the total the same way it did pre-A.
- Confirm the selection is included in the WhatsApp payload, English-only, in the same format Simone expects.
- Do not alter the payload shape; match the pre-A behaviour exactly.

Tests: restore or re-enable any tests that covered these sections pre-A. Add a render check for #5 in a filled state and for #7 on photoshoot activities. Re-run full suite.

---

## Commit 5: progression-driven accordions (#3) [BUSINESS-RULES GATE, most reversion-sensitive]

Wrap each of the three steps (1. Book a date and time, 2. Who's coming?, 3. Your booking summary) in its own accordion. Trigger is the existing progression state: a section opens as the user reaches it, not on manual click. Reuse the current `detailsComplete` / progression gating; do not introduce a separate click-toggle system.

CRITICAL payload safety:
- Collapsed sections must remain MOUNTED in the DOM (hidden/collapsed visually), not unmounted. If a completed section's fields are removed from the DOM while collapsed, the WhatsApp payload can serialize those fields empty. Either keep collapsed content mounted, or assemble the payload from state rather than the DOM. Confirm which the current build does before wiring the accordions, and preserve payload integrity either way.
- After wiring: fill a complete booking, collapse all sections via normal progression, trigger the WhatsApp send, and confirm the payload is byte-for-byte identical to the pre-accordion payload. This is Simone's flow and is inviolable.

Isolation: this is its own commit, scoped for independent `git revert` without unwinding commits 1 to 4. It is the single commit in this batch most likely to need reverting, so keep it clean and last.

Business rules: full assessment required (payload integrity under collapse). Do not approve without the completed-booking payload comparison above.
Tests: add coverage for payload assembly with sections collapsed. Re-run full suite.

---

## Sequencing summary

1. Spacing (#4, #6) — mechanical
2. BYO label (#2) — additive
3. Header image band (#1) — visual, isolated
4. Restore #5 and #7 — regression fixes, business-rules gate on #7
5. Accordions (#3) — structural, business-rules gate, isolated, last

## Parked (not in this batch)

- Cost-funds copy divergence: live opens "Every booking helps a horse. Salty Cowboys began as a rescue and it still is one." Figma starts at "The money from your ride...". Copy decision, your call.
- COMMIT D emoji line still uncorrected: Figma keeps the hourglass (status), horse (funds heading), and wilted-flower (confirm note). Only the wave (description) should go. Fix that line before D runs.
