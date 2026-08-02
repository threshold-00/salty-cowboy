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

// ─── ACTIVITIES data structure ───────────────────────────────────────────
has('photo_beach durations',       'id: "photo_beach",\n    icon: "🏖️",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 3,\n    perHorse: true,\n    photoshoot: true');
has('photo_stable 1-3hr',          'id: "photo_stable",\n    icon: "🏡",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_paddock 1-3hr',         'id: "photo_paddock",\n    icon: "🌾",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_cottages session, 6',   'id: "photo_cottages",\n    icon: "🛖",\n    durations: ["3hr"],\n    maxPeople: 6');
has('beach ride 1/1.5hr',          'id: "beach",\n    icon: "🌊",\n    durations: ["1hr", "1.5hr"]');
has('insta locked to 2hr',         'id: "insta",\n    icon: "🌅",\n    durations: ["2hr"]');
has('joinup perPerson',            'id: "joinup",\n    icon: "🔄",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2,\n    perPerson: true');
has('lunge perPerson',             'id: "lunge",\n    icon: "🎯",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2,\n    perPerson: true');
has('masterclass 1hr only',        'id: "masterclass",\n    icon: "🪮",\n    durations: ["1hr"],\n    maxPeople: 2');

// ─── SESSION_SLOTS added ─────────────────────────────────────────────────
has('SESSION_SLOTS declared',      'const SESSION_SLOTS = {');
has('SESSION_SLOTS 1hr',           '"1hr":   ["8:30am", "10:30am", "2:30pm", "4:30pm"]');
has('SESSION_SLOTS 1.5hr',         '"1.5hr": ["8:30am", "10:00am", "2:30pm", "4:00pm"]');
has('SESSION_SLOTS 2hr',           '"2hr":   ["8:30am", "9:30am",  "2:30pm", "3:30pm"]');
has('SESSION_SLOTS 3hr',           '"3hr":   ["8:30am", "2:30pm"]');

// ─── slotsFor routes correctly ───────────────────────────────────────────
has('slotsFor paddock/stable/cottages routing', 'photo_paddock" || actObj.id === "photo_stable" || actObj.id === "photo_cottages") list = SESSION_SLOTS');

// ─── Pricing multipliers ─────────────────────────────────────────────────
has('isPerHorse flag',             'const isPerHorse = !!(actObj && actObj.perHorse);');
has('isPerPerson flag',            'const isPerPerson = !!(actObj && actObj.perPerson);');
has('horseCount cap at 2',         'Math.min(peopleCount || 1, 2)');
has('perHorse basis text',         'isPerHorse) {\n    priceBasis = selPrice ? selPrice.v + " \\u00d7 " + (horseCount || 1)');
has('perPerson basis text',        'isPerPerson) {\n    priceBasis = selPrice ? selPrice.v + " \\u00d7 " + (peopleCount || 1)');

// ─── PHOTOGRAPHER_TIERS ──────────────────────────────────────────────────
has('PHOTOGRAPHER_TIERS declared', 'const PHOTOGRAPHER_TIERS = {');
has('photog 1hr tier',             'price: 2000000, photos: 20');
has('photog 1.5hr tier',           'price: 3000000, photos: 30');
has('photog 2hr tier',             'price: 4000000, photos: 40', 2); // once for "2hr", once for "3hr" cap
has('WhatsApp uses tier lookup',   'PHOTOGRAPHER_TIERS[durationLabel]');

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
has('insta 2hr only en',           'insta: [{ l: "2 hr", v: "IDR 2,400,000" }]');
has('insta 2hr only id',           'insta: [{ l: "2 jam", v: "IDR 2,400,000" }]');
has('insta 2hr only ru',           'insta: [{ l: "2 ч", v: "IDR 2,400,000" }]');
has('masterclass 1hr only en',     'masterclass: [{ l: "1 hr", v: "IDR 1,250,000" }]');
has('masterclass 1hr only id',     'masterclass: [{ l: "1 jam", v: "IDR 1,250,000" }]');
has('masterclass 1hr only ru',     'masterclass: [{ l: "1 ч", v: "IDR 1,250,000" }]');
missing('no masterclass 1.5hr price', '1,550,000');
missing('no masterclass 2hr price',   '1,900,000');
// stale joinup/lunge 2hr and derived paddock/stable 3hr both use 3,750,000
// after change: only 6 hits — paddock 3hr × 3 langs + stable 3hr × 3 langs
has('3,750,000 = paddock/stable 3hr × 3 langs', '3,750,000', 6);

// ─── Group / description copy updated ────────────────────────────────────
has('en photo_beach per horse',    'plus 1 person standing beside a horse. Price is per horse.');
has('en cottages max 6',           'Max 6 people per cottage. Choice of cottage upon availability.');
has('en joinup per person',        'joinup: "Max 2 people. Price is per person."');
has('en lunge per person',         'lunge: "Max 2 people. Price is per person."');
has('en cottages inside',          'Photos are taken inside the cottage');
has('id photo_beach per horse',    'Harga per kuda.');
has('id cottages max 6',           'Maks 6 orang per cottage');
has('ru photo_beach per horse',    'Цена за лошадь.');
has('ru cottages max 6',           'Максимум 6 человек на коттедж');

// ─── Intro / addon / sessionNote copy ────────────────────────────────────
has('en intro tiered photog',      'packages from IDR 2,000,000, 20 edited photos per hour');
has('en intro per horse',          'Beach shoots are priced per horse');
has('en addon tiered',             'Add a Salty Cowboy photographer (package matches your shoot: 1hr IDR 2M / 20 photos, 1.5hr IDR 3M / 30 photos, 2hr IDR 4M / 40 photos)');
has('en sessionNote one per week', 'Only one course booking is accepted per week.');
has('id sessionNote one per week', 'Hanya satu pemesanan kursus yang diterima per minggu.');
has('ru sessionNote one per week', 'В неделю принимается только одна бронь на курс.');

// ─── Report ──────────────────────────────────────────────────────────────
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass);
console.log(`Passed: ${passed} / ${results.length}`);
if (failed.length) {
  console.log('\nFAILED:');
  failed.forEach(f => {
    console.log(`  ✗ ${f.name}`);
    console.log(`      expected ${f.expectedCount} hits, got ${f.actual}`);
    if (f.needle.length < 120) console.log(`      needle: ${f.needle}`);
  });
  process.exit(1);
}
console.log('All checks pass ✓');
