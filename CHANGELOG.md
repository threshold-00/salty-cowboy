# Changelog

All notable changes to the Salty Cowboys booking engine, most recent first.

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
