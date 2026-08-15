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
has('photo_beach durations + needsWeight', 'id: "photo_beach",\n    icon: "🏖️",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 3,\n    perHorse: true,\n    photoshoot: true,\n    needsWeight: true');
has('photo_stable 1-3hr',          'id: "photo_stable",\n    icon: "🏡",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_ricefield clones stable config', 'id: "photo_ricefield",\n    icon: "🌾",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_paddock 1-3hr',         'id: "photo_paddock",\n    icon: "🐴",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_cottages session, 6',   'id: "photo_cottages",\n    icon: "🛖",\n    durations: ["3hr"],\n    maxPeople: 6');
has('beach ride 1/1.5hr',          'id: "beach",\n    icon: "🌊",\n    durations: ["1hr", "1.5hr"]');
has('insta now offers 1hr/1.5hr/2hr (priced same as beach ride)', 'id: "insta",\n    icon: "🌅",\n    durations: ["1hr", "1.5hr", "2hr"]');
has('joinup perPerson',            'id: "joinup",\n    icon: "🔄",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2,\n    perPerson: true');
has('masterclass now offers 1hr/1.5hr (1.5hr calculated as 1.5x 1hr)', 'id: "masterclass",\n    icon: "🪮",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2');
has('groupclinic 1.5hr, 6 people', 'id: "groupclinic",\n    icon: "🤲",\n    durations: ["1.5hr"],\n    maxPeople: 6');
has('whisper courseDays now 4',    'id: "whisper",\n    icon: "🤝",\n    durations: ["3hr"],\n    maxPeople: 2,\n    minAge: 8,\n    course: true,\n    courseDays: 4');
missing('lunge activity removed',  'id: "lunge"');

// ─── SESSION_SLOTS unchanged (Paddock/Stable/Cottages/Rice Field) ────────
has('SESSION_SLOTS declared',      'const SESSION_SLOTS = {');
has('SESSION_SLOTS 1hr',           '"1hr":   ["8:30am", "10:30am", "2:30pm", "4:30pm"]');
has('SESSION_SLOTS 1.5hr',         '"1.5hr": ["8:30am", "10:00am", "2:30pm", "4:00pm"]');
has('SESSION_SLOTS 2hr',           '"2hr":   ["8:30am", "9:30am",  "2:30pm", "3:30pm"]');
has('SESSION_SLOTS 3hr',           '"3hr":   ["8:30am", "2:30pm"]');

// ─── Rides: fixed start-time + duration slots ─────────────────────────────
has('RIDE_SLOTS 1hr fixed to 5pm',   '"1hr": ["5:00pm"]');
has('RIDE_SLOTS 1.5hr fixed to 4:30pm', '"1.5hr": ["4:30pm"]');
has('RIDE_SLOTS 2hr fixed to 4pm',   '"2hr": ["4:00pm"]');
missing('RIDE_SLOTS no longer offers a morning option', 'const RIDE_SLOTS = {\n  "1hr": ["8:00am"');

// ─── Lessons: Join Up + Horse grooming + Group Clinic share 3 fixed slots ──
has('LESSON_SLOTS 1hr = 9:30/10:30/3pm', '"1hr": ["9:30am", "10:30am", "3:00pm"]');
has('LESSON_SLOTS 1.5hr = 9:30/10:30/3pm', '"1.5hr": ["9:30am", "10:30am", "3:00pm"]');
missing('LESSON_SLOTS no longer has old 8:30/4:30 pattern', 'const LESSON_SLOTS = {\n  "1hr": ["8:30am"');

// ─── Horse Whisperer: 4-day Mon/Tue/Thu/Fri ────────────────────────────────
has('WHISPER_SLOTS has 8:30 and 9:30am', 'const WHISPER_SLOTS = ["8:30am", "9:30am"];');
has('isWhisper blocks Wed + Sat',    'if (isWhisper && (dow === 3 || dow === 6)) return false;');

// ─── slotsFor routes correctly ───────────────────────────────────────────
has('slotsFor paddock/stable/cottages/ricefield routing', 'photo_paddock" || actObj.id === "photo_stable" || actObj.id === "photo_cottages" || actObj.id === "photo_ricefield") list = SESSION_SLOTS');

// ─── Weight: 77kg universal max, incl. Beach Photoshoot ───────────────────
missing('no more 78kg anywhere',   '78 kg');
missing('no more 78kg (no space)', '78kg');
has('w3 band is 70-77kg (en + id share Latin unit)', 'w3: "70–77 kg"', 2);
has('w4 band is over 77kg',        'w4: "Over 77 kg"');
has('showWeight combines isRiding + needsWeight', 'const showWeight = isRiding || actObj?.needsWeight === true;');
has('weight render gated on showWeight', 'showWeight && /*#__PURE__*/React.createElement("div", {\n      className: "rider-field"');
has('WhatsApp weight lines use showWeight', 'showWeight,\n  notes,');

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
has('photog 2hr tier',             'price: 4000000, photos: 40');
has('WhatsApp uses tier lookup',   'PHOTOGRAPHER_TIERS[photographerTier]', 2); // price calc + WhatsApp message
has('photographer tier state',     'const [photographerTier, setPhotographerTier] = useState(null);');
has('photographer price added to total', 'const totalPrice = unitPrice * mult + photographerPrice;');
has('addon tiers mutually exclusive', 'setPhotographerTier(pv => pv === tier.key ? null : tier.key)');

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
has('insta prices match beach ride en', 'insta: [{ l: "1 hr", v: "IDR 1,600,000" }, { l: "1.5 hr", v: "IDR 2,000,000" }, { l: "2 hr", v: "IDR 2,400,000" }]');
has('insta prices match beach ride id', 'insta: [{ l: "1 jam", v: "IDR 1,600,000" }, { l: "1,5 jam", v: "IDR 2,000,000" }, { l: "2 jam", v: "IDR 2,400,000" }]');
has('insta prices match beach ride ru', 'insta: [{ l: "1 ч", v: "IDR 1,600,000" }, { l: "1,5 ч", v: "IDR 2,000,000" }, { l: "2 ч", v: "IDR 2,400,000" }]');
has('masterclass 1.5hr = 1.5x 1hr en', 'masterclass: [{ l: "1 hr", v: "IDR 1,250,000" }, { l: "1.5 hr", v: "IDR 1,875,000" }]');
has('masterclass 1.5hr = 1.5x 1hr id', 'masterclass: [{ l: "1 jam", v: "IDR 1,250,000" }, { l: "1,5 jam", v: "IDR 1,875,000" }]');
has('masterclass 1.5hr = 1.5x 1hr ru', 'masterclass: [{ l: "1 ч", v: "IDR 1,250,000" }, { l: "1,5 ч", v: "IDR 1,875,000" }]');
has('groupclinic 6M flat en',      'groupclinic: [{ l: "1.5 hr", v: "IDR 6,000,000" }]');
has('groupclinic 6M flat id',      'groupclinic: [{ l: "1,5 jam", v: "IDR 6,000,000" }]');
has('groupclinic 6M flat ru',      'groupclinic: [{ l: "1,5 ч", v: "IDR 6,000,000" }]');
missing('no lunge prices anywhere',   'lunge:');
// paddock + stable + ricefield 3hr, × 3 langs = 9 hits
has('3,750,000 = paddock/stable/ricefield 3hr × 3 langs', '3,750,000', 9);

// ─── Group / description copy updated ────────────────────────────────────
has('en photo_beach per horse + weight cap', 'plus 1 person standing beside a horse. Max 77kg per mounted rider. Price is per horse.');
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
has('en groupclinic label',        'groupclinic: "Group Clinic"');
has('id groupclinic label',        'groupclinic: "Klinik Kelompok"');
has('ru groupclinic label',        'groupclinic: "Групповая клиника"');
has('en groupclinic copy (C31)',   'A hands-on session in leadership, communication and trust, taught through the horse.');

// ─── Rice Field Photoshoot activity present in all 3 languages ────────────
has('en ricefield label',          'photo_ricefield: "Rice Field Photoshoot"');
has('id ricefield label',          'photo_ricefield: "Sesi Foto di Sawah"');
has('ru ricefield label',          'photo_ricefield: "Фотосессия в рисовых полях"');

// ─── Horse Whisperer Course: 4 days, given copy, all rider levels ─────────
has('en whisper uses given copy',  'Four days, ten hours, one deep education in how horses think.');
has('en whisper open to all levels', 'Open to all rider levels, no experience required.');
missing('old "2 x 3hr and 1 x 3.5hr" line removed', '2 x 3 hr sessions and 1 x 3.5hr sessions');
has('en sessionNote reflects new structure', 'three 3 hr sessions plus a closing 1 hr session');
has('en pickCourseDays says 4',    'pickCourseDays: "Select 4 days for the course"');
has('en daysSelected says 4',      'daysSelected: "of 4 days selected"');
has('en courseWeekNote Mon/Tue/Thu/Fri', 'courseWeekNote: "The course runs Monday, Tuesday, Thursday and Friday, all within a single week."');
has('WhatsApp course schedule line updated', 'lines.push("Course runs Mon, Tue, Thu & Fri within one week");');

// ─── BYO photographer descriptor (all photoshoots, card + step 2) ─────────
has('en byoPhotographer key',      'byoPhotographer: "BYO Photographer or add a Salty Cowboys photographer"');
has('byo note on step1 card',      'item.photoshoot && /*#__PURE__*/React.createElement("div", {\n    className: "byo-note"\n  }, t.byoPhotographer)');
has('byo note on step2',           'isPhotoshoot && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",');

// ─── Notes section: "times not suitable" hint, all activities ────────────
has('en notesTimeHint key',        'notesTimeHint: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know below."');
has('id notesTimeHint key',        'notesTimeHint: "Kami ingin Anda mendapatkan pengalaman yang berkesan. Jika waktu yang tersedia tidak sesuai, atau Anda memiliki permintaan tambahan, silakan beri tahu kami di bawah."');
has('ru notesTimeHint key',        'notesTimeHint: "Мы хотим, чтобы у вас остались незабываемые впечатления. Если время не подходит или у вас есть дополнительный запрос, пожалуйста, напишите нам об этом ниже."');
has('notesTimeHint rendered near notes area', 'className: "notes-time-hint"\n  }, t.notesTimeHint), /*#__PURE__*/React.createElement("textarea"');

// ─── Main page: "Where the money goes" bio copy ───────────────────────────
has('en moneyGoesTitle',           'moneyGoesTitle: "Where the money goes"');
has('en moneyGoesBody excerpt',    'Every booking helps a horse. Salty Cowboys began as a rescue and it still is one.');
has('id moneyGoesTitle',           'moneyGoesTitle: "Ke mana uang Anda pergi"');
has('ru moneyGoesTitle',           'moneyGoesTitle: "Куда идут деньги"');
has('money-goes rendered before chooseActivity heading', 'className: "money-goes-body"\n  }, t.moneyGoesBody)), /*#__PURE__*/React.createElement("h2", {\n    className: "section-title"\n  }, t.chooseActivity)');

// ─── Wording: Sunrise → Morning, Sunset → Golden hour ─────────────────────
missing('no "Sunrise" anywhere',   'Sunrise');
missing('no "Sunset" anywhere',    'Sunset');
has('en introRides uses Morning/Golden hour', 'Morning and Golden hour rides are especially magical.');
has('en insta desc uses Golden hour', 'best at Golden hour');

// ─── Intro / addon copy ───────────────────────────────────────────────────
has('en intro tiered photog',      'packages from IDR 2,000,000, 20 edited photos per hour');
has('en intro per horse',          'Beach shoots are priced per horse');
has('en addon title',              'addonTitle: "Add a Salty Cowboy photographer:"');
has('id addon title',              'addonTitle: "Tambahkan fotografer Salty Cowboy:"');
has('ru addon title',              'addonTitle: "Добавить фотографа Salty Cowboy:"');
has('addon tiers array (3 langs)', 'addonTiers: [', 3);
has('en sessionNote one per week', 'Only one course booking is accepted per week.');
has('id sessionNote one per week', 'Hanya satu pemesanan kursus yang diterima per minggu.');
has('ru sessionNote one per week', 'В неделю принимается только одна бронь на курс.');

// ─── Step 2 now includes the calendar (no separate "calendar" screen) ─────
has('step calc collapses to 3 screens', 'const step = screen === "activity" ? 1 : screen === "riders" ? 2 : 3;');
has('calendar section gated on riders + detailsComplete', 'screen === "riders" && detailsComplete && /*#__PURE__*/React.createElement("div", {\n    className: "fu",\n    style: {\n      marginTop: 22\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "cal-header"\n  },');
missing('no separate calendar screen state left', '"calendar"');
missing('"See availability" button removed (calendar reveals automatically)', 't.seeAvailability');
missing('no lingering setScreen("calendar") calls', 'setScreen("calendar")');

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
