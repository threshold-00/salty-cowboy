# Step 2 Figma parity batch

Target: Figma frame `5:1478` (Booking Engine). Source of truth.
Current: live `index.html` at `pursuit-098.github.io/salty-cowboys`.
Scope: bring live Step 2 into parity with Figma. Reference activity: Beach & Rice Field Ride.

Run through the seven-step CLAUDE.md workflow per commit. Approval gate before each commit. No em-dashes in copy, comments, or changelog.

Build order is safest first (pure copy) to most structural last. Commit 5 is isolated for independent reversion.

---

## Commit 1: copy and labels

Pure text. No layout moves. Lowest risk.

- Add Step 1 helper line under "1. Book a date and time": `Select an available date below to choose your time slot.` (diff #3)
- Details card heading: replace the double label ("ABOUT YOU" outer + "YOUR DETAILS" inner) with a single `PARTICIPANT DETAILS`. (diff #7)
- Notes: add label `ANYTHING WE SHOULD KNOW? (OPTIONAL)` above the textarea, plus helper sentence `We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know here.` (diff #10)
- Notes placeholder: end with `...please let us know here.` not `...below.` (diff #11)
- Summary row label: `Participant` not `Riders`. (diff #13)
- Status value: prefix with the hourglass emoji so it reads `[hourglass] Awaiting approval`. (diff #16)

Business rules: none. Display only.
Tests: check smoke assertions for any of these strings (heading, "Riders", placeholder text). Update expected strings where asserted.

---

## Commit 2: card containers

Wrap three controls that currently float on white, to match Figma's bordered cards.

- Duration selector: wrap in bordered card. (diff #4)
- Selected-date readout: wrap the date value in a bordered box/field. (diff #5)
- Number of people selector: wrap in bordered card. (diff #6)

Business rules: none. Styling only.
Tests: no logic change. Visual only. No test update expected unless a test asserts on container structure.

---

## Commit 3: activity header

Self-contained restructure of the top card.

- Header card: replace the dark beach-photo hero + white text with the clean light card and dark title text from Figma. (diff #1)
- Description: move it inside the header card, directly under the title, and remove the wave emoji prefix. (diff #2)

Business rules: none. Presentational.
Tests: confirm no test depends on the hero image node or the emoji. Update if so.

---

## Commit 4: cost-funds section

Additive. Self-contained. Appears after the WhatsApp button per Figma.

- Add the `[horse] What your booking cost funds` heading and its paragraph, matching Figma copy:
  `The money from your ride, lesson or photoshoot goes straight back into the paddock: veterinary care, feed, farriery and the slow, patient work of bringing neglected and retired horses back to health. Some arrive underweight or frightened of people. Here they are given time, food and trust until they are sound enough to be ridden gently, or simply to live out their days in peace. When you book with us, you fund that second chance.` (diff #19)

Business rules: none. Static content.
Tests: none required. Optional presence assertion.

---

## Commit 5: price and summary reorder (STRUCTURAL, isolate for revert)

This is the reorder cluster. It changes page flow order and touches the summary table, price block, WhatsApp button, and confirmation note. Keep it as its own commit so it can be reverted independently without unwinding commits 1 to 4.

Target order (top to bottom), per Figma:
1. Participant details card
2. Section `3. Your booking summary` (summary table)
3. `TOTAL COST` block
4. Notes textarea
5. `Send request via WhatsApp` button
6. Confirmation note ("Your selected date and time will be confirmed...")
7. Cost-funds section (from commit 4)

Changes:
- Price block: label it `TOTAL COST`, show value only. Remove the large standalone `IDR 1,600,000` treatment and the `IDR 1,600,000 x 1 PERSON` breakdown line. (diff #8)
- Price position: move below the booking summary, not directly after the participant card. (diff #9)
- Summary section: move above the notes textarea and WhatsApp button. Currently sits at the bottom. (diff #12)
- Summary table: remove the inline `Total` row. Total lives in the separate `TOTAL COST` block below the table. (diff #14)
- Summary: add the `Edit` link. (diff #15)
- WhatsApp button: move up to sit above the confirmation note. (diff #17)
- Confirmation note: move to sit after the button. (diff #18)

Business rules: assess. No pricing logic should change, only display and order. Confirm the total value binding still reads from the same source after the price block is relabelled and moved. Confirm the WhatsApp payload is unaffected by the DOM reorder (Simone's flow is inviolable).
Tests: likely touches DOM-order-dependent assertions and any smoke step that walks the page sequence to reach the WhatsApp send. Update ordering expectations. Re-run full suite before approval.

Revert note: single commit, no dependency from commits 1 to 4, safe to `git revert` in isolation.

---

## Verify separately (not a commit yet)

- Under-18 guardian consent checkbox (diff #20): Figma shows `I confirm a parent or guardian has given permission for this rider (under 18) to take part.` because the test age is 2. The live screenshot used age 45, so the row would not render either way. Confirm the live build actually implements this checkbox and that it renders and gates when age < 18. If missing, this becomes a business-rules commit of its own (consent gating), not a copy fix.

---

## State-only, ignore

Different test inputs between the two captures, not discrepancies: calendar month/day, name/age, riding-experience selection, typed note text.
