const fs = require('fs');
const src = fs.readFileSync('../index.html', 'utf8');

const results = [];
const has = (name, needle, expectedCount = 1) => {
  const actual = src.split(needle).length - 1;
  results.push({ name, pass: actual === expectedCount, needle, actual, expectedCount });
};
const missing = (name, needle) => {
  const actual = src.split(needle).length - 1;
  results.push({ name, pass: actual === 0, needle: '(missing) ' + needle, actual, expectedCount: 0 });
};

// ─── Top-level category order (Rides, Photoshoots, Lessons) ──────────────
has('ACTIVITIES starts with Rides',   'const ACTIVITIES = [{\n  category: "Rides",');
has('Photoshoots follows Rides',      'category: "Rides",\n  items: [{\n    id: "beach"');
has('Lessons is last category',       'category: "Lessons",\n  items: [{\n    id: "joinup"');

// ─── ACTIVITIES data structure ───────────────────────────────────────────
has('photo_beach durations + needsWeight', 'id: "photo_beach",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 3,\n    perHorse: true,\n    photoshoot: true,\n    needsWeight: true');
has('photo_stable 1-3hr',          'id: "photo_stable",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_ricefield 1-2hr (3hr removed 29 Aug 2026 RICEFIELD-8AM, no longer clones stable\'s duration set)', 'id: "photo_ricefield",\n    durations: ["1hr", "1.5hr", "2hr"],\n    maxPeople: 5');
has('photo_paddock 1-3hr',         'id: "photo_paddock",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_cottages session, 6',   'id: "photo_cottages",\n    durations: ["3hr"],\n    maxPeople: 6');
has('beach ride 1/1.5hr only (2hr removed 1 Sep 2026 RIDE-DURATION-SPLIT, since Insta Ride became the sole 2hr option)', 'id: "beach",\n    durations: ["1hr", "1.5hr"]');
has('beach ride carries a real image path (first activity to get one, per Ro), other activities still have no image field and fall back to the placeholder', 'experienceNeeded: "Beginner",\n    image: "images/beach-ride.jpg"');
has('insta ride carries a real image path', 'experienceNeeded: "Beginner",\n    image: "images/insta-ride.avif"');
has('photo_beach carries a real image path', 'needsWeight: true,\n    image: "images/photo-beach.avif"');
has('photo_stable carries a real image path', 'photoshoot: true,\n    image: "images/photo-stable.avif"');
has('photo_ricefield now has a real card image (reuses gallery-ricefield-1.jpg, the same sunset photo Ro picked, not a duplicate copy) plus its gallery array of 4 real photos', 'id: "photo_ricefield",\n    durations: ["1hr", "1.5hr", "2hr"],\n    maxPeople: 5,\n    photoshoot: true,\n    // Card image reuses gallery-ricefield-1.jpg rather than a separate copy -\n    // it\'s the exact same sunset ricefield photo Ro pointed to as the card\n    // image, already processed and sitting in this folder for the gallery.\n    image: "images/gallery-ricefield-1.jpg",\n    gallery: ["images/gallery-ricefield-1.jpg", "images/gallery-ricefield-2.jpg", "images/gallery-ricefield-3.jpg", "images/gallery-ricefield-4.jpg"]\n  }');
has('all 5 photoshoot activities carry a 4-item gallery array of real photos, all provided by Ro (real-photo-gallery commit)', 'gallery: ["images/gallery-beach-1.jpg", "images/gallery-beach-2.jpg", "images/gallery-beach-3.jpg", "images/gallery-beach-4.jpg"]');
has('gallery: ["images/gallery-stable', 'gallery: ["images/gallery-stable-1.jpg", "images/gallery-stable-2.jpg", "images/gallery-stable-3.jpg", "images/gallery-stable-4.jpg"]');
has('gallery: ["images/gallery-paddock', 'gallery: ["images/gallery-paddock-1.jpg", "images/gallery-paddock-2.jpg", "images/gallery-paddock-3.jpg", "images/gallery-paddock-4.jpg"]');
has('gallery: ["images/gallery-cottages', 'gallery: ["images/gallery-cottages-1.jpg", "images/gallery-cottages-2.jpg", "images/gallery-cottages-3.jpg", "images/gallery-cottages-4.jpg"]');
has('photo_paddock carries a real card image path (swapped to a bridal-style photo, Ro\'s explicit pick, replacing the original PADDOCK-IMG-commit photo)', 'photoshoot: true,\n    // Card image swapped to a new bridal-style photo (Ro\'s explicit pick).\n    // imagePosition and hideCardImage from the original PADDOCK-IMG commit\n    // are gone: both only ever mattered while the Step 2 header band could\n    // still show a photo for this activity, but the PHOTO-GALLERY commit\n    // made that band never render for any isPhotoshoot activity, so `image`\n    // is now purely the Step 1 card photo, same as every other photoshoot.\n    image: "images/photo-paddock-card.jpg"');
has('photo_cottages carries a real image path', 'photoshoot: true,\n    image: "images/photo-cottages.avif"');
has('joinup carries a real image path', 'experienceNeeded: "Beginner",\n    image: "images/join-up.avif"');
has('whisper (Horse Whisperer Course) carries a real image path, converted from the source PNG to JPEG for size', 'experienceNeeded: "Beginner",\n    image: "images/horse-whisperer.jpg"');
has('masterclass (Horse grooming, the id predates the display-name rename) carries a real image path', 'experienceNeeded: "Beginner",\n    image: "images/grooming.avif"');
has('groupclinic carries a real image path', 'experienceNeeded: "Beginner",\n    image: "images/group-clinic.avif"');
has('dressage carries a real image path', 'experienceNeeded: "Beginner",\n    image: "images/dressage.avif"');
has('insta ride is now 2hr only (1 Sep 2026 RIDE-DURATION-SPLIT, dropped 1hr/1.5hr so it no longer overlaps with beach ride\'s duration set at all)', 'id: "insta",\n    durations: ["2hr"]');
has('joinup perPerson',            'id: "joinup",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2,\n    perPerson: true');
has('masterclass now offers 1hr/1.5hr (1.5hr calculated as 1.5x 1hr)', 'id: "masterclass",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2');
has('groupclinic 1.5hr, 6 people', 'id: "groupclinic",\n    durations: ["1.5hr"],\n    maxPeople: 6');
has('groupclinic gains minPeople: 3 (29 Aug 2026 GROUPCLINIC)', 'maxPeople: 6,\n    minPeople: 3,\n    experienceNeeded: "Beginner",\n    image: "images/group-clinic.avif"');

// ─── peopleOptions gains a minPeople floor (29 Aug 2026 GROUPCLINIC) ──────
// peopleOptions(groupclinic) === ["3","4","5","6"]: max 6 - min 3 + 1 = 4
// entries starting at 3, so "1" and "2" are never offered as pills.
has('peopleOptions reads both maxPeople and minPeople', 'function peopleOptions(actObj) {\n  const max = actObj && actObj.maxPeople ? actObj.maxPeople : 5;\n  const min = actObj && actObj.minPeople ? actObj.minPeople : 1;\n  return Array.from({ length: max - min + 1 }, (_, i) => String(i + min));\n}');
has('initRiders clamps the starting count up to the activity\'s minPeople, defensively', 'const min = actObj && actObj.minPeople ? actObj.minPeople : 1;\n    const count = Math.max(parseInt(n, 10), min);');
has('whisper courseDays now 3 (29 Aug 2026 WHISPER-3DAY, down from 4)', 'id: "whisper",\n    durations: ["3hr"],\n    maxPeople: 2,\n    minAge: 8,\n    course: true,\n    courseDays: 3');
missing('icon field removed from ACTIVITIES data as dead code (never rendered anywhere, Commit D emoji cleanup)', '    icon: "');
missing('lunge activity removed',  'id: "lunge"');

// ─── SESSION_SLOTS unchanged (Paddock/Stable/Cottages/Rice Field) ────────
has('SESSION_SLOTS declared',      'const SESSION_SLOTS = {');
has('SESSION_SLOTS 1hr',           '"1hr":   ["8:30am", "10:30am", "2:30pm", "4:30pm"]');
has('SESSION_SLOTS 1.5hr',         '"1.5hr": ["8:30am", "10:00am", "2:30pm", "4:00pm"]');
has('SESSION_SLOTS 2hr',           '"2hr":   ["8:30am", "9:30am",  "2:30pm", "3:30pm"]');
has('SESSION_SLOTS 3hr',           '"3hr":   ["8:30am", "2:30pm"]');

// ─── Rides: fixed 8am + one afternoon start per duration (29 Aug 2026 ─────
// BEACH-8AM, corrected same day to give Insta Ride identical availability
// to Beach & Rice Field Ride rather than a separate BEACH_SLOTS table).
// Needles include the const declaration since RICEFIELD_SLOTS (added 29 Aug
// 2026 RICEFIELD-8AM) uses the identical 8am/afternoon values textually.
has('RIDE_SLOTS declared with 8am + one afternoon slot per duration', 'const RIDE_SLOTS = {\n  "1hr":   ["8:00am", "5:00pm"],\n  "1.5hr": ["8:00am", "4:30pm"],\n  "2hr":   ["8:00am", "4:00pm"]\n};');
missing('old RIDE_SLOTS afternoon-only pattern is gone', 'const RIDE_SLOTS = {\n  "1hr": ["5:00pm"]');
missing('separate BEACH_SLOTS table is gone (merged into RIDE_SLOTS so beach and insta share identical availability)', 'const BEACH_SLOTS = {');
missing('no beach-specific slotsFor branch (beach now falls through the generic riding branch, same as insta)', 'actObj.id === "beach") list = BEACH_SLOTS');
has('beach and insta both resolve through the single generic riding branch', 'else if (actObj.riding) list = RIDE_SLOTS[duration] || [];');

// ─── Lessons: Join Up, Horse grooming, Group Clinic each get their own flat
// slot table (29 Aug 2026 LESSON-SLOTS-SPLIT), replacing the shared
// LESSON_SLOTS[duration] table. Slots are duration-independent now.
missing('shared LESSON_SLOTS table is gone', 'const LESSON_SLOTS = {');
has('JOINUP_SLOTS = 8:30/9:30am',    'const JOINUP_SLOTS = ["8:30am", "9:30am"];');
has('GROOMING_SLOTS = 8:30/9:30/10:30am', 'const GROOMING_SLOTS = ["8:30am", "9:30am", "10:30am"]; // masterclass = "Horse grooming"');
has('GROUPCLINIC_SLOTS = 8:30am only', 'const GROUPCLINIC_SLOTS = ["8:30am"];');
has('DRESSAGE_SLOTS narrowed to 8:30/9:30am', 'const DRESSAGE_SLOTS = ["8:30am", "9:30am"];');
missing('old DRESSAGE_SLOTS 4-slot pattern is gone', 'const DRESSAGE_SLOTS = ["9:00am", "10:00am", "4:00pm", "5:00pm"];');
has('slotsFor routes joinup to JOINUP_SLOTS',       'else if (actObj.id === "joinup") list = JOINUP_SLOTS;');
has('slotsFor routes masterclass to GROOMING_SLOTS', 'else if (actObj.id === "masterclass") list = GROOMING_SLOTS;');
has('slotsFor routes groupclinic to GROUPCLINIC_SLOTS', 'else if (actObj.id === "groupclinic") list = GROUPCLINIC_SLOTS;');
has('slotsFor final fallback is an empty list, not a shared lesson table', 'else list = [];');
// All four of joinup/masterclass/groupclinic/dressage's new slots sit before
// noon, so the Saturday-afternoon filter (slotHour < 12) is a structural
// no-op for them: Saturday-safe now equals weekday for these activities.
has('Saturday filter still present (now a no-op for the new morning-only lesson slots)', 'if (dates && dates.length && dates.some(isSaturday)) {\n    list = list.filter(s => slotHour(s) < 12);\n  }');

// ─── Horse Whisperer: 4-day Mon/Tue/Thu/Fri ────────────────────────────────
has('WHISPER_SLOTS has 8:30 and 9:30am', 'const WHISPER_SLOTS = ["8:30am", "9:30am"];');
has('isWhisper blocks Wed + Fri + Sat (Friday added 29 Aug 2026 WHISPER-3DAY, runs Mon/Tue/Thu only)', 'if (isWhisper && (dow === 3 || dow === 5 || dow === 6)) return false;');

// ─── slotsFor routes correctly ───────────────────────────────────────────
has('slotsFor paddock/stable/cottages routing (ricefield split out 29 Aug 2026 RICEFIELD-8AM)', 'photo_paddock" || actObj.id === "photo_stable" || actObj.id === "photo_cottages") list = SESSION_SLOTS');
missing('ricefield no longer routes through SESSION_SLOTS', 'actObj.id === "photo_ricefield") list = SESSION_SLOTS');

// ─── Rice Field Photoshoot gets its own 8am start (29 Aug 2026 RICEFIELD-8AM),
// same pattern as the rides, and loses its 3hr option ──────────────────────
has('RICEFIELD_SLOTS declared, same 8am + one-afternoon-slot pattern as RIDE_SLOTS', 'const RICEFIELD_SLOTS = {\n  "1hr":   ["8:00am", "5:00pm"],\n  "1.5hr": ["8:00am", "4:30pm"],\n  "2hr":   ["8:00am", "4:00pm"]\n};');
has('slotsFor routes photo_ricefield to RICEFIELD_SLOTS before the SESSION_SLOTS branch', 'else if (actObj.id === "photo_ricefield") list = RICEFIELD_SLOTS[duration] || [];\n  else if (actObj.id === "photo_paddock"');
missing('ricefield price array no longer has a 3hr entry (en); Stable/Paddock keep their own 3,750,000 3hr price untouched', 'photo_ricefield: [{ l: "1 hr", v: "IDR 1,750,000" }, { l: "1.5 hr", v: "IDR 2,250,000" }, { l: "2 hr", v: "IDR 2,750,000" }, { l: "3 hr"');
has('photo_ricefield price array capped at 2hr, no 3hr entry (en)', 'photo_ricefield: [{ l: "1 hr", v: "IDR 1,750,000" }, { l: "1.5 hr", v: "IDR 2,250,000" }, { l: "2 hr", v: "IDR 2,750,000" }],');
has('photo_ricefield price array capped at 2hr, no 3hr entry (id)', 'photo_ricefield: [{ l: "1 jam", v: "IDR 1,750,000" }, { l: "1,5 jam", v: "IDR 2,250,000" }, { l: "2 jam", v: "IDR 2,750,000" }],');
has('photo_ricefield price array capped at 2hr, no 3hr entry (ru)', 'photo_ricefield: [{ l: "1 ч", v: "IDR 1,750,000" }, { l: "1,5 ч", v: "IDR 2,250,000" }, { l: "2 ч", v: "IDR 2,750,000" }],');

// ─── Weight: 75kg universal max, incl. Beach Photoshoot (was 77kg) ────────
missing('no more 78kg anywhere',   '78 kg');
missing('no more 78kg (no space)', '78kg');
missing('no more 77kg anywhere (WEIGHT-THRESHOLD commit, 77kg -> 75kg)',   '77 kg');
missing('no more 77kg (no space)', '77kg');
missing('no more 77 кг anywhere (ru)', '77 кг');
has('w3 band is 70-75kg (en + id share Latin unit)', 'w3: "70–75 kg"', 2);
has('w4 band is over 75kg',        'w4: "Over 75 kg"');

// ─── REJECT-COPY commit: weight-rejection title/body reworded ────────────
has('en w4Title reworded ("So sorry" -> "Sorry")', 'w4Title: "Sorry, we can\'t accommodate this weight",');
has('en w4Body reworded, adds no-refund sentence', 'w4Body: "It\'s nothing personal. We\'re committed to protecting our horses\' backs from strain, so we\'re unable to safely match a horse for this weight. You\'re welcome to try our off-saddle activities under \'Lessons\' instead. Unfortunately we do not refund bookings for people over 75kg.",');
missing('old "So sorry" phrasing gone', 'So sorry, we can\'t accommodate this weight');
missing('old "You\'d be very welcome" phrasing gone', 'You\'d be very welcome');
has('id/ru w4Title/w4Body untouched by the English-only REJECT-COPY find/replace', 'w4Title: "Mohon maaf, kami tidak dapat menerima berat ini",');
has('showWeight combines isRiding + needsWeight', 'const showWeight = isRiding || actObj?.needsWeight === true;');
has('weight render gated on showWeight', 'showWeight && /*#__PURE__*/React.createElement("div", {\n      className: "rider-field"');
has('WhatsApp weight lines use showWeight', 'showWeight,\n  notes,');

// ─── Pricing multipliers ─────────────────────────────────────────────────
has('isPerHorse flag',             'const isPerHorse = !!(actObj && actObj.perHorse);');
has('isPerPerson flag',            'const isPerPerson = !!(actObj && actObj.perPerson);');
has('horseCount cap at 2',         'Math.min(peopleCount || 1, 2)');
missing('priceBasis computation removed as dead code (Figma parity Commit 5, diff #8: value only, no breakdown line)', 'let priceBasis;');
missing('price-reveal-basis JSX span removed along with priceBasis', 'className: "price-reveal-basis"');

// ─── Photographer add-on auto-matches the shoot's own duration (29 Aug 2026) ─
// Replaces the old independent 4-tier picker: no more PHOTOGRAPHER_TIERS
// lookup table, no more per-tier selection. Price/photos are now a pure
// formula off whichever duration the customer picked for the shoot itself.
missing('old PHOTOGRAPHER_TIERS lookup table is gone', 'const PHOTOGRAPHER_TIERS = {');
has('photographerAddonPrice formula declared', 'function photographerAddonPrice(duration) {');
has('formula flat rate: IDR 2,000,000 and 20 photos per hour (1 Sep 2026 PHOTOG-PRICE-FLAT, replaces the old 2,500,000-anchored block formula), giving 1hr 2,000,000/20, 1.5hr 3,000,000/30, 2hr 4,000,000/40, 3hr 6,000,000/60 (Ro\'s three given figures plus the 3hr extrapolation she approved)', 'return { price: hours * 2000000, photos: hours * 20 };');
has('durationHrLabel helper declared',   'function durationHrLabel(duration) {');
has('photographer addon boolean state', 'const [photographerAddon, setPhotographerAddon] = useState(false);');
has('addon price computed off current duration', 'const addonForDuration = isPhotoshoot ? photographerAddonPrice(duration) : null;');
has('photographer price added to total', 'const totalPrice = unitPrice * mult + photographerPrice;');
has('addon is a single toggle, not tier selection', 'onClick: () => setPhotographerAddon(v => !v)');
has('addon checkbox row only renders once a duration is available', 't.addonTitle), addonForDuration && /*#__PURE__*/React.createElement("div", {\n    className: "perm-row addon-row",');
has('addon checkbox label shows computed price + photo count', '"IDR " + addonForDuration.price.toLocaleString("en-US") + " (" + addonForDuration.photos + " " + t.photosWord + ")"');
missing('old mutually-exclusive tier-picker toggle is gone', 'setPhotographerTier(pv => pv === tier.key ? null : tier.key)');

// ─── horse/horses translation keys ───────────────────────────────────────
has('en horse',                    'horse: "horse"');
has('en horses',                   'horses: "horses"');
has('id horse',                    'horse: "kuda"');
has('id horses',                   'horses: "kuda"');
has('ru horse',                    'horse: "лошадь"');
has('ru horses',                   'horses: "лошади"');

// ─── Prices: new values present, old values gone ─────────────────────────
has('cottages 4.5M in en',         'photo_cottages: [{ l: "session", v: "IDR 4,500,000" }]');
has('cottages 4.5M in id',         'photo_cottages: [{ l: "sesi", v: "IDR 4,500,000" }]');
has('cottages 4.5M in ru',         'photo_cottages: [{ l: "сессия", v: "IDR 4,500,000" }]');
// Insta Ride became 2hr-only on 1 Sep 2026 (RIDE-DURATION-SPLIT); its single
// remaining price (2,700,000) is unchanged from before the split, and still
// happens to equal beach ride's old 2hr price (now removed from beach ride
// entirely, so the two no longer share any duration to compare against).
has('insta ride prices: 2hr only, 2,700,000 (en)', 'insta: [{ l: "2 hr", v: "IDR 2,700,000" }]');
has('insta ride prices: 2hr only, 2,700,000 (id)', 'insta: [{ l: "2 jam", v: "IDR 2,700,000" }]');
has('insta ride prices: 2hr only, 2,700,000 (ru)', 'insta: [{ l: "2 ч", v: "IDR 2,700,000" }]');
// Beach ride lost its 2hr option on 1 Sep 2026 (RIDE-DURATION-SPLIT, since
// Insta Ride became the sole 2hr ride); 1hr/1.5hr prices are unchanged.
has('beach ride prices: 1hr 1,600,000 / 1.5hr 2,200,000, no 2hr (en)', 'beach: [{ l: "1 hr", v: "IDR 1,600,000" }, { l: "1.5 hr", v: "IDR 2,200,000" }]');
has('beach ride prices: 1hr 1,600,000 / 1.5hr 2,200,000, no 2hr (id)', 'beach: [{ l: "1 jam", v: "IDR 1,600,000" }, { l: "1,5 jam", v: "IDR 2,200,000" }]');
has('beach ride prices: 1hr 1,600,000 / 1.5hr 2,200,000, no 2hr (ru)', 'beach: [{ l: "1 ч", v: "IDR 1,600,000" }, { l: "1,5 ч", v: "IDR 2,200,000" }]');
has('masterclass 1.5hr = 1.5x 1hr en', 'masterclass: [{ l: "1 hr", v: "IDR 1,250,000" }, { l: "1.5 hr", v: "IDR 1,875,000" }]');
has('masterclass 1.5hr = 1.5x 1hr id', 'masterclass: [{ l: "1 jam", v: "IDR 1,250,000" }, { l: "1,5 jam", v: "IDR 1,875,000" }]');
has('masterclass 1.5hr = 1.5x 1hr ru', 'masterclass: [{ l: "1 ч", v: "IDR 1,250,000" }, { l: "1,5 ч", v: "IDR 1,875,000" }]');

// ─── RIDE-DURATION-SPLIT (1 Sep 2026): insta ride goes 2hr-only, emphasizes ─
// its extra photo opportunities; beach ride loses its 2hr option so the two
// rides no longer share any duration at all (previously identical slots).
has('insta description uses the client-approved copy (2 Sep 2026 CLIENT-COPY-FEEDBACK), emphasizing longest ride + more photo stops, replacing the previous AI-sounding draft (en)', 'insta: "Our longest ride at 2 hours, with more stops for photos through the village, beach and rice fields. Grooms take you to the best spots: golden hour is ideal.",');
has('insta description client-approved copy (id)', 'insta: "Ride terpanjang kami, 2 jam, dengan lebih banyak titik henti untuk foto melewati desa, pantai, dan sawah. Pemandu membawa Anda ke spot-spot terbaik: golden hour adalah waktu yang paling pas.",');
has('insta description client-approved copy (ru)', 'insta: "Наша самая длинная прогулка, 2 часа, с большим количеством остановок для фото через деревню, пляж и рисовые поля. Грумы приводят вас в лучшие места, особенно хорошо в золотой час.",');
has('groupclinic 6M flat en',      'groupclinic: [{ l: "1.5 hr", v: "IDR 6,000,000" }]');
has('groupclinic 6M flat id',      'groupclinic: [{ l: "1,5 jam", v: "IDR 6,000,000" }]');
has('groupclinic 6M flat ru',      'groupclinic: [{ l: "1,5 ч", v: "IDR 6,000,000" }]');
missing('no lunge prices anywhere',   'lunge:');
// paddock + stable + ricefield 3hr, × 3 langs = 9 hits
// paddock + stable 3hr × 3 langs = 6 hits (ricefield's own 3hr/3,750,000 was
// removed 29 Aug 2026 RICEFIELD-8AM, so this count dropped from 9 to 6)
has('3,750,000 = paddock/stable 3hr × 3 langs (ricefield no longer contributes)', '3,750,000', 6);

// ─── Group / description copy updated ────────────────────────────────────
has('en photo_beach per horse + weight cap', 'plus 1 person standing beside a horse. Max 75kg per mounted rider. Price is per horse.');
has('en cottages max 6',           'Max 6 people per cottage. Choice of cottage upon availability.');
has('en joinup per person',        'joinup: "Max 2 people. Price is per person."');
has('en groupclinic group desc',   'groupclinic: "Up to 6 people. Flat price per session, not per person."');
has('en cottages inside',          'Photos are taken inside the cottage');
has('en stable no groomed horse',  'photo_stable: "Rustic Western-style stable backdrop for fashion, pre-wedding or personal shoots. Team assistance included."');
missing('no groomed horse text on stable/paddock', 'One groomed horse plus team assistance');
has('en paddock no rice field mention', 'photo_paddock: "Open paddock backdrop with grazing horses. Location only, photographer not included. Entering the paddocks and touching the horses is not permitted."');
has("en ricefield uses given copy", 'photo_ricefield: "A private session with your horse framed by Bali\'s open rice terraces. Same format as our stable shoot, set out in the green instead of the yards. Golden hour recommended for the best light."');
has('id photo_beach per horse',    'Harga per kuda.');
has('id cottages max 6',           'Maks 6 orang per cottage');
has('ru photo_beach per horse',    'Цена за лошадь.');
has('ru cottages max 6',           'Максимум 6 человек на коттедж');

// ─── Masterclass renamed to Horse grooming, Lunge fully removed ──────────
has('en masterclass renamed',      'masterclass: "Horse grooming (wet or dry)"');
has('id masterclass renamed',      'masterclass: "Grooming kuda (basah atau kering)"');
has('ru masterclass renamed',      'masterclass: "Груминг лошади (влажный или сухой)"');
missing('no "Masterclass Horse Care" label left', 'Masterclass Horse Care');

// ─── Group Clinic activity present in all 3 languages ─────────────────────
// Titles gained a "(Leadership/horsemanship class)" parenthetical, kept
// verbatim in English across all three languages, 29 Aug 2026 GROUPCLINIC.
has('en groupclinic label + parenthetical', 'groupclinic: "Group Clinic (Leadership/horsemanship class)"');
has('id groupclinic label + parenthetical', 'groupclinic: "Klinik Kelompok (Leadership/horsemanship class)"');
has('ru groupclinic label + parenthetical', 'groupclinic: "Групповая клиника (Leadership/horsemanship class)"');
has('en groupclinic copy (C31)',   'A hands-on session in leadership, communication and trust, taught through the horse.');

// ─── Rice Field Photoshoot activity present in all 3 languages ────────────
has('en ricefield label',          'photo_ricefield: "Rice Field Photoshoot"');
has('id ricefield label',          'photo_ricefield: "Sesi Foto di Sawah"');
has('ru ricefield label',          'photo_ricefield: "Фотосессия в рисовых полях"');

// ─── Horse Whisperer Course: 3 days (29 Aug 2026 WHISPER-3DAY, down from 4,
// Friday dropped), given copy, all rider levels ────────────────────────────
has('en whisper uses client-approved copy (2 Sep 2026 CLIENT-COPY-FEEDBACK), replacing the "deep education in how horses think" framing', 'A 3-day, 10-hour course spread over Monday, Tuesday and Thursday.');
has('en whisper open to all levels', 'Open to all levels, no experience needed.');
missing('old "2 x 3hr and 1 x 3.5hr" line removed', '2 x 3 hr sessions and 1 x 3.5hr sessions');
missing('old 4-day "three 3 hr + closing 1 hr" session structure is gone', 'three 3 hr sessions plus a closing 1 hr session');
has('en whisper description includes the grooming-or-related-activity clause', 'Includes 2 hours of grooming or choice of another related activity');
has('en whisper closes with the client-given "for two people, bring your friend" line, replacing "Bring a friend for free"', 'This course is for two people, so bring your friend!');
has('en sessionNote reflects new 2x3.5hr + 1x3hr structure', 'two 3.5-hour sessions and one closing 3-hour session, including 2 hours choice of grooming or another related activity');
has('id whisper uses client-approved copy', 'Kursus 3 hari, 10 jam, berlangsung pada Senin, Selasa, dan Kamis.');
has('id whisper closes with the "for two people" line', 'Kursus ini untuk dua orang, jadi ajak teman Anda!');
has('ru whisper uses client-approved copy', 'Трёхдневный курс на 10 часов, проходит в понедельник, вторник и четверг.');
has('ru whisper closes with the "for two people" line', 'Курс рассчитан на двоих, так что берите с собой друга!');
has('en pickCourseDays says 3',    'pickCourseDays: "Select 3 days for the course"');

// ─── 2 Sep 2026 CLIENT-COPY-FEEDBACK: remaining copy notes from the client ─
has('en introLessons uses client-approved copy, dropping the "natural horsemanship" flourish', 'introLessons: "Every session except the Dressage Masterclass is off-saddle. You\'ll be working hand in hand with our rescue horses to build trust and learn to read them."');
has('id introLessons uses client-approved copy', 'introLessons: "Setiap sesi kecuali Dressage Masterclass dilakukan tanpa berkuda. Anda akan bekerja berdampingan dengan kuda rescue kami untuk membangun kepercayaan dan belajar memahami mereka."');
has('ru introLessons uses client-approved copy', 'introLessons: "Все занятия, кроме мастер-класса по выездке, проходят без седла. Вы будете работать рука об руку с нашими спасёнными лошадьми, выстраивая доверие и учась их понимать."');
has('en groupclinic description ends with the client-given "team setting" / "friend groups that ride" phrasing, replacing "team or boardroom" / "horse people alike"', 'the same skills you\'d use in any team setting. Popular with women\'s groups, business teams, and friend groups that ride.');
has('id groupclinic description ends with the client-given phrasing', 'keterampilan yang sama yang Anda gunakan dalam situasi tim apa pun. Populer di kalangan kelompok wanita, tim bisnis, dan kelompok pertemanan yang gemar berkuda.');
has('ru groupclinic description ends with the client-given phrasing', 'те же навыки, что пригодятся в любой командной обстановке. Популярно среди женских групп, бизнес-команд и компаний друзей, которые катаются верхом.');
has('en introPhotoshoots uses client-approved simpler opening line, replacing "Beautiful, story-telling photos... most scenic backdrops"', 'introPhotoshoots: "Photos with our rescue horses at our best spots around the property.');
has('id introPhotoshoots uses client-approved simpler opening line', 'introPhotoshoots: "Foto bersama kuda rescue kami di spot-spot terbaik di sekitar area kami.');
has('ru introPhotoshoots uses client-approved simpler opening line', 'introPhotoshoots: "Фотографии с нашими спасёнными лошадьми в лучших уголках нашей территории.');
has('en introPhotoshoots says the Beach shoot rider is mounted for the walk to the sand (3 Sep 2026 BEACH-SHOOT-MOUNTED, replacing "walk alongside your horse")', 'though for the Beach shoot you\'ll sit on your horse for the walk down to the sand.');
has('id introPhotoshoots says the Beach shoot rider is mounted for the walk to the sand', 'meski untuk sesi Pantai Anda akan menunggangi kuda saat berjalan menuju pasir.');
has('ru introPhotoshoots says the Beach shoot rider is mounted for the walk to the sand', 'хотя для съёмки на пляже вы проедете верхом на лошади по пути к воде.');
missing('no leftover "walk alongside your horse" beach-shoot wording', 'walk alongside your horse');
has('en lessonsToken matches the quoted word inside w3Body/w4Body (6 Sep 2026 WEIGHT-LESSONS-LINK)', 'lessonsToken: "\'Lessons\'"');
has('id lessonsToken', 'lessonsToken: "\'Pelajaran\'"');
has('ru lessonsToken', 'lessonsToken: "\u00abУроки\u00bb"');
has('w3Body renders through the Lessons link helper', 'bodyWithLessonsLink(t.w3Body, t.lessonsToken, goToLessons)');
has('w4Body renders through the Lessons link helper', 'bodyWithLessonsLink(t.w4Body, t.lessonsToken, goToLessons)');
has('link helper falls back to the plain string when the token is absent', 'if (i === -1) return text;');
has('goToLessons switches category and returns to step 1', 'setActiveCat("Lessons");');
has('ww-link style exists', '.ww-link {');
has('ww-title is weight 500, not 600', '.ww-title {\n  font-family: var(--display);\n  font-size: 15px;\n  font-weight: 500;');
missing('ww-title no longer uses weight 600', '.ww-title {\n  font-family: var(--display);\n  font-size: 15px;\n  font-weight: 600;');
missing('no leftover "Salty Cowboys" plural anywhere (3 Sep 2026 BRAND-NAME-SINGULAR: client confirmed "Salty Cowboy" singular is the correct brand name, reversing the previous CLIENT-COPY-FEEDBACK pass which had standardized on the plural)', 'Salty Cowboys');
has('en daysSelected says 3',      'daysSelected: "of 3 days selected"');
has('en courseWeekNote Mon/Tue/Thu (Friday dropped)', 'courseWeekNote: "The course runs Monday, Tuesday and Thursday, all within a single week."');
has('en whisperHintPre says 3 days', 'whisperHintPre: "The horse whisperer course goes over 3 days. "');
has('WhatsApp course schedule line updated to Mon/Tue/Thu', 'lines.push("Course runs Mon, Tue & Thu within one week");');
has('WhatsApp activity line overrides whisper\'s duration suffix to "3 to 3.5 hr/day"', 'const activityDurationSuffix = actObj && actObj.id === "whisper" ? "3 to 3.5 hr/day" : durationLabel;');
missing('no lang copy mentions Friday for whisper (en)', 'Monday, Tuesday, Thursday and Friday');
missing('no lang copy mentions Friday for whisper (id)', 'Senin, Selasa, Kamis, dan Jumat');
missing('no lang copy mentions Friday for whisper (ru)', 'понедельникам, вторникам, четвергам и пятницам');

// ─── BYO photographer descriptor (all photoshoots, card + step 2) ─────────
has('en byoPhotographer key (2 Sep 2026 CLIENT-COPY-FEEDBACK: lowercased "Photographer" mid-sentence, client-reported capitalization inconsistency in the photoshoot tab)',      'byoPhotographer: "Bring your own photographer or add a Salty Cowboy photographer"');
missing('standalone "BYO" no longer appears anywhere (word-boundary, base64 image constants excluded since they can\'t coincidentally spell BYO as a standalone token)', 'BYO Photographer');
has('byo note on step1 card',      'item.photoshoot && /*#__PURE__*/React.createElement("div", {\n    className: "byo-note"\n  }, t.byoPhotographer)');
has('byo line on step2 now a static filled chip, not a paragraph (batch3 Commit 2, #2)', 'isPhotoshoot && /*#__PURE__*/React.createElement("span", {\n    className: "byo-chip"\n  }, t.byoPhotographer)');

// ─── Notes section: "times not suitable" hint, all activities ────────────
has('en notesTimeHint key ends "here" not "below" (Figma parity commit 1)', 'notesTimeHint: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know here."');
has('id notesTimeHint key ends "di sini" not "di bawah" (Figma parity commit 1)', 'notesTimeHint: "Kami ingin Anda mendapatkan pengalaman yang berkesan. Jika waktu yang tersedia tidak sesuai, atau Anda memiliki permintaan tambahan, silakan beri tahu kami di sini."');
has('ru notesTimeHint key ends "здесь" not "ниже" (Figma parity commit 1)', 'notesTimeHint: "Мы хотим, чтобы у вас остались незабываемые впечатления. Если время не подходит или у вас есть дополнительный запрос, пожалуйста, напишите нам об этом здесь."');
has('notesTimeHint rendered near notes area, now display-gated with the rest of section 3 (batch 7: section 3 accordion)', 'className: "notes-time-hint",\n    style: {\n      display: section3Collapsed ? "none" : undefined\n    }\n  }, t.notesTimeHint), React.createElement("textarea"');

// ─── Main page: "Where the money goes" bio copy (Step 2 cost-funds-card only, since batch 4 Commit 1 removed the Step 1 card) ─
has('en moneyGoesBody excerpt (3 Sep 2026 MONEYGOES-VERBATIM: switched to the client\'s exact given wording, still used by Step 2 cost-funds-card and reused by the rider-info modal)', 'Every booking goes straight back into the paddock; vet care, feed, farrier visits, and the horses themselves.');
has('en moneyGoesBody covers the two outcomes for a recovered horse: back to gentle riding to make money for their friends, or adopted out to a family curated by Salty Cowboy', 'Some go back to gentle riding to make money for their friends, others can go to a family that is curated by us, that will adopt them and take care of them properly.');
missing('moneyGoesTitle key removed as dead code (batch 4, Commit 1: Step 1 money-goes card deleted, Step 2 uses its own costFundsTitle)', 'moneyGoesTitle:');

// ─── Wording: Sunrise → Morning, Sunset → Golden hour ─────────────────────
missing('no "Sunrise" anywhere',   'Sunrise');
missing('no "Sunset" anywhere',    'Sunset');
has('en introRides uses client-approved plainer copy (2 Sep 2026 CLIENT-COPY-FEEDBACK, dropped "emerald rice fields"/"especially magical" as too AI-sounding), still says Morning/golden hour not Sunrise/Sunset', 'Ride out through the rice fields, village roads and down to the beach. Our grooms come with you the whole way. Morning and golden hour rides are the best time to go.');
has('en insta desc uses golden hour (lowercase mid-sentence, matching the client\'s given copy; still not Sunrise/Sunset)', 'golden hour is ideal');

// ─── Intro / addon copy ───────────────────────────────────────────────────
has('en intro photog matches shoot duration, price corrected to the 1 Sep 2026 PHOTOG-PRICE-FLAT figures (was stale at the old 2,500,000/25 figures until this pass caught it)', 'from IDR 2,000,000, 20 edited photos, matching your shoot\'s own duration');
has('en intro per horse',          'Beach shoots are priced per horse');
has('en addon title (3 Sep 2026 BRAND-NAME-SINGULAR: reverted to "Salty Cowboy", the confirmed correct brand name)', 'addonTitle: "Add a Salty Cowboy photographer:"');
has('id addon title', 'addonTitle: "Tambahkan fotografer Salty Cowboy:"');
has('ru addon title', 'addonTitle: "Добавить фотографа Salty Cowboy:"');
has('WhatsApp payload addon line also uses "Salty Cowboy" (always English, sent to Simone)', 'Add-on: Salty Cowboy photographer (');
missing('old addonTiers translation arrays are gone (3 langs, no independent tier list anymore)', 'addonTiers: [');
has('en sessionNote one per week ("accepted" -> "taken", 29 Aug 2026 WHISPER-3DAY wording)', 'Only one course booking is taken per week.');
has('id sessionNote one per week', 'Hanya satu pemesanan kursus yang diterima per minggu.');
has('ru sessionNote one per week', 'В неделю принимается только одна бронь на курс.');

// ─── Step 2 now includes the calendar (no separate "calendar" screen) ─────
has('step calc collapses to 3 screens', 'const step = screen === "activity" ? 1 : screen === "riders" ? 2 : 3;');
has('heading 1 sits above duration pills, calendar shows unconditionally (Commit C)', 't.byoPhotographer), /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box"\n  }, /*#__PURE__*/React.createElement("h3", {\n    className: "section-title section-title-toggle",\n    onClick: () => setSection1Override(!section1Collapsed)\n  }, t.stepHeading1, SectionChevron(!section1Collapsed)), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: section1Collapsed ? "pointer" : undefined,\n      marginBottom: section1Collapsed ? 0 : undefined\n    },\n    onClick: section1Collapsed ? () => setSection1Override(!section1Collapsed) : undefined\n  }, t.dateTimeHint), React.createElement("div", {\n    className: "fu",\n    style: {\n      marginBottom: 22,\n      display: section1Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0,\n      marginBottom: 14\n    }\n  }, t.duration)');
missing('calendar no longer gated on detailsComplete', 'screen === "riders" && detailsComplete && /*#__PURE__*/React.createElement("div", {\n    className: "fu",\n    style: {\n      marginTop: 22');
has('calendar (cal-header) sits immediately after duration pills close, still within section 1', 'd)))), React.createElement("div", {\n    className: "cal-header",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  },');
missing('no separate calendar screen state left', '"calendar"');
missing('"See availability" button removed (calendar reveals automatically)', 't.seeAvailability');
missing('no lingering setScreen("calendar") calls', 'setScreen("calendar")');

// ─── Step 2 restyle (docs/step2-restyle-spec.md) — look only, no logic ────
has('step-dot border 1px',         'font-size: 10px; font-weight: 600;\n  border: 1px solid rgba(255,255,255,0.2);');
has('rider-card border 1px + asymmetric padding', '.rider-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;');
has('pill padding precision',      '.pill {\n  padding: 9.5px 16.5px;');
has('field-pill padding precision', '.field-pill {\n  padding: 7.5px 13.5px;');
has('text-input padding precision', '.text-input {\n  width: 100%;\n  padding: 11.5px 13.5px;');
has('cal-header top radius',       '.cal-header {\n  background: var(--earth);\n  padding: 20px 24px 18px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-radius: 14px 14px 0 0;\n}');
has('cal-legend bottom radius',    '.cal-legend {\n  padding: 12px 24px;\n  background: var(--earth);\n  display: flex;\n  gap: 16px;\n  border-top: 1px solid rgba(255,255,255,0.06);\n  border-radius: 0 0 14px 14px;\n}');
has('cal-day.selected is white with dark text', '.cal-day.selected {\n  background: #fff !important;\n  color: var(--earth) !important;\n  border-color: rgba(255,255,255,0.3) !important;\n}');
has('time-card padding precision', '.time-card {\n  flex: 1;\n  padding: 14.5px;');
has('time-card selected sub is legible', '.time-card.selected .time-sub  { color: var(--sand); font-size: 14px; }');
has('notes-area placeholder now var(--body) (Century Gothic/Outfit, no Futura, so a lightened weight actually renders lighter), weight 400', ".notes-area::placeholder { font-family: var(--body); font-weight: 400; color: #999999; font-size: 11.5px; }");
has('price-reveal is a light bordered card, now stacked label-over-value (Figma parity Commit 5, diff #8)', '.price-reveal {\n  display: flex; flex-direction: column; gap: 4px;\n  margin-bottom: 22px; padding: 14px 16px; border-radius: 12px;\n  background: #fff; border: 1.5px solid var(--fog);');
has('price-reveal-value is dark text, weight 500 not 600 (styling parity sub-step 1)', '.price-reveal-value { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--earth); }');
has('price-reveal-label replaces price-reveal-basis, reads TOTAL COST, Futura 500 (diff #8)', '.price-reveal-label { font-family: var(--display); font-weight: 500; font-size: 10px; color: var(--dusk); text-transform: uppercase; letter-spacing: 2px; }');
missing('price-reveal-basis CSS class removed', '.price-reveal-basis');

// ─── Step 1 restyle (docs/booking-engine-restyle-spec.md) — look only ─────
has('cat-tab uses shared pill pattern (fallback, Figma unverified)', '.cat-tab { flex: 0 0 auto; white-space: nowrap; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--fog); background: #fff; color: var(--earth);');
has('cat-tab.active uses earth/sand', '.cat-tab.active { background: var(--earth); border-color: var(--earth); color: var(--sand); }');
has('cat-intro-text no longer needs its own top margin (header photo band above it removed, batch 6: intro image removal); horizontal inset now comes from the restored .cat-intro box padding instead', '.cat-intro-text {\n  font-family: var(--body);\n  font-size: 12.5px;');
has('cat-intro-text weight 400 (was 500, lightened by the body-copy weight sweep); size 12.5px and line-height 1.6 (=20px) still match Figma, untouched; uses var(--body) not var(--display) so the weight actually renders (no Futura clamp)', '.cat-intro-text {\n  font-family: var(--body);\n  font-size: 12.5px;\n  font-weight: 400;\n  line-height: 1.6;');
has('act-card border 1px + generous padding, matching the locked Step 2 card padding (Figma spacing audit)', '.act-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;');
has('act-name is 16px, bumped up slightly from the 14px Figma typography pass per Ro\'s follow-up ask (was 22px originally, oversized relative to the card)', '.act-name { font-size: 16px; font-weight: 500; color: var(--earth); }');
missing('act-name did not gain a new font-family (rule: change size/weight/colour only)', '.act-name { font-size: 22px; font-weight: 500; color: var(--earth); font-family');
has('act-desc weight 300, reverted from a brief 200 experiment (Ro tried 200, decided against it); on var(--body) not var(--display), since macOS system Futura only ships Medium/Bold and was silently clamping every lighter weight back to Medium; 14px/18 line-height untouched', '.act-desc  { font-family: var(--body); font-size: 14px; font-weight: 300; color: #5c5c5c; line-height: 18px; }');
has('price-tag is a light pill, captured grey #eeeeee not the --fog token (Figma card rebuild, greys stay as captured)', '.price-tag { display: inline-flex; align-items: center; gap: 7px; padding: 5px 10px; border-radius: 300px; background: #eeeeee; border: 1px solid var(--fog); }');
has('pt-label uses near-black at 60% opacity via our token, not Figma\'s fractional-channel rgba(0.11,0.11,0.11,0.60) export glitch (Figma card rebuild landmine); 10.5px per the Figma typography pass (was 11px)', '.pt-label { font-size: 10.5px; color: rgba(20, 20, 20, 0.6); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }');
has('pt-value weight is 500 (was 700), matching the title/value/heading/Book weight hierarchy (Figma card rebuild)', '.pt-value { font-size: 13px; color: var(--earth); font-weight: 500; white-space: nowrap; }');

// ─── Step 3 restyle (docs/booking-engine-restyle-spec.md) — look only ─────
has('confirm-title is 22px (was 21px)', '.confirm-title {\n  font-family: var(--display);\n  font-size: 22px;');
has('confirm-title (the "WhatsApp has opened..." heading) is explicit regular weight, overriding the browser\'s default bold h2', '.confirm-title {\n  font-family: var(--display);\n  font-size: 22px;\n  font-weight: 400;');
has('.hero-logo is clickable (cursor:pointer) to support the new logo-click-to-restart behaviour', '.hero-logo {\n  position: relative;\n  display: block;\n  width: 172px;\n  max-width: 62%;\n  height: auto;\n  margin: 0 auto 14px;\n  cursor: pointer;\n}');
has('IG_URL/AIRBNB_URL constants live alongside WA_NUMBER, the other external-destination constant', 'const IG_URL = "https://www.instagram.com/salty.cowboy/?hl=en";\nconst AIRBNB_URL = "https://www.airbnb.com/users/profile/1470526584044287896?previous_page_name=PdpHomeMarketplace";');
has('hero-social row (Instagram + Airbnb Listings links) rendered right after hero-sub, inside the dark sidebar so it shows on every screen', 't.heroSub), /*#__PURE__*/React.createElement("div", {\n    className: "hero-social"\n  }, /*#__PURE__*/React.createElement("a", {\n    href: IG_URL,\n    target: "_blank",\n    rel: "noopener noreferrer"\n  }, t.igLink), /*#__PURE__*/React.createElement("a", {\n    href: AIRBNB_URL,\n    target: "_blank",\n    rel: "noopener noreferrer"\n  }, t.airbnbLink)))');
has('en igLink/airbnbLink keys', 'igLink: "Instagram",\n    airbnbLink: "Airbnb Listings",');
has('id igLink/airbnbLink keys', 'igLink: "Instagram",\n    airbnbLink: "Daftar Airbnb",');
has('ru igLink/airbnbLink keys', 'igLink: "Instagram",\n    airbnbLink: "Объявления на Airbnb",');
has('both external links open in a new tab with noopener/noreferrer, not a same-tab navigation', 'target: "_blank",\n    rel: "noopener noreferrer"\n  }, t.igLink)', 1);
has('clicking the Salty Cowboy logo takes the user back to the activity selection screen from any step, same setScreen("activity") call the Step 2 back-link already uses, no field resets - consistent with that existing back-link\'s behaviour', 'alt: "Salty Cowboy Bali",\n    onClick: () => setScreen("activity")');
has('.copy-btn ("Copy message") is regular weight, not the earlier semibold 600', '.copy-btn { margin-top: 10px; width: auto; padding: 10px 20px; border-radius: 12px; border: 1px solid var(--earth); background: #fff; color: var(--earth); font-family: var(--display); font-size: 14px; font-weight: 400;');
has('confirm-summary border 1px + 18.5 padding', '.confirm-summary {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 18.5px;');
has('copy-box now carries the card look (was bare)', '.copy-box { margin: 8px 0 22px; text-align: left; background: #f7f7f7; border: 1px solid #dcdcdc; border-radius: 12px; padding: 15px; }');
has('copy-heading letter-spacing aligned to shared uppercase-label convention', '.copy-heading { font-size: 11px; font-weight: 600; color: var(--dusk); text-transform: uppercase; letter-spacing: 1.5px;');
has('copy-text lost its own box now that copy-box carries it; weight 300 on var(--body) (was inheriting the implicit 400 default on var(--display), lightened by the body-copy weight sweep)', '.copy-text { white-space: pre-wrap; word-break: break-word; font-family: var(--body); font-size: 13px; font-weight: 300; line-height: 19px; color: #444444; max-height: 210px; overflow-y: auto; }');
has('copy-btn is compact outline (was full-width tinted)', '.copy-btn { margin-top: 10px; width: auto; padding: 10px 20px; border-radius: 12px; border: 1px solid var(--earth); background: #fff; color: var(--earth);');
missing('clipboard emoji removed from copy button label', '"📋 " + t.copyBtn');
has('reset-link class exists (Make another booking no longer shares .cta)', '.reset-link {\n  background: none;\n  border: none;\n  color: var(--dusk);\n  font-size: 14px;');
has('Make another booking uses reset-link, not cta', 'className: "reset-link",\n    onClick: resetAll');
has('en awaiting has no hourglass emoji', 'awaiting: "Awaiting approval"');
has('id awaiting has no hourglass emoji', 'awaiting: "Menunggu persetujuan"');
has('ru awaiting has no hourglass emoji', 'awaiting: "Ожидает подтверждения"');
missing('hourglass emoji not glued onto the awaiting value specifically (it now lives on the notice sentence instead, per Ro\'s later request)', '⏳ Awaiting approval');

// ─── Commit A (docs/booking-engine-structural-spec.md): act-card rebuild ──
missing('act-icon element removed', 'className: "act-icon"');
has('act-image sits in the act-right column, above the Book button (Figma card rebuild); now conditionally styled with a per-activity background-image, item.image undefined OR item.hideCardImage true falls back to the plain grey placeholder (PADDOCK-IMG commit decouples the card image from the Step 2 header band)', '/*#__PURE__*/React.createElement("div", {\n    className: "act-right"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-image",\n    style: item.image && !item.hideCardImage ? {\n      backgroundImage: "url(" + item.image + ")",\n      backgroundSize: "cover",\n      backgroundPosition: "center"\n    } : undefined\n  }), /*#__PURE__*/React.createElement("button", {\n    className: "act-book-btn"');
missing('hideCardImage removed entirely (no activity carries it anymore) - it stopped doing anything once PHOTO-GALLERY made the Step 2 header band never render for photoshoot activities, so decoupling card vs. header images was no longer meaningful; the .act-image JSX check for it is a separate, harmless no-op left in place rather than ripped out', 'hideCardImage: true');
has('.act-image is 233px tall, captured grey #d9d9d9 not the --fog token (Figma card rebuild, greys stay as captured)', '.act-image { width: 100%; height: 233px; border-radius: 14px; background: #d9d9d9; }');
has('act-card base is a mobile-first stacked column (locked Step 2 padding, 12px gap); the Figma two-column row only applies at the 900px desktop breakpoint (Figma card rebuild)', '.act-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  position: relative;\n}');
has('at 900px+, act-card becomes a row with nowrap (not wrap, see the comment: wrap would decide line-breaks on un-shrunk basis and always drop the image), left/right basis 316/284 so the image shrinks to fit the 623px column (Figma card rebuild)', '.act-card { flex-direction: row; flex-wrap: nowrap; align-items: flex-start; }\n  .act-left { flex: 0 1 316px; min-width: 220px; }\n  .act-right { flex: 1 1 284px; min-width: 160px; }');
has('.act-left base (mobile): title+desc and price pills stacked, 22px inner gap', '.act-left {\n  display: flex;\n  flex-direction: column;\n  gap: 22px;\n}');
has('.act-titledesc gives title and description their own tighter 9px gap, nested inside act-left\'s 22px rhythm (Figma card rebuild)', '.act-titledesc { display: flex; flex-direction: column; gap: 9px; }');
has('.act-right base (mobile): image and Book button stacked, right-aligned', '.act-right {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n}');
has('price pills stack vertically, one per duration, instead of wrapping in a row (Figma card rebuild)', '.price-tags { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }');
has('Book button font-weight is 500 (was 600), matching the title/value/heading/Book weight hierarchy (Figma card rebuild); size 18px per the Figma typography pass (was 13px)', 'font-family: var(--display);\n  font-size: 18px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.act-book-btn:hover');
has('act-check repositioned absolute (was margin-left:auto)', '.act-check {\n  position: absolute;\n  top: 14px;\n  right: 14px;');
missing('act-check no longer uses margin-left:auto', 'margin-left: auto;\n  width: 20px; height: 20px;\n  border-radius: 50%;\n  background: var(--clay);\n  color: #fff;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 11px;\n  flex-shrink: 0;\n  opacity: 0;\n  transform: scale(0.6);\n  transition: all 0.2s;\n}\n.act-card.selected .act-check');
has('category tab click also clears selectedDates/selectedTime alongside duration/numPeople, same stale-date fix as the card click and Book button', 'setActiveCat(cat.category);\n      setActivity(null);\n      setDuration(null);\n      setNumPeople(null);\n      setPhotographerAddon(false);\n      setBookingForOther(false);\n      setGrooming(null);\n      setSelectedDates([]);\n      setSelectedTime(null);\n    }\n  }, t.categories[cat.category])');
has('per-card Book button reuses existing state setters, not a new handler', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerAddon(false);\n      setBookingForOther(false);\n      setGrooming(null);\n      // Clearing these here (not just duration/numPeople) matters: without\n      // it, a date/time picked for a previous activity can still satisfy\n      // section1Complete for the new one (same requiredDates, slot still\n      // valid), so section 1 would land pre-collapsed and section 2 would\n      // auto-open on a booking the user never actually confirmed.\n      setSelectedDates([]);\n      setSelectedTime(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');
has('en bookActivity label', 'bookActivity: "Book →"');
has('id bookActivity label', 'bookActivity: "Pesan →"');
has('ru bookActivity label', 'bookActivity: "Забронировать →"');

// ─── Commit B (docs/booking-engine-structural-spec.md): Step 2 additions ──
missing('detail-header-band (dark image band) removed, superseded by the Figma parity light card', 'className: "detail-header-band"');
missing('detail-header-band CSS block removed', '.detail-header-band {');
has('en stepHeading1/2/3 keys', 'stepHeading1: "1. Book a date and time"', 1);
has('en stepHeading2 key', 'stepHeading2: "2. Who\'s coming?"');
has('en stepHeading3 key', 'stepHeading3: "3. Your booking summary"');
has('id stepHeading1 key', 'stepHeading1: "1. Pilih tanggal dan waktu"');
has('ru stepHeading1 key', 'stepHeading1: "1. Выберите дату и время"');
has('heading 2 sits above numPeople block (current, pre-reorder order)', 'React.createElement("h3", {\n    className: "section-title section-title-toggle",\n    onClick: toggleSection2\n  }, t.stepHeading2, SectionChevron(!section2Collapsed)), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer",\n      marginBottom: section2Collapsed ? 0 : undefined\n    },\n    onClick: toggleSection2\n  }, t.section2Subtitle), duration && (!needsGrooming || grooming) && /*#__PURE__*/React.createElement("div", {\n    className: "fu2 control-card",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.numPeople)');
has('section 3 (summary/total/notes/Send/notice) always renders on the riders screen now (batch 7: section 3 accordion); its content is display-gated on section3Collapsed instead of the whole block being conditionally rendered on datesComplete', 'screen === "riders" && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"\n  }, React.createElement("h3", {\n    className: "section-title section-title-toggle",\n    onClick: toggleSection3\n  }, t.stepHeading3');
has('en sRiders renamed to Participant (Figma parity commit 1)', 'sRiders: "Participant",\n    sStatus: "Status"');
has('id sRiders renamed to Peserta (Figma parity commit 1)', 'sRiders: "Peserta",\n    sStatus: "Status"');
has('ru sRiders renamed to Участник (Figma parity commit 1)', 'sRiders: "Участник",\n    sStatus: "Статус"');
has('confirm-summary block still appears twice (Step 2 in-page + Step 3 confirm)', 'className: "confirm-summary"', 2);
missing('sTotal translation key removed as dead code (Figma parity Commit 5, diff #14: Total row dropped from the summary table)', 'sTotal:');
missing('t.sTotal no longer read anywhere in the summary table', 't.sTotal)');
has('riders-screen summary sits directly under heading 3 (and its collapsed hint), before the TOTAL COST block (Figma parity Commit 5)', 'summaryPendingHint), React.createElement("div", {\n    className: "confirm-summary"');
has('Send button disabled on selectedTime OR incomplete details (Commit C moves the completeness check here)', 'className: "cta",\n    style: {\n      marginTop: 0,\n      marginBottom: 22,\n      display: section3Collapsed ? "none" : undefined\n    },\n    disabled: !selectedTime || !detailsComplete,\n    onClick: handleSend\n  }, t.sendBtn)');

// ─── User request (2026-08-17): Step 2 reorder + ungate, Futura upright type ──
has('--display CSS variable now Futura system stack, not Cormorant italic', "--display: 'Futura', 'Century Gothic', 'Outfit', sans-serif;");
missing('Cormorant Garamond no longer used as the display font', "--display: 'Cormorant Garamond'");
has('font-style: italic only remains on the 3 non-display notes (loading label, price-note, byo-note)', 'font-style: italic', 3);
has('price-note keeps its own italic styling untouched (not a --display heading); weight 300 on var(--body) (was implicit 400, lightened by the body-copy weight sweep)', '.price-note { font-family: var(--body); font-size: 11px; font-weight: 300; color: var(--dusk); margin-top: 5px; font-style: italic; }');
has('byo-note keeps its own italic styling untouched (not a --display heading); weight 300 on var(--body) (was implicit 400, lightened by the body-copy weight sweep)', '.byo-note { font-family: var(--body); font-size: 11.5px; font-weight: 300; color: var(--dusk); margin-top: 6px; line-height: 1.45; font-style: italic; }');
has('duration-to-slot filtering still reads duration + sortedDates, untouched by reorder', 'const availableSlots = slotsFor(actObj, duration, sortedDates);');
has('Horse Whisperer multi-day week-lock logic untouched by reorder', 'if (isCourse && selectedDates.length > 0) {\n      if (weekKey({ y: calYear, m: calMonth, d: day }) !== weekKey(selectedDates[0])) return false;\n    }');
has('detailsComplete definition unchanged (still riders+duration+numPeople+grooming based)', 'const detailsComplete = !!duration && !!numPeople && (!needsGrooming || !!grooming) && ridersComplete;');
missing('the old marginTop:22 spacer above the calendar is gone (large gap removed)', 'className: "fu",\n    style: {\n      marginTop: 22');

// ─── docs/step2-figma-parity-batch.md, Commit 1: copy and labels ──────────
has('en dateTimeHint key added under stepHeading1 (diff #3)', 'dateTimeHint: "Select an available date below to choose your time slot."');
has('dateTimeHint rendered as a section-hint right after heading 1, now permanent (Ro asked section 1 to keep its hint visible even collapsed, like sections 2/3); marginBottom conditionally zeroed only while collapsed (it\'s followed by display:none siblings then, same bug pattern as section 3\'s hint, caught from a second uneven-spacing report)', 't.stepHeading1, SectionChevron(!section1Collapsed)), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: section1Collapsed ? "pointer" : undefined,\n      marginBottom: section1Collapsed ? 0 : undefined\n    },\n    onClick: section1Collapsed ? () => setSection1Override(!section1Collapsed) : undefined\n  }, t.dateTimeHint)');
has('en participantDetails key added (diff #7)', 'participantDetails: "Participant details"');
missing('aboutYou key removed (folded into participantDetails for the single-rider case)', 'aboutYou:');
missing('yourDetails key removed (folded into participantDetails for the single-rider case)', 'yourDetails:');
has('outer "about riders" wrapper only shows for 2+ riders now (was riders.length > 0)', 'riders.length > 1 && /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, t.aboutRiders)');
has('single-rider card label reads participantDetails, multi-rider keeps numbered personNoun', 'className: "rider-label"\n    }, riders.length === 1 ? t.participantDetails : personNoun + " " + (idx + 1))');
has('en sTotal label sits alongside renamed sRiders (diff #13)', 'sRiders: "Participant",');
has('en awaiting stays hourglass-free (diff #16 declined, no-decorative-emoji decision stands)', 'awaiting: "Awaiting approval"');
missing('hourglass emoji not reintroduced onto the awaiting value specifically (notice sentence carries it instead)', '⏳ Awaiting approval');

// ─── docs/step2-figma-parity-batch.md, Commit 2: card containers ──────────
has('.control-card CSS added, matches rider-card bordered treatment and padding (diff #4/#6, styling parity sub-step 3)', '.control-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
missing('duration selector no longer wrapped in control-card (reversed by batch 5, Commit 3: "Duration is not in a card")', 'className: "fu control-card"');
has('duration selector keeps the 14px label-to-pill gap and its own 22px trailing margin via inline style, just without the card chrome (batch 5, Commit 3)', 'React.createElement("div", {\n    className: "fu",\n    style: {\n      marginBottom: 22,\n      display: section1Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0,\n      marginBottom: 14\n    }\n  }, t.duration)');
has('number-of-people selector wrapped in control-card (diff #6)', 'React.createElement("div", {\n    className: "fu2 control-card",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.numPeople)');
has('grooming selector NOT wrapped in control-card (only duration, date and numPeople are in scope)', 'needsGrooming && /*#__PURE__*/React.createElement("div", {\n    className: "fu2",\n    style: {\n      marginBottom: 22,\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.groomingLabel)');
has('sel-title (selected single-date readout) now a bordered field (diff #5)', '.sel-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 16px;\n  color: var(--earth);\n  margin-bottom: 14px;\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 10px;\n  padding: 12px 14px;\n}');

// ─── docs/step2-figma-parity-batch.md, Commit 3: activity header ──────────
has('.detail-header-card CSS added, light bordered card (diff #1)', '.detail-header-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 20px 18px;\n  margin-top: -48px;\n  margin-bottom: 22px;\n}');
has('title and description sit in the light detail-header-card, no background image (diff #1); marginTop conditionally zeroed for isPhotoshoot (PHOTO-GALLERY commit), since photoshoot pages have no image band above the card for the base -48px overlap to land on', 'className: "detail-header-card",\n    style: isPhotoshoot ? { marginTop: 0 } : undefined\n  }, /*#__PURE__*/React.createElement("h2", {\n    className: "section-title"\n  }, t.activities[actObj?.id])');

// ─── PHOTO-GALLERY commit: photoshoot pages get a 4-thumbnail gallery ────
has('gallery-row renders for isPhotoshoot activities only, right where the image band used to sit; each thumb shows actObj.gallery[i] as a background-image when present (falls back to the plain --fog placeholder for any activity without a gallery array) and opens the lightbox at its own index on click', 'isPhotoshoot && /*#__PURE__*/React.createElement("div", {\n    className: "gallery-row"\n  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {\n    key: i,\n    className: "gallery-thumb",\n    style: actObj?.gallery?.[i] ? {\n      backgroundImage: "url(" + actObj.gallery[i] + ")",\n      backgroundSize: "cover",\n      backgroundPosition: "center"\n    } : undefined,\n    onClick: () => setLightboxIndex(i)\n  })))');
has('detail-header-image band gated on !isPhotoshoot, so photoshoot pages get the gallery row instead, every other category unchanged', '!isPhotoshoot && /*#__PURE__*/React.createElement("div", {\n    className: "detail-header-image",');
has('.gallery-row is a direct child of .body, same wrapper as section 1\'s box, so it inherits the same 623px content width for free with no extra width rule', '.gallery-row {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 22px;\n}');
has('.gallery-thumb reuses --fog (same placeholder fill as .detail-header-image) and the page\'s existing 14px border-radius, no new tokens introduced; cursor:pointer added now that it opens the lightbox', '.gallery-thumb {\n  flex: 1;\n  aspect-ratio: 1;\n  background: var(--fog);\n  border-radius: 14px;\n  cursor: pointer;\n}');

// ─── Gallery lightbox: toggle between the 4 placeholder photos, close ────
has('lightboxIndex state, null when closed, resets to null on activity switch so a stale lightbox never carries over', 'const [lightboxIndex, setLightboxIndex] = useState(null);\n  useEffect(() => {\n    setLightboxIndex(null);\n  }, [activity]);');
has('lightbox only renders when lightboxIndex is not null, portaled onto document.body so "position:fixed; inset:0" resolves against the true viewport - not the .fu ancestor whose fadeUp animation leaves a persistent transform via animation-fill-mode:both, which would otherwise create a containing block and confine the lightbox to the .main column (confirmed live via getBoundingClientRect before adding the portal)', 'lightboxIndex !== null && ReactDOM.createPortal(');
has('backdrop click closes the lightbox', 'className: "gallery-lightbox",\n    onClick: () => setLightboxIndex(null)\n  }');
has('lightbox portal explicitly targets document.body', '}, "›")), document.body)');
has('close button stops propagation before clearing lightboxIndex, so it doesn\'t double-fire the backdrop\'s own close handler', 'className: "gallery-lightbox-close",\n    type: "button",\n    onClick: e => {\n      e.stopPropagation();\n      setLightboxIndex(null);\n    }');
has('prev button wraps 3->0 via modulo, not a plain decrement (would go negative at index 0)', 'className: "gallery-lightbox-nav gallery-lightbox-prev",\n    type: "button",\n    onClick: e => {\n      e.stopPropagation();\n      setLightboxIndex(li => (li + 3) % 4);\n    }');
has('next button wraps 0->3 via modulo', 'className: "gallery-lightbox-nav gallery-lightbox-next",\n    type: "button",\n    onClick: e => {\n      e.stopPropagation();\n      setLightboxIndex(li => (li + 1) % 4);\n    }');
has('clicking the photo itself does not close the lightbox (stops propagation before it can reach the backdrop); shows actObj.gallery[lightboxIndex] as a background-image, same pattern as the thumbnails', 'className: "gallery-lightbox-photo",\n    style: actObj?.gallery?.[lightboxIndex] ? {\n      backgroundImage: "url(" + actObj.gallery[lightboxIndex] + ")",\n      backgroundSize: "cover",\n      backgroundPosition: "center"\n    } : undefined,\n    onClick: e => e.stopPropagation()');
has('.gallery-lightbox is a solid var(--earth) backdrop, not a new color, matching the sidebar/hero dark tone', '.gallery-lightbox {\n  position: fixed;\n  inset: 0;\n  background: var(--earth);');
has('.gallery-lightbox-nav mirrors .cal-nav\'s existing circular icon-button pattern (border, --sand color, hover fill) rather than inventing a new button style', '.gallery-lightbox-nav {\n  background: none;\n  border: 1px solid rgba(255,255,255,0.2);\n  color: var(--sand);\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;');
missing('gallery-row/gallery-thumb never reference a color or font token that isn\'t already defined elsewhere in the stylesheet (no new token sprawl)', '--gallery');
missing('back-link no longer lives inside detail-header-card (moved above the image band, batch 5, Commit 3)', 'className: "detail-header-card"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "back-link"');
has('description now sits inside the header card, directly under the title (diff #2)', 't.activities[actObj?.id]), /*#__PURE__*/React.createElement("p", {\n    className: "detail-desc"\n  }, t.descs[actObj?.id]))');
missing('detail-intro wrapper removed (description no longer a separate sibling block)', 'className: "detail-intro"');
missing('detail-emoji (wave/sunrise icon prefix on the description) removed (diff #2)', 'className: "detail-emoji"');
missing('Step 1 category intro no longer renders a header photo band (batch 6: intro image removal, Figma has no image above the intro copy); IMG_PHOTOSHOOTS/IMG_RIDES/IMG_LESSONS constants are now unreferenced dead code, left in place pending a decision on trimming them', 'src: activeCat === "Photoshoots" ? IMG_PHOTOSHOOTS : activeCat === "Rides" ? IMG_RIDES : IMG_LESSONS,');
missing('.cat-intro-img element no longer rendered (batch 6: intro image removal)', 'className: "cat-intro-img"');

// ─── docs/step2-figma-parity-batch.md, Commit 4: cost-funds section ───────
has('en costFundsTitle key added (diff #19)', 'costFundsTitle: "What your booking cost funds"');
has('id costFundsTitle key added', 'costFundsTitle: "Untuk apa biaya pemesanan Anda digunakan"');
has('ru costFundsTitle key added', 'costFundsTitle: "На что идёт стоимость вашего бронирования"');
has('.cost-funds-card CSS added, light not dark (unlike the now-removed Step 1 money-goes card)', '.cost-funds-card {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 19px 18px;\n  margin-bottom: 18px;\n}');
has('cost-funds block reuses moneyGoesBody copy (word-for-word identical to Figma diff #19 text)', 'className: "cost-funds-title"\n  }, t.costFundsTitle), /*#__PURE__*/React.createElement("p", {\n    className: "cost-funds-body"\n  }, t.moneyGoesBody)');
has('rider-info card (moved under the booking summary, 1 Sep 2026 RIDER-INFO-UNDER-SUMMARY) sits directly after the section-3 confirmation-notice/blocked-note pair, ahead of cost-funds-card, always visible on the riders screen', 't.notice)), blockedSection === 3 && /*#__PURE__*/React.createElement("div", {\n    className: "blocked-note"\n  }, /*#__PURE__*/React.createElement("span", null, t.section3Blocked), /*#__PURE__*/React.createElement("button", {\n    className: "blocked-note-close",\n    type: "button",\n    onClick: () => setBlockedSection(null)\n  }, "✕")), screen === "riders" && isRiding && riders.length > 0 && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "perm-row addon-row",\n    onClick: () => {\n      const next = !bookingForOther;\n      setBookingForOther(next);\n      if (next) setShowRiderInfoModal(true);\n    }\n  }');
has('cost-funds-card sits directly after the rider-info card (whether or not the rider-info card actually rendered, since && short-circuits to false rather than removing the sibling slot) and before the confirm screen', ')))), screen === "riders" && /*#__PURE__*/React.createElement("div", {\n    className: "cost-funds-card fu step2-block"');
missing('no decorative horse emoji added to the cost-funds heading, consistent with the no-decorative-emoji decision', 'costFundsTitle: "🐴');

// ─── docs/step2-figma-parity-batch.md, Commit 5: price/summary reorder ────
// ISOLATED, LOGIC-adjacent commit (touches DOM order and drops dead priceBasis
// code, but not pricing math itself). Kept independently revertible per spec.
has('en editLink key added (diff #15)', 'editLink: "Edit"');
has('id editLink key added', 'editLink: "Ubah"');
has('ru editLink key added', 'editLink: "Изменить"');
has('en totalCostLabel key added (diff #8)', 'totalCostLabel: "Total cost"');
has('id totalCostLabel key added', 'totalCostLabel: "Total biaya"');
has('ru totalCostLabel key added', 'totalCostLabel: "Итоговая стоимость"');
has('Edit link appended inside the step 2 summary card, now reopens sections 1 and 2 via handleEditClick instead of only scrolling (Ro asked for edit to reopen every accordion)', 't.awaiting)), /*#__PURE__*/React.createElement("div", {\n    style: {\n      textAlign: "right",\n      marginTop: 8\n    }\n  }, /*#__PURE__*/React.createElement("span", {\n    className: "hint-link",\n    style: {\n      cursor: "pointer",\n      fontSize: 12\n    },\n    onClick: handleEditClick\n  }, t.editLink))');
has('TOTAL COST block sits directly after the summary card, still gated on duration/numPeople/selPrice (diff #9)', 'onClick: handleEditClick\n  }, t.editLink))), duration && numPeople && selPrice && /*#__PURE__*/React.createElement("div", {\n    className: "price-reveal",\n    style: {\n      display: section3Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("span", {\n    className: "price-reveal-label"\n  }, t.totalCostLabel), /*#__PURE__*/React.createElement("span", {\n    className: "price-reveal-value"\n  }, totalPriceStr))');
has('notes block sits right after TOTAL COST, before Send (diffs #9/#12)', 'totalPriceStr)), React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0,\n      display: section3Collapsed ? "none" : undefined\n    }\n  }, t.notesLabel)');
has('Send button sits directly after the notes textarea, before the confirmation notice (diff #17)', 'onChange: e => setNotes(e.target.value)\n  }), React.createElement("button", {\n    className: "cta",\n    style: {\n      marginTop: 0,\n      marginBottom: 22,\n      display: section3Collapsed ? "none" : undefined\n    },\n    disabled: !selectedTime || !detailsComplete,\n    onClick: handleSend\n  }, t.sendBtn), React.createElement("div", {\n    className: "notice"');
has('confirmation notice now sits after Send, last inside section 3\'s box, display-gated with the rest of it, no decorative emoji (Commit D)', 't.sendBtn), React.createElement("div", {\n    className: "notice",\n    style: {\n      display: section3Collapsed ? "none" : undefined\n    }\n  }, t.notice))');
missing('notice no longer wraps its text in a decorative-emoji span (Commit D: seedling-equivalent removed)', 'className: "notice"\n  }, /*#__PURE__*/React.createElement("span"');
has('handleSend / buildWhatsAppMessage payload fields: totalPriceStr from Ro\'s earlier request, photographerTier -> photographerAddon from the 29 Aug 2026 auto-match redesign, bookingForOther added 29 Aug 2026 BOOKING-FOR-OTHER, every other field unchanged', 'const message = buildWhatsAppMessage({\n      actObj,\n      durationLabel: duration,\n      formattedDates,\n      isCourse,\n      selectedTime,\n      numPeople,\n      riders,\n      showWeight,\n      notes,\n      photographerAddon: isPhotoshoot ? photographerAddon : false,\n      bookingForOther: isRiding ? bookingForOther : false,\n      grooming: needsGrooming ? grooming : null,\n      totalPriceStr\n    });');
has('totalPrice / totalPriceStr computation itself untouched, only its rendering moved (diff #9)', 'const totalPrice = unitPrice * mult + photographerPrice;\n  const totalPriceStr = "IDR " + totalPrice.toLocaleString("en-US");');

// ─── docs/step2-styling-parity.md, sub-step 1: weights to Futura 500 ──────
// Weight/family only. No size, colour, spacing or logic touched.
has('section-title (activity title / section headings) now explicitly weight 500, was bold by h2/h3 default', '.section-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 22px;');
has('section-hint (Step 1 helper line + Step 2 hints) now on var(--body), weight 400 (was 500 on var(--display), lightened by the body-copy weight sweep; moved off var(--display) since macOS Futura has no face lighter than Medium)', '.section-hint {\n  font-family: var(--body);\n  font-weight: 400;\n  font-size: 12px;');
has('back-link is Futura 500, plain text link with no button chrome (batch 5, Commit 3 reverses the bordered-pill treatment)', '.back-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;\n  color: var(--earth);\n  cursor: pointer;\n  margin-bottom: 14px;\n  width: fit-content;\n}');
missing('back-link no longer has its own padding/border/background/radius (button chrome removed)', '.back-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;\n  color: var(--earth);\n  cursor: pointer;\n  margin-bottom: 14px;\n  width: fit-content;\n  padding');
has('detail-desc (activity description) weight 300, matching act-desc (was 500, then 400, then 300, briefly 200, reverted back to 300); on var(--body) not var(--display), since macOS Futura has no face lighter than Medium and was clamping every one of those weights back to the same rendering', '.detail-desc { font-family: var(--body); font-weight: 300; font-size: 13px;');
has('act-category (eyebrow labels: Duration, Number of people, Participant details, Time slot, Total cost) now Futura, weight already 500', '.act-category {\n  font-family: var(--display);\n  font-size: 10px;');
has('rider-label (Participant details eyebrow) now Futura, weight already 500', '.rider-label {\n  font-family: var(--display);\n  font-size: 11px;\n  letter-spacing: 1.5px;');
has('field-label (Name/Age/Weight range/Riding experience) now Futura, weight already 500', '.field-label {\n  font-family: var(--display);\n  font-size: 11px;\n  color: var(--dusk);');
has('text-input (field value) now Futura 500, was Outfit at default weight', '.text-input {\n  width: 100%;\n  padding: 11.5px 13.5px;\n  border: 1.5px solid var(--fog);\n  border-radius: 10px;\n  font-family: var(--display);\n  font-weight: 500;');
has('pill (duration/people) now Futura 500, was Outfit at default weight', '.pill {\n  padding: 9.5px 16.5px;\n  border: 1.5px solid var(--fog);\n  border-radius: 24px;\n  font-size: 13px;\n  cursor: pointer;\n  background: #fff;\n  color: var(--earth);\n  transition: all 0.18s;\n  font-family: var(--display);\n  font-weight: 500;\n}');
has('field-pill (weight/experience) now Futura 500, was Outfit at default weight', '.field-pill {\n  padding: 7.5px 13.5px;\n  border: 1.5px solid var(--fog);\n  border-radius: 20px;\n  font-size: 12px;\n  cursor: pointer;\n  background: #fff;\n  color: var(--earth);\n  transition: all 0.15s;\n  font-family: var(--display);\n  font-weight: 500;\n}');
has('sel-title (date readout) now explicitly weight 500', '.sel-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 16px;');
has('cal-month now explicitly weight 500', '.cal-month {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 18px;');
has('cal-day-name (calendar weekday) now Futura 500', '.cal-day-name {\n  font-family: var(--display);\n  font-weight: 500;\n  text-align: center;');
has('cal-day (calendar day number) now Futura 500, was weight 400', '.cal-day {\n  font-family: var(--display);\n  aspect-ratio: 1;\n  display: flex; align-items: center; justify-content: center;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 500;');
has('legend-item (calendar legend) now Futura 500', '.legend-item { font-family: var(--display); font-weight: 500; display: flex;');
has('sum-key (summary row label) now Futura 500, was inheriting Outfit at default weight', '.sum-key { font-family: var(--display); font-weight: 500; color: var(--dusk); }');
has('sum-val (summary row value, incl. Status) now Futura, weight already 500', '.sum-val { font-family: var(--display); color: var(--earth); font-weight: 500;');
has('hint-link (Edit link) now Futura, weight already 500', '.hint-link {\n  font-family: var(--display);\n  color: var(--clay);\n  font-weight: 500;');
has('perm-text (consent checkbox text) now Futura 500, was inheriting Outfit at default weight', '.perm-text { font-family: var(--display); font-weight: 500; font-size: 12px; color: #444444;');
has('notice (confirmation note) now on var(--body), weight 400 (was 500 on var(--display), lightened by the body-copy weight sweep)', '.notice {\n  background: #f7f7f7;\n  border: 1px solid #dcdcdc;\n  border-radius: 10px;\n  padding: 12px 14px;\n  font-family: var(--body);\n  font-weight: 400;');
has('cta (WhatsApp button) now explicitly weight 500', '.cta {\n  display: block;\n  width: 100%;\n  padding: 16px;\n  background: var(--clay);\n  color: #fff;\n  border: none;\n  border-radius: 14px;\n  font-family: var(--display);\n  font-weight: 500;');
has('cost-funds-title now explicitly weight 500', '.cost-funds-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 18px;');
has('cost-funds-body now on var(--body), weight 400 (was 500 on var(--display), lightened by the body-copy weight sweep)', '.cost-funds-body {\n  font-family: var(--body);\n  font-weight: 400;\n  font-size: 12.5px;');
// Batch 5, Commit 1 reversed the two named exceptions above: the time-slot
// card now also renders in Futura. time-main/time-sub declare no font-family
// of their own, so they inherit it from .app (now var(--display)); only the
// weights (500 / default 400) are unchanged, per that commit's explicit
// "keep the existing weight per role, only the family changes".
has('.app (site-wide base font) is now Futura via var(--display), not Outfit (batch 5, Commit 1)', '.app {\n  font-family: var(--display);');
missing('.app no longer hardcodes Outfit as the base font', ".app {\n  font-family: 'Outfit'");
has('time-main keeps its pre-existing weight 500, unedited by this pass; family now comes from .app inheriting Futura (batch 5, Commit 1)', '.time-main { font-size: 16px; font-weight: 500; color: var(--earth); }');
missing('time-main still has no explicit font-family override (inherits Futura from .app rather than pinning Outfit locally)', '.time-main { font-family');
missing('time-sub still has no explicit weight override (defaults to 400, unchanged by the family swap)', '.time-sub  { font-weight');
missing('time-sub still has no explicit font-family override (inherits Futura from .app rather than pinning Outfit locally)', '.time-sub  { font-family');

// ─── docs/step2-styling-parity.md, sub-steps 2+3: rhythm and alignment ────
// One uniform 22px inter-block gap, no per-element nudges. 623px column via a
// scoped .step2-block override (671 = 623 + existing 24px side padding), not
// a global width change (keeps Steps 1 and 3 untouched).
has('.step2-block and .body override to 671px, so both Step 2 and Step 1 land at the shared 623px content width (Figma card rebuild, Step 2 consistency)', '.main > .step2-block, .main > .body { max-width: 671px; }');
has('EXPR_A (details block) tagged step2-block', 'className: "body fu step2-block"');
has('step2-section-box fu step2-block wrapper used by both EXPR_B (summary/total/notes/Send/notice block, batch 5 Commit 3) and the rider-info card (moved here 1 Sep 2026 RIDER-INFO-UNDER-SUMMARY)', 'className: "step2-section-box fu step2-block"', 2);
has('cost-funds block tagged step2-block', 'className: "cost-funds-card fu step2-block"');
has('detail-header-card trailing gap now the uniform 22px (was 18px)', '.detail-header-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 20px 18px;\n  margin-top: -48px;\n  margin-bottom: 22px;\n}');
has('section-hint trailing gap now the uniform 22px (was 20px), covers isWhisper/BYO/dateTimeHint', '.section-hint {\n  font-family: var(--body);\n  font-weight: 400;\n  font-size: 12px;\n  color: var(--dusk);\n  margin-bottom: 22px;');
missing('isWhisper hint no longer uses the negative-margin jam-against-heading hack', 'isWhisper && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style:');
missing('isPhotoshoot (BYO Photographer) hint no longer uses the negative-margin hack, now gets a real defined slot', 'isPhotoshoot && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style:');
missing('section 1\'s old collapsed-summary paragraph (duration/date/time) is gone - dateTimeHint is now the permanent line shown regardless of collapse state', '}, t.dateTimeHint), section1Collapsed && /*#__PURE__*/React.createElement("p", {');
has('duration control-card and rider-card share identical padding (23/16.5/25) and the uniform 22px gap (styling parity sub-step 3)', '.rider-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
has('cal-selection-panel (date readout + time slot) gets the trailing 22px gap before the next block, not cal-legend (keeps the dark calendar card visually seamless)', '.cal-selection-panel {\n  padding: 20px 24px;\n  margin-bottom: 22px;\n}');
missing('cal-legend itself has no margin-bottom (stays flush with cal-selection-panel, one continuous card)', '.cal-legend {\n  padding: 12px 24px;\n  background: var(--earth);\n  display: flex;\n  gap: 16px;\n  border-top: 1px solid rgba(255,255,255,0.06);\n  border-radius: 0 0 14px 14px;\n  margin-bottom');
has('heading 2 no longer carries an inline marginTop:24 nudge', 'duration && (!needsGrooming || grooming) && /*#__PURE__*/React.createElement("div", {\n    className: "fu2 control-card"');
has('grooming card gets its own trailing 22px via inline style, not the shared .fu2 class (avoids touching every other .fu2 element site-wide)', 'className: "fu2",\n    style: {\n      marginBottom: 22,\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.groomingLabel)');
has('heading 3 no longer carries an inline marginTop:24 nudge', 'summaryPendingHint), React.createElement("div", {\n    className: "confirm-summary",');
has('confirm-summary gets its trailing 22px via inline style scoped to the Step 2 instance only, not the shared class (Step 3 confirm screen summary is untouched); also display-gated on section3Collapsed (batch 7: section 3 accordion)', 'summaryPendingHint), React.createElement("div", {\n    className: "confirm-summary",\n    style: {\n      marginBottom: 22,\n      display: section3Collapsed ? "none" : undefined\n    }\n  }');
has('Step 3 confirm screen summary card has no margin override (only Step 2\'s in-page copy was touched)', 'React.createElement("div", {\n    className: "confirm-summary"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "sum-row"');
has('addon-group now uses trailing margin-bottom (22px) instead of a leading margin-top nudge', '.addon-group { margin-bottom: 22px; }');
missing('addon-group no longer uses margin-top', '.addon-group { margin-top');
has('notes-time-hint negative-margin hack removed, kept as a small heading-to-hint gap (not part of the 22px block rhythm); weight 300 on var(--body) (was implicit 400, lightened by the body-copy weight sweep)', '.notes-time-hint { font-family: var(--body); font-size: 11.5px; font-weight: 300; color: var(--dusk); margin-bottom: 8px; line-height: 1.4; }');
has('notes-area trailing gap now the uniform 22px (was 16px)', 'transition: border 0.18s;\n  margin-bottom: 22px;\n}');
has('Send button (Step 2 instance) overrides the shared .cta margin locally: 0 top, 22 bottom', 'className: "cta",\n    style: {\n      marginTop: 0,\n      marginBottom: 22,\n      display: section3Collapsed ? "none" : undefined\n    },\n    disabled: !selectedTime || !detailsComplete');
has('notice trailing gap now the uniform 22px (was 16px), sits last before the always-visible cost-funds block', '.notice {\n  background: #f7f7f7;\n  border: 1px solid #dcdcdc;\n  border-radius: 10px;\n  padding: 12px 14px;\n  font-family: var(--body);\n  font-weight: 400;\n  font-size: 12px;\n  color: #444444;\n  line-height: 1.5;\n  margin-bottom: 22px;');

// ─── docs/booking-engine-structural-spec.md, Commit D: copy cleanup ───────
missing('no em-dashes left anywhere in translation copy, the meta description, or the WhatsApp message builder (standing CLAUDE.md rule)', 'sentTitle: "WhatsApp has opened in another window —');
has('en sentTitle now reads as two sentences', 'sentTitle: "WhatsApp has opened in another window. Please hit send to make the booking request",');
has('id sentTitle now reads as two sentences', 'sentTitle: "WhatsApp telah terbuka di jendela lain. Silakan tekan kirim untuk membuat permintaan pemesanan",');
has('ru sentTitle now reads as two sentences', 'sentTitle: "WhatsApp открылся в другом окне. Нажмите «отправить», чтобы оформить запрос на бронирование",');
has('meta description em-dash replaced with a natural appositive comma', '<meta name="description" content="Book a horse riding experience at Salty Cowboy, a Bali horse rescue sanctuary & riding centre." />');
has('WhatsApp message title no longer uses an em-dash', 'lines.push("🐴 *New Salty Cowboy booking request*");');
has('WhatsApp rider tag line uses a comma, not an em-dash', 'if (parts.length) line += ", " + parts.join(", ");');
has('WhatsApp heavy-rider warning uses a comma, not an em-dash', 'lines.push("⚠️ " + heavy + " rider(s) over 70kg, needs a heavier-weight horse");');
has('WhatsApp empty-notes placeholder reads "None", not a bare em-dash', 'lines.push("Notes: " + (notes && notes.trim() ? notes.trim() : "None"));');
missing('no em-dash left in any activity description across en/id/ru', 'natural horsemanship —');
missing('confirm-icon flower emoji (🌺) removed from the confirm screen', '"🌺"');
missing('confirm-icon CSS class removed as dead code alongside its JSX', '.confirm-icon {');
missing('notice seedling-equivalent emoji (🌿) removed', '"🌿"');

// ─── docs/step2-batch3.md, Commit 1: spacing fixes (#4, #6) ───────────────
// #4: duration card padding and column alignment were already correct from
// the styling-parity commit (verified live). Only the label-to-pill-row gap
// needed the fix, scoped to the duration label only, not the shared
// .act-category class (which numPeople/grooming/notes labels also use).
has('duration label now has the type-scale 14px gap to its pill row (#4)', 'className: "act-category",\n    style: {\n      marginTop: 0,\n      marginBottom: 14\n    }\n  }, t.duration)');
has('control-card padding already matched the spec (23/16.5/25) before this commit, confirmed unchanged', '.control-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
// #6: cost-funds alignment verified live already correct via .step2-block
// (671px outer / 623px inner) from the styling-parity commit, no code change.
has('cost-funds-card already tagged step2-block from the styling-parity commit, confirmed still aligned to the 623px column (#6, no change needed)', 'className: "cost-funds-card fu step2-block"');

// ─── docs/step2-batch3.md, Commit 2: BYO line as a filled chip (#2) ───────
// Ro's override: filled/selected-pill visual, static (no button, no onClick),
// photoshoot activities only.
has('.byo-chip now a hairline chip (thin light border, no fill) per Ro, less visually loud than the dark filled pill', '.byo-chip {\n  display: inline-block;\n  margin-bottom: 22px;\n  padding: 9.5px 16.5px;\n  border: 1px solid var(--fog);\n  border-radius: 24px;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 13px;\n  background: #fff;\n  color: var(--earth);\n}');
missing('byo-chip JSX has no onClick (static, not a button, per Ro\'s explicit override)', 'className: "byo-chip",\n    onClick');
has('byo-chip still gated on isPhotoshoot only, same conditional as before (rides/lessons never render it)', 'isPhotoshoot && /*#__PURE__*/React.createElement("span", {\n    className: "byo-chip"\n  }, t.byoPhotographer)');
missing('old section-hint paragraph treatment for the BYO line is gone', 'isPhotoshoot && /*#__PURE__*/React.createElement("p"');
has('byo-chip keeps its own 22px trailing gap before heading 1, same rhythm as every other Step 2 block', '.byo-chip {\n  display: inline-block;\n  margin-bottom: 22px;');

// ─── docs/step2-batch3.md, Commit 3: header image band (#1) ───────────────
// Ro's overrides: placeholder box (no per-activity images yet), card
// overlaps the image (floating-card pattern), Back restyled as a button.
has('.detail-header-image placeholder band added, 269px per the original Figma header', '.detail-header-image {\n  width: 100%;\n  height: 269px;\n  background: var(--fog);\n  border-radius: 14px;\n}');
has('back-link is now the first child of the body, sitting on white before the image band (batch 5, Commit 3)', 'className: "body fu step2-block"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "back-link",\n    onClick: () => setScreen("activity")\n  }, t.back), /*');
has('detail-header-image now conditionally styled with actObj.image, falling back to the plain --fog placeholder when unset; background-position reads actObj.imagePosition (per-activity, optional) falling back to plain "center" - each source photo\'s composition dictates whether the fixed-269px-tall, much-wider-on-desktop band needs a crop bias at all', 'className: "detail-header-image",\n    style: actObj?.image ? {\n      backgroundImage: "url(" + actObj.image + ")",\n      backgroundSize: "cover",\n      backgroundPosition: actObj.imagePosition || "center"\n    } : undefined\n  }), /*#__PURE__*/React.createElement("div", {\n    className: "detail-header-card"');
has('beach ride\'s imagePosition tuned to "center 28%", found empirically by testing live at the true 623px desktop width - gets the rider\'s full smiling face and the horse\'s eyes both in frame together', 'image: "images/beach-ride.jpg",\n    imagePosition: "center 28%"');
has('insta ride\'s imagePosition tuned to "center 80%" - its source photo is a wide scenic beach shot with the rider small and low in an otherwise empty-sky frame, so a plain centered crop on the wide desktop band showed nothing but sky', 'image: "images/insta-ride.avif",\n    imagePosition: "center 80%"');
missing('photo_paddock\'s old imagePosition tuning (was "center 70%", for a Step 2 header band crop that no longer renders for any photoshoot activity) is gone along with the flag itself', 'imagePosition: "center 70%"');
has('detail-header-card pulls up 48px to overlap the image (text-on-card-on-image, floating card)', 'margin-top: -48px;');
has('back-link hover is a plain colour darken, matching the .hint-link convention (batch 5, Commit 3)', '.back-link:hover { color: #000000; }');
missing('back-link hover no longer tints a background (button chrome removed)', '.back-link:hover { background: rgba(0,0,0,0.05); }');
missing('back-link no longer uses the old text-link hover-to-dark pattern', '.back-link:hover { color: var(--earth); }');

// ─── docs/step2-batch3.md, Commit 5: progression-driven accordions (#3) ───
// Payload safety: buildWhatsAppMessage is called with named state values
// (formattedDates, selectedTime, numPeople, riders, etc.), never a DOM
// query, so CSS-hiding collapsed sections cannot blank out the payload.
has('section1Complete derived from existing dates/time state, no new click-toggle state', 'const section1Complete = datesComplete && !!selectedTime;');
missing('no new expandedSection/activeSection click-toggle state introduced', 'expandedSection');
has('toggleSection2/toggleSection3 helpers introduced deliberately this time (batch 10: blocked-note), so the open-ahead-of-sequence check lives in one place instead of duplicated across the heading and hint paragraph; toggleSection3\'s guard now checks section1Complete && detailsComplete (both sections 1 and 2), not just datesComplete', 'function toggleSection2() {\n    if (section2Collapsed && !section1Complete) {\n      setBlockedSection(2);\n    } else {\n      setSection2Override(!section2Collapsed);\n    }\n  }\n  function toggleSection3() {\n    if (section3Collapsed && !(section1Complete && detailsComplete)) {\n      setBlockedSection(3);\n    } else {\n      setSection3Override(!section3Collapsed);\n    }\n  }');
has('handleEditClick forces sections 1 and 2 open directly (bypassing toggleSection2\'s precondition guard) since Edit is a deliberate review/change request, not sequential progression, then scrolls to top', 'function handleEditClick() {\n    setSection1Override(false);\n    setSection2Override(false);\n    window.scrollTo({ top: 0, behavior: "smooth" });\n  }');
has('en notice carries the hourglass emoji (Ro asked it be put back), awaiting deliberately stays without one', 'notice: "⏳ Your selected date and time will be confirmed by Salty Cowboy through WhatsApp."');
has('id notice carries the hourglass emoji', 'notice: "⏳ Tanggal dan waktu yang Anda pilih akan dikonfirmasi oleh Salty Cowboy melalui WhatsApp."');
has('ru notice carries the hourglass emoji', 'notice: "⏳ Выбранные вами дата и время будут подтверждены Salty Cowboy через WhatsApp."');
has('buildWhatsAppMessage takes formattedDates as a named param, not a DOM read', 'function buildWhatsAppMessage({\n  actObj,\n  durationLabel,\n  formattedDates,\n  isCourse,\n  selectedTime,\n  numPeople,\n  riders,');
has('buildWhatsAppMessage now also takes totalPriceStr as a named param, same state-not-DOM pattern as every other field', 'grooming,\n  totalPriceStr\n}) {');
has('final price line reads T.en.totalCostLabel ("Total cost"), matching the site\'s own English label text rather than a new hardcoded string, sits right after Group size (and the bookingForOther line, added 29 Aug 2026 BOOKING-FOR-OTHER) and before the blank line into *Riders:*, and is skipped entirely if totalPriceStr is falsy (e.g. duration/numPeople/selPrice not all chosen yet)', 'lines.push("Group size: " + numPeople);\n  if (bookingForOther) lines.push("Booking on behalf of another rider. 75kg weight guideline shown to the person booking.");\n  if (totalPriceStr) lines.push(T.en.totalCostLabel + ": " + totalPriceStr);\n  lines.push("");\n  lines.push("*Riders:*");');
has('handleSend passes riders/numPeople/selectedTime from state into buildWhatsAppMessage, not the DOM', 'const message = buildWhatsAppMessage({\n      actObj,\n      durationLabel: duration,\n      formattedDates,\n      isCourse,\n      selectedTime,\n      numPeople,\n      riders,');
missing('no document.querySelector calls anywhere in the app (payload assembly cannot depend on collapsed/hidden DOM state)', 'document.querySelector');
has('section 1 calendar block (cal-header) CSS-hidden on completion, not unmounted (stays out of a new conditional gate)', 'className: "cal-header",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  },');
has('section 1 cal-grid CSS-hidden on completion, still mounted', 'className: "cal-grid",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }');
has('section 1 cal-legend CSS-hidden on completion, still mounted', 'className: "cal-legend",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }');
has('section 1 cal-selection-panel (date+time readout) CSS-hidden on completion, still mounted', 'className: "cal-selection-panel",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }');
missing('section 1\'s old duration/date/time collapsed-summary line is gone entirely (Ro asked dateTimeHint to be the permanent line instead, doing double duty as the click-to-reopen affordance when collapsed)', '[duration, formattedDates.join(" · "), selectedTime].filter(Boolean).join(" · ")');
has('section 2 rider-card keeps its key/animationDelay AND gains a display toggle, proving it stays mounted (not conditionally removed)', 'className: "rider-card fu",\n      style: {\n        animationDelay: idx * 0.06 + "s",\n        display: section2Collapsed ? "none" : undefined\n      }');
// Only the photographer add-on still uses the "addon-group" CSS-hide-on-
// completion pattern; booking-for-other moved out of section 2's accordion
// entirely on 1 Sep 2026 (RIDER-INFO-UNDER-SUMMARY), so it no longer needs
// the section2Collapsed hide.
has('section 2 addon-group CSS-hide pattern used by the photographer add-on only (booking-for-other moved out of the accordion into its own card under the booking summary, 1 Sep 2026 RIDER-INFO-UNDER-SUMMARY, so it no longer needs the section2Collapsed hide)', 'className: "addon-group",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }', 1);
has('photographer add-on addon-group followed by the addon-title div', 'className: "addon-group",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "addon-title"\n  }, t.addonTitle)');
has('rider-info card wrapper is step2-section-box, not addon-group (1 Sep 2026 RIDER-INFO-UNDER-SUMMARY, since it is no longer inside the collapsible section-2 accordion), followed directly by its own perm-row, no addon-title', 'className: "step2-section-box fu step2-block"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "perm-row addon-row",\n    onClick: () => {\n      const next = !bookingForOther;\n      setBookingForOther(next);\n      if (next) setShowRiderInfoModal(true);\n    }\n  }');

// ─── BOOKING-FOR-OTHER (29 Aug 2026): checkbox for riding activities only ──
has('bookingForOther boolean state', 'const [bookingForOther, setBookingForOther] = useState(false);');
has('defensive reset when isRiding goes false, on top of the activity-change reset calls', 'useEffect(() => {\n    if (!isRiding) setBookingForOther(false);\n  }, [isRiding]);');
has('rider-info card gated on screen === "riders" && isRiding && riders.length > 0 (1 Sep 2026 RIDER-INFO-UNDER-SUMMARY: moved out from section 2\'s addon-group, which only needed the isRiding && riders.length > 0 half of this gate since it was already inside a screen === "riders" block)', '"✕")), screen === "riders" && isRiding && riders.length > 0 && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"');
has('checkbox toggles bookingForOther, checked state reflected in perm-box', 'className: "perm-box " + (bookingForOther ? "checked" : "")\n  }, bookingForOther ? "✓" : ""), /*#__PURE__*/React.createElement("div", {\n    className: "perm-text"\n  }, t.bookingForOtherLabel)');
has('reopen prompt only rendered when bookingForOther is checked, reuses the weight-warning visual pattern and opens the rider-info modal on click (1 Sep 2026 RIDER-INFO-MODAL, replaced the old static note)', 'bookingForOther && /*#__PURE__*/React.createElement("div", {\n    className: "weight-warning",\n    onClick: () => setShowRiderInfoModal(true),\n    style: {\n      cursor: "pointer"\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "ww-header"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "ww-icon"\n  }, "📋"), /*#__PURE__*/React.createElement("div", {\n    className: "ww-body"\n  }, t.riderInfoReopenNote)');
has('en bookingForOtherLabel', 'bookingForOtherLabel: "I\'m booking for someone else"');
has('en bookingForOtherNote', 'bookingForOtherNote: "Please check the weight of the person you\'re booking for. We know it\'s a slightly awkward thing to ask, but for the wellbeing of our horses we hold to a rider weight guideline of 75kg. It\'s what keeps every horse healthy and comfortable, so we can keep offering these rides for years to come. Please note we\'re unable to offer refunds where this limit is exceeded, and weight may be confirmed at the stables if needed."');
has('id bookingForOtherLabel', 'bookingForOtherLabel: "Saya memesan untuk orang lain"');
has('ru bookingForOtherLabel', 'bookingForOtherLabel: "Я бронирую для другого человека"');
has('bookingForOtherLabel/Note declared exactly 3 times (once per language)', 'bookingForOtherLabel:', 3);
has('bookingForOther threaded into buildWhatsAppMessage params', 'notes,\n  photographerAddon,\n  bookingForOther,\n  grooming,\n  totalPriceStr\n}) {');
has('bookingForOther payload line, additive after Group size', 'if (bookingForOther) lines.push("Booking on behalf of another rider. 75kg weight guideline shown to the person booking.");');
has('bookingForOther gated on isRiding in handleSend, mirroring the photographerAddon/isPhotoshoot pattern', 'bookingForOther: isRiding ? bookingForOther : false,');

// ─── RIDER-INFO-MODAL (1 Sep 2026): popup shown when bookingForOther is ──
// checked, with everything the actual rider needs to know (arrival time,
// weight guideline, where the money goes), plus a message the booker can
// copy and forward. Opens automatically on check; the reopen prompt above
// (tests around line 609) lets the booker view/copy it again after closing.
has('showRiderInfoModal and riderInfoCopied state', 'const [showRiderInfoModal, setShowRiderInfoModal] = useState(false);\n  const [riderInfoCopied, setRiderInfoCopied] = useState(false);');
has('checkbox opens the modal only when turning the box on, not when turning it off', 'onClick: () => {\n      const next = !bookingForOther;\n      setBookingForOther(next);\n      if (next) setShowRiderInfoModal(true);\n    }');
has('single defensive effect closes the modal (and resets its copy feedback) whenever bookingForOther goes false, covering every reset path without touching each call site', 'useEffect(() => {\n    if (!bookingForOther) {\n      setShowRiderInfoModal(false);\n      setRiderInfoCopied(false);\n    }\n  }, [bookingForOther]);');
has('buildRiderInfoMessage builds the copyable message in the booker\'s own site language (t), unlike buildWhatsAppMessage which is always English', 'function buildRiderInfoMessage({ t, actObj, formattedDates, selectedTime }) {');
has('riderInfoMessage intro/closing lines plus activity and date/time summary, reusing t.sActivity/t.sDateTime rather than new keys', 'lines.push(t.riderInfoMsgIntro);\n  lines.push("");\n  if (actObj) lines.push(t.sActivity + ": " + t.activities[actObj.id]);\n  if (formattedDates && formattedDates.length) {\n    lines.push(t.sDateTime + ": " + formattedDates[0] + (selectedTime ? " · " + selectedTime : ""));\n  }');
has('riderInfoMessage includes arrival, weight and money-goes sections, reusing t.costFundsTitle/t.moneyGoesBody rather than duplicating the funds copy', 'lines.push(t.riderInfoArrivalTitle + ": " + t.riderInfoArrivalBody);\n  lines.push("");\n  lines.push(t.riderInfoWeightTitle + ": " + t.riderInfoWeightBody);\n  lines.push("");\n  lines.push(t.costFundsTitle + ": " + t.moneyGoesBody);');
has('riderInfoMessage computed once per render as a derived const, shared by the modal display and the copy handler', 'const riderInfoMessage = buildRiderInfoMessage({ t, actObj, formattedDates, selectedTime });');
has('copyRiderInfoMessage mirrors copyMessage\'s clipboard-then-fallback pattern, 2s "Copied!" feedback', 'function copyRiderInfoMessage() {\n    const done = () => {\n      setRiderInfoCopied(true);\n      setTimeout(() => setRiderInfoCopied(false), 2000);\n    };\n    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {\n      navigator.clipboard.writeText(riderInfoMessage).then(done).catch(() => fallbackCopy(riderInfoMessage, done));\n    } else {\n      fallbackCopy(riderInfoMessage, done);\n    }\n  }');
has('modal rendered as the first child of .app (position:fixed escapes .app\'s overflow:hidden the same way .gallery-lightbox already does, so DOM position within the flex layout doesn\'t matter)', 'className: "app"\n  }, showRiderInfoModal && /*#__PURE__*/React.createElement("div", {\n    className: "rider-info-backdrop",\n    onClick: () => setShowRiderInfoModal(false)\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "rider-info-modal",\n    onClick: e => e.stopPropagation()\n  }');
has('modal close button plus title/sub, backdrop click closes via the outer onClick, card click stops propagation so clicking inside never closes it', 'className: "rider-info-close",\n    type: "button",\n    onClick: () => setShowRiderInfoModal(false)\n  }, "✕"), /*#__PURE__*/React.createElement("div", {\n    className: "rider-info-title"\n  }, t.riderInfoTitle), /*#__PURE__*/React.createElement("p", {\n    className: "rider-info-sub"\n  }, t.riderInfoSub)');
has('modal\'s copy-box reuses the confirm screen\'s existing copy-box/copy-heading/copy-text/copy-btn classes rather than inventing new ones', 'className: "copy-box"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "copy-heading"\n  }, t.riderInfoMsgHeading), /*#__PURE__*/React.createElement("div", {\n    className: "copy-text"\n  }, riderInfoMessage), /*#__PURE__*/React.createElement("button", {\n    className: "copy-btn " + (riderInfoCopied ? "done" : ""),\n    onClick: copyRiderInfoMessage\n  }, riderInfoCopied ? t.copied : t.copyBtn)');
has('rider-info-backdrop/modal CSS declared (position:fixed overlay, centered card, matches .gallery-lightbox\'s established full-viewport-overlay pattern)', '.rider-info-backdrop {\n  position: fixed;\n  inset: 0;');
has('en riderInfoArrivalBody: new 15-minutes-early copy, not present anywhere in the app before this feature', 'riderInfoArrivalBody: "Please arrive 15 minutes before the start time, so there\'s time to get settled and briefed before heading out."');
has('en riderInfoTitle/riderInfoMsgIntro', 'riderInfoTitle: "Info for the person you\'re booking for"');
has('id riderInfoArrivalBody', 'riderInfoArrivalBody: "Mohon datang 15 menit sebelum waktu mulai, agar ada waktu untuk bersiap dan mendapat pengarahan sebelum berangkat."');
has('ru riderInfoArrivalBody', 'riderInfoArrivalBody: "Пожалуйста, приезжайте за 15 минут до начала, чтобы успеть устроиться и пройти инструктаж перед выездом."');
has('all 10 riderInfo* copy keys declared exactly 3 times each (once per language)', 'riderInfoTitle:', 3);
has('riderInfoReopenNote declared exactly 3 times (once per language)', 'riderInfoReopenNote:', 3);
missing('section 2\'s old numPeople collapsed-summary line is gone entirely (Ro asked section2Subtitle to be the permanent line instead, doing double duty as the click-to-reopen affordance when collapsed)', 'numPeople, " ", numPeople === "1" ? t.person : t.people), duration && (!needsGrooming || grooming)');

// ─── docs/batch4-step1-cleanup-accordions.md, Commit 2: manual toggle ─────
// Reuses section1Complete/detailsComplete for the open/close decision; the
// manual flags only override which side of that state the section shows,
// so there is no parallel completion system.
has('section1Override/section2Override/section3Override are plain UI toggle state (tri-state: null = no manual interaction, true/false = user explicitly set it), not a new completion system', 'const [section1Override, setSection1Override] = useState(null);\n  const [section2Override, setSection2Override] = useState(null);\n  const [section3Override, setSection3Override] = useState(null);');
has('section1Collapsed reuses section1Complete as the default, overridden by section1Override once the user has toggled it - the chevron is clickable at all times now, not just once complete', 'const section1Collapsed = section1Override !== null ? section1Override : section1Complete;');
has('section2Collapsed default is a sequential reveal (closed until section 1 is done, opens once it is, auto-collapses again once section 2\'s own fields are complete too), overridden by section2Override once the user has toggled it', 'const section2Collapsed = section2Override !== null ? section2Override : (!section1Complete || detailsComplete);');
has('section1Collapsed reset effect: clearing a required field forces section1Override back to null (i.e. back open), the same safety guarantee as before, now reachable from a manually-collapsed state too', 'useEffect(() => {\n    if (!section1Complete) setSection1Override(null);\n  }, [section1Complete]);');
has('section2Collapsed reset effect: clearing a required field forces section2Override back to null (i.e. back open)', 'useEffect(() => {\n    if (!detailsComplete) setSection2Override(null);\n  }, [detailsComplete]);');
missing('no parallel/duplicate completeness calculation introduced for the accordions', 'const section1Complete2');
has('section 1 heading is always clickable now (Ro asked for open/close at any time, not gated behind completion)', 'className: "section-title section-title-toggle",\n    onClick: () => setSection1Override(!section1Collapsed)');
has('section 2 heading always clickable now, routed through toggleSection2 (blocks opening early with the note instead, but never blocks closing)', 'className: "section-title section-title-toggle",\n    onClick: toggleSection2');
has('section 1 heading toggle-flip handler (the permanent dateTimeHint paragraph now reuses the same setSection1Override call inline in its own conditional onClick, not this exact string, since it\'s only wired up while collapsed)', 'onClick: () => setSection1Override(!section1Collapsed)', 1);
has('section 1\'s permanent hint is clickable to reopen only while collapsed, reusing the same override toggle', 'style: {\n      cursor: section1Collapsed ? "pointer" : undefined,\n      marginBottom: section1Collapsed ? 0 : undefined\n    },\n    onClick: section1Collapsed ? () => setSection1Override(!section1Collapsed) : undefined\n  }, t.dateTimeHint)');
has('section 2\'s permanent subtitle is always clickable (open or collapsed), routed through toggleSection2 same as the heading', 'style: {\n      cursor: "pointer",\n      marginBottom: section2Collapsed ? 0 : undefined\n    },\n    onClick: toggleSection2\n  }, t.section2Subtitle)');
has('.section-title-toggle CSS lays the header out flex space-between so the chevron sits far right, opposite the section number (Figma mockup)', '.section-title-toggle {\n  cursor: pointer;\n  user-select: none;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}');
has('.section-toggle-arrow is an inline SVG stroke chevron (currentColor), not a text glyph', '.section-toggle-arrow {\n  flex-shrink: 0;\n  margin-left: 8px;\n  color: var(--dusk);\n  transition: transform 0.15s;\n}');
has('SectionChevron helper draws a single 1.5px-stroke currentColor path, rotated 180deg when open rather than swapping glyphs, 16x16', 'function SectionChevron(open) {\n  return /*#__PURE__*/React.createElement("svg", {\n    className: "section-toggle-arrow",\n    width: 16,\n    height: 16,');
missing('no text-glyph triangle characters left anywhere in the accordion chevrons', 'section1Collapsed ? "▾" : "▴"');
has('numPeople control-card style object still gates solely on the collapsed flag, manual reopen does not require touching detailsComplete directly (single source of truth preserved); duration lost its control-card entirely in batch 5, Commit 3', 'className: "fu2 control-card",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }');

// ─── docs/batch4-step1-cleanup-accordions.md, Commit 1: Step 1 cleanup ────
// Deletions only: the dark "Where the money goes" card and the global Next
// button. Both were Step 1 (activity picker) only; Step 2's own cost-funds
// card and its moneyGoesBody copy are untouched.
missing('.money-goes card removed from Step 1', 'className: "money-goes"');
missing('.money-goes-title element removed', 'className: "money-goes-title"');
missing('.money-goes CSS rule removed as dead code', '.money-goes {');
missing('.money-goes-title CSS rule removed as dead code', '.money-goes-title {');
missing('.money-goes-body CSS rule removed as dead code', '.money-goes-body {');
has('Step 2 cost-funds-card is untouched and still renders moneyGoesBody (the two mission-statement instances were confirmed separate before deleting Step 1\'s)', 'className: "cost-funds-title"\n  }, t.costFundsTitle), /*#__PURE__*/React.createElement("p", {\n    className: "cost-funds-body"\n  }, t.moneyGoesBody)');
missing('global Next button (cta-dock) removed from Step 1', 'className: "cta-dock"');
missing('.cta-dock CSS rule removed as dead code', '.cta-dock {');
missing('.has-dock CSS rule removed as dead code (only consumer was the deleted cta-dock spacer)', '.has-dock {');
missing('has-dock class no longer applied to the Step 1 body wrapper', '"body fu has-dock"');
missing('next translation key removed from all three languages as dead code', 'next: "Next →"');
has('Step 1 body wrapper is now a plain "body fu" div, no reserved bottom padding for a dock that no longer exists', 'screen === "activity" && /*#__PURE__*/React.createElement("div", {\n    className: "body fu"\n  }, /*#__PURE__*/React.createElement("h2", {\n    className: "section-title"\n  }, t.chooseActivity)');
has('"Book →" is the sole navigation path off Step 1: sets activity plus every dependent reset AND advances the screen in one click, a strict superset of what tap-card-then-Next used to do', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerAddon(false);\n      setBookingForOther(false);\n      setGrooming(null);\n      // Clearing these here (not just duration/numPeople) matters: without\n      // it, a date/time picked for a previous activity can still satisfy\n      // section1Complete for the new one (same requiredDates, slot still\n      // valid), so section 1 would land pre-collapsed and section 2 would\n      // auto-open on a booking the user never actually confirmed.\n      setSelectedDates([]);\n      setSelectedTime(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');
has('tapping an act-card still only selects (sets state, no screen transition), the preview affordance was not removed, only the redundant global Next button was', 'className: "act-card " + (activity === item.id ? "selected" : ""),\n    onClick: () => {\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerAddon(false);\n      setBookingForOther(false);\n      setGrooming(null);\n      setSelectedDates([]);\n      setSelectedTime(null);\n    }\n  }');

// ─── docs/batch5-futura-headers-gate.md, Commit 1: sitewide Futura ────────
// Every explicit "font-family: 'Outfit'" declaration in the app's own
// injected stylesheet is gone; only var(--display) is used, whose own
// fallback chain ('Century Gothic', 'Outfit', sans-serif) is the sole
// intentional exception, per the doc's own carve-out.
missing('no explicit font-family: \'Outfit\' declarations remain anywhere (the --display token\'s own fallback chain is a --custom-property value, not a font-family: declaration, so it is unaffected by this check)', "font-family: 'Outfit'");
has('--display token itself is untouched: Futura first, Century Gothic and Outfit kept only as the sanctioned fallback chain', "--display: 'Futura', 'Century Gothic', 'Outfit', sans-serif;");
has('Google Fonts Outfit import back to wght@300;400;500;600 (the 200 weight added for the brief card-description experiment is no longer used by any rule, so it was dropped again)', "family=Outfit:wght@300;400;500;600");
has('.lang-btn (EN/ID/RU toggle) now Futura via var(--display)', '.lang-btn {\n  padding: 5px 12px;\n  border: 1px solid rgba(255,255,255,0.22);\n  background: transparent;\n  color: rgba(255,255,255,0.55);\n  border-radius: 20px;\n  font-size: 11px;\n  font-family: var(--display);');
has('.date-chip (Horse Whisperer day picker) now Futura via var(--display)', '.date-chip {\n  padding: 8px 14px;\n  border: 1.5px solid var(--earth);\n  background: var(--earth);\n  color: var(--sand);\n  border-radius: 24px;\n  font-size: 12px;\n  font-family: var(--display);');
has('.cat-tab (Rides/Photoshoots/Lessons tabs) now Futura via var(--display)', '.cat-tab { flex: 0 0 auto; white-space: nowrap; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--fog); background: #fff; color: var(--earth); font-family: var(--display);');
has('.act-book-btn ("Book ->") now Futura via var(--display)', '.act-book-btn {');
has('.notes-area (notes textarea) now Futura via var(--display)', '.notes-area {\n  width: 100%;\n  min-height: 84px;\n  padding: 12px 14px;\n  border: 1.5px solid var(--fog);\n  border-radius: 12px;\n  font-family: var(--display);');
has('.copy-btn (confirm screen Copy button) now Futura via var(--display)', '.copy-btn { margin-top: 10px; width: auto; padding: 10px 20px; border-radius: 12px; border: 1px solid var(--earth); background: #fff; color: var(--earth); font-family: var(--display);');
has('.reset-link (Make another booking) now Futura via var(--display)', '.reset-link {\n  background: none;\n  border: none;\n  color: var(--dusk);\n  font-size: 14px;\n  font-family: var(--display);');
has('.wa-btn (no-availability WhatsApp button) now Futura via var(--display)', '.wa-btn {\n  width: 100%;\n  padding: 13px;\n  background: #1a1a1a;\n  color: #fff;\n  border: none;\n  border-radius: 10px;\n  font-family: var(--display);');
has('#loading (pre-hydration splash, outside the app\'s own stylesheet/token system) intentionally kept its own Georgia serif treatment, a deliberate exclusion flagged for approval rather than silently converted', 'font-family: Georgia, \'Times New Roman\', serif;');

// ─── docs/batch5-futura-headers-gate.md, Commit 2: Step 1 headers + full-width Book ─
has('.cat-intro card background restored (batch 6: intro image removal reverses the batch 5, Commit 2 no-card look, now that there\'s no image left to bleed edge to edge)', '.cat-intro {\n  background: #f7f7f7;');
has('.cat-intro border restored, 16px radius per Figma (not the old 14px card radius)', '.cat-intro {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);\n  border-radius: 16px;');
missing('.cat-intro no longer clips with overflow: hidden (no image to clip now)', '.cat-intro {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  overflow: hidden;');
missing('.cat-intro-img CSS rule removed, no image left to style (batch 6: intro image removal)', '.cat-intro-img {\n  display: block;\n  width: calc(100% + 48px);\n  margin: 0 -24px;');
has('.act-book-btn ("Book ->") is now full width (display: block, width: 100%), no longer align-self: flex-start sized to its own text', '.act-book-btn {\n  display: block;\n  width: 100%;');
missing('.act-book-btn no longer uses align-self: flex-start (superseded by display:block/width:100%)', '.act-book-btn {\n  align-self: flex-start;');
has('"Book ->" handler is untouched by the width change: still sets activity, resets every dependent field, and advances to Step 2 in one click', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerAddon(false);\n      setBookingForOther(false);\n      setGrooming(null);\n      // Clearing these here (not just duration/numPeople) matters: without\n      // it, a date/time picked for a previous activity can still satisfy\n      // section1Complete for the new one (same requiredDates, slot still\n      // valid), so section 1 would land pre-collapsed and section 2 would\n      // auto-open on a booking the user never actually confirmed.\n      setSelectedDates([]);\n      setSelectedTime(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');

// ─── docs/batch5-futura-headers-gate.md, Commit 3: Step 2 boxing + destructure ─
// Structural correctness of the two new step2-section-box wrappers was
// verified with an acorn AST parse (not just string matching): box 1 has
// exactly the 8 expected section-1 children (heading through
// cal-selection-panel) and box 2 has exactly the 7 expected section-2
// children (grooming through addon-group), nothing lost or duplicated.
has('.step2-section-box CSS matches the card system (same border/radius/padding as .control-card) for consistent boundaries across all three sections', '.step2-section-box {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
has('section 1 box wraps heading1 through cal-selection-panel (grooming and heading2 sit outside it, correctly starting section 2\'s box instead)', 'isPhotoshoot && /*#__PURE__*/React.createElement("span", {\n    className: "byo-chip"\n  }, t.byoPhotographer), /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box"\n  }, /*#__PURE__*/React.createElement("h3", {\n    className: "section-title section-title-toggle"');
has('section 1 box closes and section 2 box opens at the cal-selection-panel/grooming boundary, grooming is the first child inside section 2\'s box even though it renders before heading2', 'React.createElement("div", {\n    className: "step2-section-box"\n  }, needsGrooming && /*#__PURE__*/React.createElement("div", {\n    className: "fu2",');
has('section 2 box closes right after the photographer addon-group (1 Sep 2026 RIDER-INFO-UNDER-SUMMARY: booking-for-other moved out from here to its own card under the booking summary, restoring the pre-BOOKING-FOR-OTHER adjacency), then the section-2 blocked-note, immediately before section 3\'s own top-level div begins', '")"))))), blockedSection === 2 && /*#__PURE__*/React.createElement("div", {\n    className: "blocked-note"\n  }, /*#__PURE__*/React.createElement("span", null, t.section2Blocked), /*#__PURE__*/React.createElement("button", {\n    className: "blocked-note-close",\n    type: "button",\n    onClick: () => setBlockedSection(null)\n  }, "✕")), screen === "riders" && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"');
has('header material (image band, header card, isWhisper hint, byo-chip) stays outside/above both section boxes, not swept into section 1\'s box', 'className: "detail-header-card",\n    style: isPhotoshoot ? { marginTop: 0 } : undefined\n  }, /*#__PURE__*/React.createElement("h2", {\n    className: "section-title"\n  }, t.activities[actObj?.id]), /*#__PURE__*/React.createElement("p", {\n    className: "detail-desc"\n  }, t.descs[actObj?.id])), isWhisper && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint"');

// ─── Figma spacing audit, Step 1 (activity picker) ────────────────────────
// Applies the non-flagged resolved values from the export audit: content
// column bottom padding, the 22px block-rhythm gap (overriding Figma's raw
// 24px to match Step 2), the locked Step 2 card padding on act-card, and the
// remaining 1:1 spacing/radius corrections. The four flagged items (doubled
// top padding shared with Step 2, the missing text-block sub-column, the
// active-tab fill-vs-outline treatment, and the intro box's card-vs-bleed
// treatment) are deliberately left untouched pending Ro's call.
has('.body bottom padding now 112px per Figma content-column spec, sides/top stay 24px', '.body { padding: 24px 24px 112px; }');
has('Step 1 heading gets a 22px block-rhythm gap before the category tabs, scoped off Step 2 sections', '.body:not(.step2-block) > .section-title { margin-bottom: 22px; }');
has('.cat-tabs row spacing rebuilt around the 22px block gap (was 4px/14px padding + 2px margin)', '.cat-tabs { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 0 0 22px; margin: 0; scrollbar-width: none; }');
has('.cat-intro trailing gap stays 22px, completing the block-rhythm chain into the first act-category; padding 14px/17px and 16px radius per Figma\'s bordered-box spec (batch 6: intro image removal)', '.cat-intro {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);\n  border-radius: 16px;\n  padding: 14px 17px;\n  margin-bottom: 22px;\n  animation: fadeUp 0.3s ease both;\n}');
has('.act-book-btn padding now flat 16px and radius 14px, matching the Figma CTA spec and the site\'s other 14px-radius cards', '.act-book-btn {\n  display: block;\n  width: 100%;\n  margin-top: 10px;\n  padding: 16px;\n  border-radius: 14px;');

// ─── Body-copy weight sweep (descriptions/intro/hints/notes lightened one
// step: 500→400, 400→300; headings, tabs, prices, chips, labels, links and
// buttons excluded) ─────────────────────────────────────────────────────
has('session-note gets explicit weight 300 on var(--body) (was implicit 400 on inherited var(--display))', '.session-note { font-family: var(--body); font-size: 11.5px; font-weight: 300; color: var(--dusk); margin-top: 6px; line-height: 1.45; }');
has('sat-note gets explicit weight 300 on var(--body) (was implicit 400 on inherited var(--display))', '.sat-note {\n  font-family: var(--body);\n  font-size: 11.5px;\n  font-weight: 300;\n  color: #565656;');
has('confirm-sub gets explicit weight 300 on var(--body) (was implicit 400 on inherited var(--display))', '.confirm-sub {\n  font-family: var(--body);\n  font-size: 13px;\n  font-weight: 300;\n  color: var(--dusk);');
has('days-count weight 400 on var(--body) (was 500 on inherited var(--display), lightened by the body-copy weight sweep)', '.days-count {\n  font-family: var(--body);\n  font-size: 12px;\n  color: var(--dusk);\n  margin: 4px 0 18px;\n  font-weight: 400;\n}');
missing('labels, tabs, prices, chips, links and buttons excluded from the body-copy weight sweep: act-category eyebrow untouched', '.act-category {\n  font-family: var(--display);\n  font-size: 10px;\n  letter-spacing: 2px;\n  text-transform: uppercase;\n  color: var(--dusk);\n  margin-bottom: 10px;\n  margin-top: 18px;\n  font-weight: 300;');
missing('cat-tab weight untouched by the body-copy weight sweep (excluded: tabs)', '.cat-tab { flex: 0 0 auto; white-space: nowrap; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--fog); background: #fff; color: var(--earth); font-family: var(--display); font-size: 14px; font-weight: 300;');
missing('hint-link weight untouched by the body-copy weight sweep (excluded: interactive link)', '.hint-link {\n  font-family: var(--display);\n  color: var(--clay);\n  font-weight: 400;');

// ─── --body font token (root cause fix for weight requests silently
// clamping on macOS Futura, which only ships Medium/Bold with no lighter
// face) ──────────────────────────────────────────────────────────────────
has('--body token added, skips Futura on purpose so body-copy weight requests land on a font that actually has a lighter face (Century Gothic/Outfit both do; macOS system Futura only ships Medium/Bold)', "--body: 'Century Gothic', 'Outfit', sans-serif;");
missing('--display (headings/tabs/buttons/labels) still leads with Futura, untouched by the --body fix', '--display: \'Century Gothic\'');
has('hint-link, cat-tab, and act-category (all excluded from the weight sweep) still explicitly reference var(--display), not var(--body)', '.hint-link {\n  font-family: var(--display);');

// ─── free-chip repositioned under the card heading ────────────────────────
has('free-chip (Horse Whisperer "bring a friend free" badge) now sits inside act-titledesc, directly under act-name and before act-desc, instead of after price-tags', '}, /*#__PURE__*/React.createElement("div", {\n    className: "act-name"\n  }, t.activities[item.id]), item.id === "whisper" && /*#__PURE__*/React.createElement("div", {\n    className: "free-chip"\n  }, "🎁 " + t.friendFree), t.descs[item.id] ? /*#__PURE__*/React.createElement("div", {\n    className: "act-desc"');
missing('free-chip no longer has its own margin-top (redundant now that act-titledesc\'s 9px flex gap spaces it from act-name and act-desc on both sides)', '.free-chip {\n  display: inline-block;\n  margin-top: 8px;');

// ─── Section 3 becomes a closed-by-default accordion (batch 7) ────────────
// Section 3 has no fields of its own, so its collapse trigger is inverted
// from sections 1/2: collapsed whenever !datesComplete (nothing to review
// yet, no manual override possible), auto-opens once datesComplete, then
// toggleable via section3ManualCollapse same as 1/2's manual-open pattern.
has('section3Complete requires both section1Complete and detailsComplete (dates+time AND every accordion-2 field), so the summary stays collapsed until accordion 2 is fully filled out, not just once a date/time is picked; section3Collapsed is collapsed whenever section3Complete is false (default), overridden by section3Override once the user has toggled it', 'const section3Complete = section1Complete && detailsComplete;\n  const section3Collapsed = section3Override !== null ? section3Override : !section3Complete;');
has('section3Collapsed reset effect: when section3Complete stops being true (either section 1 or section 2 becomes incomplete again), section3Override resets to null (falls back to the default-collapsed state)', 'useEffect(() => {\n    if (!section3Complete) setSection3Override(null);\n  }, [section3Complete]);');
has('section 3 heading always shows the chevron (Figma mockup) and is now always clickable via toggleSection3 - opening it early shows the blocked-note instead of exposing an empty summary and a premature Send button', 'className: "section-title section-title-toggle",\n    onClick: toggleSection3\n  }, t.stepHeading3, SectionChevron(!section3Collapsed)');
has('section 3 collapsed hint shows a static "complete the steps above" placeholder before section3Complete (both sections 1 and 2 done, not just dates), or the total price if manually collapsed afterward; marginBottom: 0 since this paragraph is the box\'s last visible child whenever it renders at all (mutually exclusive with the display:none content that follows it in the DOM), so its base 22px section-hint margin was bleeding into the box\'s own bottom padding', 'section3Collapsed && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer",\n      marginBottom: 0\n    },\n    onClick: toggleSection3\n  }, section3Complete ? (totalPriceStr ? t.totalCostLabel + ": " + totalPriceStr : t.stepHeading3) : t.summaryPendingHint)');
has('en summaryPendingHint key', 'summaryPendingHint: "Complete the steps above to see your summary"');
has('id summaryPendingHint key', 'summaryPendingHint: "Selesaikan langkah-langkah di atas untuk melihat ringkasan Anda"');
has('ru summaryPendingHint key', 'summaryPendingHint: "Заполните шаги выше, чтобы увидеть итоги бронирования"');
has('section 3 always renders on the riders screen (no more datesComplete render gate), only its content visibility is display-gated', 'screen === "riders" && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"\n  }, React.createElement("h3", {\n    className: "section-title section-title-toggle",');

// ─── Step 2 card width parity ──────────────────────────────────────────────
// Section 3's box and the funds card both carry .step2-block AND .fu, so
// the generic .fu:not(.body):not(.confirm-screen) page-inset rule was
// adding its own 24px/side padding on top of the 671px allowance meant for
// .body to subtract that same padding from - rendering their card shell
// 48px wider than Section 1's actual 623px card (which sits inset inside
// .body and never carries the page-level inset itself). Verified live via
// getBoundingClientRect: all four cards land at width 623 and left 584.5,
// exactly equal, not just close. margin-left/right: auto is inherited
// unchanged from the existing `.main > *` rule, so centering came free
// once the widths matched - no separate centering fix was needed.
has('section 3\'s box, the funds card, and blocked-note share one base (all-widths) rule: width:calc(100% - 48px) reproduces .body\'s 24px-each-side inset directly at any container width (mobile), while max-width:623px + auto margins cap and center once the container is wide enough (desktop) - padding stays 16.5px purely for internal text inset, a separate concern from the outer width/position fix. Previously padding-left/right:24px alone was relied on for the outer inset, which does nothing to a block element\'s own outer width (box-sizing:border-box keeps the border edge at 100% of the container), so mobile - which never got the desktop max-width+auto-margin centering either - rendered all three flush against the screen edge', '.main > .step2-section-box.step2-block.fu,\n.main > .cost-funds-card.step2-block.fu,\n.main > .blocked-note {\n  width: calc(100% - 48px);\n  max-width: 623px;\n  margin-left: auto;\n  margin-right: auto;\n  padding-left: 16.5px;\n  padding-right: 16.5px;\n  box-sizing: border-box;\n}');
has('blocked-note deliberately left out of the shared .fu class (folded into the width-parity selector above by name instead), since .fu also carries a fadeUp entrance animation that gets stuck permanently at opacity 0 on elements that re-render as often as this one does', 'blocked-note is included here rather than via the\n   shared .fu class: it deliberately does not carry .fu, since .fu also\n   carries a fadeUp entrance animation');
has('.body.step2-block zeroes the shared 112px trailing padding for Step 2\'s instance only; Step 1\'s .body (no step2-block class) keeps the full 112px, since it still wraps its own true last element', '.body.step2-block { padding-bottom: 0; }');

// ─── Sections 1-3: bottom padding matches top (whichever child ends up
// last carries its own trailing margin-bottom, meant to space it from a
// next sibling block elsewhere on the page; when that same element is
// also the box's own last child, the margin bled into the box's 25px
// padding instead, inflating the bottom gap well past the 23px top).
// Verified live via getBoundingClientRect across every completion state:
// top gap 24px, bottom gap 26px, matching within the 1px border. ──────────
has('.step2-section-box > *:last-child zeroes whichever element ends up last (the heading alone, .section-hint, .cal-selection-panel, or a fuller state\'s control-card), so the box\'s own 25px bottom padding is always the sole source of bottom spacing, matching the 23px top', '.step2-section-box > *:last-child { margin-bottom: 0; }');

// ─── Figma mockup: always-visible chevron, open/close any time (batch 8) ──
has('en section2Subtitle key (2 Sep 2026 CLIENT-COPY-FEEDBACK)', 'section2Subtitle: "A few details to help us prep for your group."');
has('id section2Subtitle key', 'section2Subtitle: "Beberapa detail untuk membantu kami mempersiapkan grup Anda."');
has('ru section2Subtitle key', 'section2Subtitle: "Несколько деталей, чтобы помочь нам подготовиться к приёму вашей группы."');

// ─── Sequential reveal + permanent hints (batch 9) ─────────────────────────
// Section 2 now starts closed on Step 2 entry (section1Complete is false),
// auto-opens the moment section 1 completes, and auto-collapses again once
// its own fields are complete - a compound default rather than a single
// completion flag. Section 1 and 2 both keep their hint/subtitle visible
// regardless of collapse state now (Ro asked section 1 to match sections
// 2/3's "always show a line under the heading" pattern); the old data-
// driven collapsed-summary lines (duration/date/time, numPeople) are gone.
has('section1Complete is declared before section2Collapsed now (moved down from its old spot near detailsComplete), since section2Collapsed\'s new default formula depends on it', 'const section1Complete = datesComplete && !!selectedTime;');
has('section2Collapsed sits after section1\'s override/reset block in source order, not up near detailsComplete\'s declaration, so section1Complete is in scope', 'if (!section1Complete) setSection1Override(null);\n  }, [section1Complete]);\n  // Section 2\'s default (no manual override yet) is a sequential reveal');

// ─── Blocked-note: opening ahead of sequence (batch 10) ────────────────────
// Closing an already-open section always works; only OPENING one before its
// own precondition is met (section1Complete for section 2, datesComplete for
// section 3 - these differ, section 3 doesn't need the time to be picked)
// shows a small dismissible note instead of actually opening.
has('blockedSection state (null | 2 | 3) tracks which section\'s note is showing, auto-dismisses after 3s via a cleared-on-unmount timer', 'const [blockedSection, setBlockedSection] = useState(null);\n  useEffect(() => {\n    if (blockedSection === null) return;\n    const timer = setTimeout(() => setBlockedSection(null), 3000);\n    return () => clearTimeout(timer);\n  }, [blockedSection]);');
has('en section2Blocked/section3Blocked keys are precise to each section\'s actual gate: section 2 needs dates AND time (section1Complete), section 3 now needs both section 1 and every section 2 field (section1Complete && detailsComplete), not just a date', 'section2Blocked: "Please pick a date and time first",\n    section3Blocked: "Please complete steps 1 and 2 first",');
has('id section2Blocked/section3Blocked keys', 'section2Blocked: "Silakan pilih tanggal dan waktu terlebih dahulu",\n    section3Blocked: "Silakan selesaikan langkah 1 dan 2 terlebih dahulu",');
has('ru section2Blocked/section3Blocked keys', 'section2Blocked: "Пожалуйста, сначала выберите дату и время",\n    section3Blocked: "Пожалуйста, сначала завершите шаги 1 и 2",');
has('.blocked-note CSS has no animation - an earlier pass used the shared fadeUp keyframe, but this component re-renders often enough (many useState/useEffect hooks in one monolithic App function) that the animation kept restarting from frame zero, leaving the note stuck at opacity 0 for its entire visible lifetime. Verified live: with the animation removed, opacity reads 1 immediately', '.blocked-note {\n  background: #f7f7f7;\n  border: 1px solid #dcdcdc;\n  border-radius: 10px;\n  padding: 10px 14px;\n  margin-top: -2px;\n  margin-bottom: 22px;\n  font-family: var(--body);\n  font-weight: 400;\n  font-size: 12px;\n  color: #444444;\n  line-height: 1.5;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}');
has('.blocked-note-close is a plain unstyled button (background none, border none) styled to look like inline text, not a real button, matching the dusk color of other small close/dismiss affordances', '.blocked-note-close {\n  flex-shrink: 0;\n  background: none;\n  border: none;\n  padding: 0;\n  font-size: 15px;\n  line-height: 1;\n  color: var(--dusk);\n  cursor: pointer;\n}');
has('section 3\'s blocked-note sits right after the notice, before the funds card, so it always appears directly under section 3\'s own box regardless of whether the funds card renders', 'blockedSection === 3 && /*#__PURE__*/React.createElement("div", {\n    className: "blocked-note"\n  }, /*#__PURE__*/React.createElement("span", null, t.section3Blocked)');

// ─── Duration auto-select (batch 10, re-added after an earlier revert) ────
has('duration defaults to the first entry in actObj.durations once activity is set and duration is still null; depends on `activity` (primitive id), not `actObj` (re-derived every render via .find, which would refire this every render on reference inequality)', 'useEffect(() => {\n    if (actObj && actObj.durations && actObj.durations.length > 0 && duration === null) {\n      setDuration(actObj.durations[0]);\n    }\n  }, [activity]);');
has('isPastDate helper compares calendar dates only (time stripped), so bookings can be made for today itself but not any earlier date', 'function isPastDate(year, month, day) {\n  const d = new Date(year, month, day);\n  d.setHours(0, 0, 0, 0);\n  const today = new Date();\n  today.setHours(0, 0, 0, 0);\n  return d < today;\n}');
has('calMonth/calYear now default to the real current month/year via lazy useState initializers, not a hardcoded May 2026', 'const [calMonth, setCalMonth] = useState(() => new Date().getMonth());\n  const [calYear, setCalYear] = useState(() => new Date().getFullYear());');
missing('old hardcoded May 2026 calendar default is gone', 'useState(4); // May (0-indexed)');
has('isAvailableDay rejects any date before today, checked first so a past Monday still reads unavailable even though it would otherwise pass the day-of-week checks', 'function isAvailableDay(day) {\n    if (isPastDate(calYear, calMonth, day)) return false;');
has('atCurrentMonth flag blocks paging the calendar back past the current month', 'const atCurrentMonth = calYear === nowForCal.getFullYear() && calMonth === nowForCal.getMonth();');
has('changeMonth bails out on a back-navigation attempt once already at the current month', 'function changeMonth(delta) {\n    if (delta < 0) {\n      if (atCurrentMonth) return;');
has('prev-month cal-nav button is disabled once atCurrentMonth is true, so it cannot be clicked into a fully-past month', 'onClick: () => changeMonth(-1),\n    disabled: atCurrentMonth');
has('.cal-nav:disabled styling dims the button and drops the hover background so a disabled prev-month arrow reads as inert', '.cal-nav:disabled { opacity: 0.25; cursor: default; }\n.cal-nav:disabled:hover { background: none; }');

// ─── Report ──────────────────────────────────────────────────────────────
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass);
console.log(`Passed: ${passed} / ${results.length}`);
if (failed.length) {
  console.log('\nFAILED:');
  failed.forEach(f => {
    console.log(`  ✗ ${f.name}`);
    console.log(`      expected ${f.expectedCount} hits, got ${f.actual}`);
    if (f.needle.length < 160) console.log(`      needle: ${f.needle}`);
  });
  process.exit(1);
}
console.log('All checks pass ✓');
