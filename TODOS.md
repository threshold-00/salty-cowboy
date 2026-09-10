# TODOS

Open defects found during review, out of scope for the current change. Each was verified against the source, not assumed.

## 1. `riders` survives a category-tab click

`index.html:3147-3155` resets `activity`, `duration`, `numPeople`, `photographerAddon`, `bookingForOther`, `grooming`, `selectedDates` and `selectedTime`, but not `riders`. `setRiders([])` exists at 2820 (`resetAll`), 3170 and 3216, so every other path that changes activity does clear it.

Not currently exploitable: `detailsComplete` requires `numPeople`, which the tab handler does reset, so stale riders cannot reach a send. But `riders` is the only payload field without a reset on every activity-change path, and the booking log reads weight counts off it.

**Fix:** add `setRiders([]);` to the category-tab handler.

## 2. Hero logo returns to the activity screen with all state intact

`index.html:3112` is `onClick: () => setScreen("activity")` and nothing else. Compare `resetAll` at 2815, which clears everything and is wired to the "Book another" button at 3857.

A second booking started from the logo carries the previous selections and, once logging ships, the same attempt identity. It looks like a fresh start to the user and is not one.

**Fix:** decide whether the logo is "go home" (should call `resetAll`) or "back to browsing" (current behaviour is correct and the log needs to know). Currently it is neither on purpose.

## 3. `tests/assert.js` cannot scope an assertion to a function body

`assert.js:5-14`: both `has()` and `missing()` count substrings across the whole file. There is no way to assert "X does not appear inside function Y".

This matters for the booking log's PII guarantee. The requirement is that the object handed to `sendBeacon` never contains rider names, ages or notes text. The only assertion this suite can express is a positive `has()` pinning `bookingLogRow`'s exact source block, which catches an edit to that function but proves nothing about the invariant. A field like `w1: riders.map(...)` would satisfy any whitelist review and any substring check.

**Fix:** either accept the limit and comment it honestly at the assertion, or add a small function-body extractor to `assert.js` so negative assertions can be scoped.
