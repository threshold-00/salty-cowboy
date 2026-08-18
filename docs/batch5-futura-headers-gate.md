# Batch 5: Futura, Step 1 headers, Step 2 boxing, summary/price gate

Target: live `index.html`. Mixed Step 1 and Step 2.
Run the seven-step CLAUDE.md workflow per commit. No em-dashes in copy, comments, or changelog. Approval gate before EACH commit. Commit at each gate so changes do not interleave in the working tree. Hold push until the whole batch is verified.

Build order safest first. Commit 4 (summary/price gate) touches booking logic and the WhatsApp payload; it is isolated and gated.

---

## Commit 1: sitewide Futura

- Set all text across the site to Futura, including the time-slot card, which currently uses Outfit (500 for the time, 400 for the duration sublabel). Convert those to Futura too. This is a deliberate divergence from the Figma, which specifies Outfit there; it is what the client wants.
- Keep the existing weight per role (the time value stays heavier than its sublabel); only the family changes.
- Grep for any remaining non-Futura font-family declarations and confirm none remain except intentional system fallbacks in the token stack.

Business rules: none. Presentation only.
Tests: update any assertion checking for Outfit on the time-slot card. Re-run full suite.

---

## Commit 2: Step 1 activity headers + full-width Book (styling)

Step 1 activity-picker page.

- **Activity section headers (Rides, Photoshoots, Lessons) should not read as clickable cards.** Remove the card container/affordance. Make the image full width. Keep the text margins the same width as the cards beneath, so the heading text left/right edges line up with the content below it. Net effect: full-bleed image, text aligned to the standard content column, no card chrome around the header.
- **Book button on each activity card goes full width.**

Business rules: none. Presentation only. Confirm "Book →" still navigates to Step 2 after the width change (layout only, handler untouched).
Tests: update layout assertions if any. Re-run full suite.

---

## Commit 3: Step 2 boxing + destructure BYO / duration / back (styling)

Step 2 booking flow. All presentation, no logic.

- **Bounding boxes on the three sections.** Put 1. Book a date and time, 2. Who's coming?, and 3. Your booking summary each in its own bounding box so the accordion separation is visually obvious. The boxes are the accordion containers; make their boundaries clear (border/outline, consistent radius and padding per the card system).
- **BYO line becomes a hairline, not a pill.** This reverses the filled-pill treatment from the previous batch. Render "BYO Photographer or add a Salty Cowboys photographer" as a hairline (thin rule with the text, or a light divider treatment), not a chip. Photoshoot activities only, as before.
- **Duration is not in a card.** Remove the card container around the duration control. The label and pills sit directly on the section background. Keep the label-to-pill spacing correct (the 14px gap from the earlier fix), just without the card chrome.
- **Back button out of its pill, above and outside the header card, on white.** Move Back above the full-width image band entirely, sitting on the white background above the band, not on the image and not inside the header card. Remove the pill/button chrome so it reads as a plain back link on white.

Note: this reverses two recently-approved visuals (the BYO pill and the duration card padding). Intentional per client direction.

Business rules: none.
Tests: update assertions referencing the BYO pill, the duration card, or the back-button pill. Re-run full suite.

---

## Commit 4: summary + price completeness gate (LOGIC, payload-gated, isolated)

Hide the booking summary outputs and the final price until the booking is complete. "Complete" is defined as ALL of:

- Duration selected
- Date and time selected
- Participant (party size) selected
- Rider details complete for ALL riders in the party: each rider has name, weight range, and riding experience, plus the under-18 guardian consent checkbox where the rider's age is under 18

Until all of the above are satisfied:
- The booking summary rows render blank (or the summary is hidden), matching the client's "outputs should be blank until filled in".
- The final price (TOTAL COST) is not displayed.

Once all are satisfied, summary and price appear.

CRITICAL payload safety:
- The price shown must equal the price sent in the WhatsApp payload. Gating the DISPLAY must not change how the payload is assembled or what value it carries. The payload is built from React state (verified), so hiding display elements must not alter state.
- Confirm the "complete" condition used to reveal the summary is consistent with (or stricter than) whatever condition currently gates the WhatsApp send button, so the button cannot become active while the summary is still hidden, and the sent price cannot differ from a shown price.
- Prove it: fill a booking to exactly complete, confirm summary + price appear, send, and confirm the payload price matches the displayed price and all fields serialize. Capture the payload and compare against the baseline hash for an equivalent booking. Show the comparison.

Decision embedded (confirm before building): "rider details complete" is defined here as all riders, name + weight + experience + consent-where-applicable. If the client wants a looser bar (lead rider only, or name only), adjust this condition before implementing.

Business rules: full assessment. Display gate must not touch payload value or shape. This is Simone's flow and is inviolable.
Tests: add assertions that summary and price are hidden until the complete condition is met, and present after. Add a payload-completeness check for the gated-then-completed flow. Re-run full suite.

Isolation: own commit, independent `git revert`.

---

## Sequencing

1. Futura (sitewide, mechanical)
2. Step 1 headers + full-width Book (styling)
3. Step 2 boxing + BYO hairline + duration destructure + back button (styling)
4. Summary/price gate (logic, payload-gated, last)

## Parked (not in this batch)

- COMMIT D emoji line: keep hourglass, horse, wilted-flower; only the wave goes. Fix before D runs.
- Step 2 cost-funds copy divergence from Figma. Copy decision, open.
- 48px header overlap: confirm it reads right before push.
- Pre-push: full completed-booking walkthrough, since the deep local stack lands on Simone's live site all at once.
