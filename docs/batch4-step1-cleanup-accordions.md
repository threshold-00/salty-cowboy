# Batch 4: Step 1 cleanup + Step 2 accordions

Target: live `index.html`. Commit 1 is Step 1 (activity picker). Commit 2 is Step 2 (booking flow).
Run the seven-step CLAUDE.md workflow per commit. No em-dashes in copy, comments, or changelog. Approval gate before each commit. Hold push until both are verified.

---

## Commit 1: Step 1 cleanup (two deletions)

Both changes are on the Step 1 activity-picker page. Deletions only.

- **Remove the "Where the money goes" card.** This is the black cost-funds card at the top of Step 1. Remove it from Step 1 only. The equivalent block on Step 2 ("What your booking cost funds") stays untouched. Confirm before removing that the two are separate instances and that deleting the Step 1 one does not affect the Step 2 one.
- **Remove the global "Next" button.** Each activity card's "Book →" button is the navigation path to Step 2, which makes the bottom "Next" redundant. Before deleting: verify in the source that "Book →" fully advances the flow and that nothing depends on "Next" (no selection guard or state transition unique to it). If Book is the complete replacement, remove Next. If Next carries logic Book does not, stop and report rather than deleting.

Also (#2 phrasing "make headers less like a card"): with the black cost-funds card gone, confirm the "Choose an activity" heading and the activity list no longer read as sitting inside or against a card. If any residual card container remains around the section header, flatten it so the header sits on the page background. Presentation only.

Business rules: none. Confirm the WhatsApp flow is not reachable from Step 1, so these deletions cannot touch the payload.
Tests: remove or update any assertions referencing the Step 1 cost-funds card or the Next button. Add a check that "Book →" navigates to Step 2. Re-run full suite.

---

## Commit 2: Step 2 accordions (structural, payload-gated)

Already verified last session: the WhatsApp payload is assembled entirely from React state, not the DOM, so collapsing sections is payload-safe. Use CSS-hide, not unmount.

Wrap each of the three Step 2 sections (1. Book a date and time, 2. Who's coming?, 3. Your booking summary) in its own accordion, with this behaviour:

- **Progression opens them.** As the user reaches a section by progressing through the flow, it opens. Reuse the existing `detailsComplete` / progression state, do not invent a parallel system.
- **Manual toggle to edit.** The user can click a collapsed section header to reopen it and edit, and click to collapse again. So the accordion is progression-driven to open AND manually toggleable, not one or the other.
- **Persistent collapsed summary.** When a section is collapsed, its header shows a one-line summary of what was entered, and that summary persists and updates after edits. These already appear in the current build (e.g. "1hr · May 4, 2026 · 5:00pm" under section 1, "1 person" under section 2); preserve and formalize them as the collapsed-state summary for each of the three sections. Section 3 (summary) may not need a separate collapsed line since it is itself the summary; use judgement and match the pattern of the other two.

Payload proof (the gate, required before commit):
- Capture a baseline WhatsApp payload from a fully-filled booking on the CURRENT pre-accordion build, exercising as many fields as possible (date, time, duration, party size, rider details, weight, experience, notes, and for a photoshoot the photographer add-on).
- After building the accordions, fill the same booking, collapse all sections via both progression and manual toggle, trigger the WhatsApp send, and confirm the payload is byte-for-byte identical to the baseline.
- Show the baseline-vs-after comparison. Approval depends on that comparison, not on tests passing or the accordions looking right.

Business rules: full assessment. Payload integrity under collapse (both progression-collapsed and manually-collapsed states). This is Simone's flow and is inviolable.
Tests: add an assertion that the assembled payload is complete with all sections collapsed. Re-run full suite.

Isolation: own commit, scoped for independent `git revert`.

---

## Sequencing

1. Step 1 cleanup (deletions, low risk)
2. Step 2 accordions (structural, payload-gated, last)

## Parked (not in this batch)

- Cost-funds copy divergence on Step 2: live opens "Every booking helps a horse..."; Figma starts at "The money from your ride...". Copy decision, still open.
- COMMIT D emoji line: Figma keeps the hourglass, horse, and wilted-flower; only the wave goes. Fix before D runs.
- Header card 48px overlap on Step 2: confirm it reads the way you want before it pushes live.
