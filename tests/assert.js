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
has('en notesTimeHint key ends "here" not "below" (Figma parity commit 1)', 'notesTimeHint: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know here."');
has('id notesTimeHint key ends "di sini" not "di bawah" (Figma parity commit 1)', 'notesTimeHint: "Kami ingin Anda mendapatkan pengalaman yang berkesan. Jika waktu yang tersedia tidak sesuai, atau Anda memiliki permintaan tambahan, silakan beri tahu kami di sini."');
has('ru notesTimeHint key ends "здесь" not "ниже" (Figma parity commit 1)', 'notesTimeHint: "Мы хотим, чтобы у вас остались незабываемые впечатления. Если время не подходит или у вас есть дополнительный запрос, пожалуйста, напишите нам об этом здесь."');
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
has('heading 1 sits above duration pills, calendar shows unconditionally (Commit C)', 't.byoPhotographer), /*#__PURE__*/React.createElement("h3", {\n    className: "section-title"\n  }, t.stepHeading1), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      marginTop: -6\n    }\n  }, t.dateTimeHint), React.createElement("div", {\n    className: "fu control-card"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0\n    }\n  }, t.duration)');
missing('calendar no longer gated on detailsComplete', 'screen === "riders" && detailsComplete && /*#__PURE__*/React.createElement("div", {\n    className: "fu",\n    style: {\n      marginTop: 22');
has('calendar (cal-header) sits immediately after duration pills close, still within section 1', 'd)))), React.createElement("div", {\n    className: "cal-header"\n  },');
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
has('notes-area placeholder restyled', ".notes-area::placeholder { color: #999999; font-size: 11.5px; }");
has('price-reveal flipped to light card', '.price-reveal {\n  display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap;\n  margin: 4px 0 20px; padding: 12px 15px; border-radius: 12px;\n  background: #fff; border: 1.5px solid var(--fog);');
has('price-reveal-value is dark text', '.price-reveal-value { font-family: var(--display); font-size: 22px; font-weight: 600; color: var(--earth); }');
has('price-reveal-basis is uppercase label style', '.price-reveal-basis { font-size: 10px; color: var(--dusk); text-transform: uppercase; letter-spacing: 2px; text-align: right; }');

// ─── Step 1 restyle (docs/booking-engine-restyle-spec.md) — look only ─────
has('cat-tab uses shared pill pattern (fallback, Figma unverified)', '.cat-tab { flex: 0 0 auto; white-space: nowrap; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--fog); background: #fff; color: var(--earth);');
has('cat-tab.active uses earth/sand', '.cat-tab.active { background: var(--earth); border-color: var(--earth); color: var(--sand); }');
has('cat-intro-text padding bumped', '.cat-intro-text {\n  padding: 19px 18px;');
has('act-card border 1px + generous padding', '.act-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 18px;');
has('act-name is 22px (was 14px)', '.act-name { font-size: 22px; font-weight: 500; color: var(--earth); }');
missing('act-name did not gain a new font-family (rule: change size/weight/colour only)', '.act-name { font-size: 22px; font-weight: 500; color: var(--earth); font-family');
has('act-desc is 14px/19.5 line-height (was 12.5px/1.45)', '.act-desc  { font-size: 14px; color: #5c5c5c; margin-top: 4px; line-height: 19.5px; }');
has('price-tag flipped to light pill (was dark filled chip)', '.price-tag { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border-radius: 300px; background: #f7f7f7; border: 1px solid var(--fog); }');
has('pt-label is dark on light (was white on dark)', '.pt-label { font-size: 11px; color: var(--dusk); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }');
has('pt-value is dark on light (was white on dark)', '.pt-value { font-size: 13px; color: var(--earth); font-weight: 700; white-space: nowrap; }');

// ─── Step 3 restyle (docs/booking-engine-restyle-spec.md) — look only ─────
has('confirm-title is 22px (was 21px)', '.confirm-title {\n  font-family: var(--display);\n  font-size: 22px;');
has('confirm-summary border 1px + 18.5 padding', '.confirm-summary {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 18.5px;');
has('copy-box now carries the card look (was bare)', '.copy-box { margin: 8px 0 22px; text-align: left; background: #f7f7f7; border: 1px solid #dcdcdc; border-radius: 12px; padding: 15px; }');
has('copy-heading letter-spacing aligned to shared uppercase-label convention', '.copy-heading { font-size: 11px; font-weight: 600; color: var(--dusk); text-transform: uppercase; letter-spacing: 1.5px;');
has('copy-text lost its own box now that copy-box carries it', '.copy-text { white-space: pre-wrap; word-break: break-word; font-size: 13px; line-height: 19px; color: #444444; max-height: 210px; overflow-y: auto; }');
has('copy-btn is compact outline (was full-width tinted)', '.copy-btn { margin-top: 10px; width: auto; padding: 10px 20px; border-radius: 12px; border: 1px solid var(--earth); background: #fff; color: var(--earth);');
missing('clipboard emoji removed from copy button label', '"📋 " + t.copyBtn');
has('reset-link class exists (Make another booking no longer shares .cta)', '.reset-link {\n  background: none;\n  border: none;\n  color: var(--dusk);\n  font-size: 14px;');
has('Make another booking uses reset-link, not cta', 'className: "reset-link",\n    onClick: resetAll');
has('en awaiting has no hourglass emoji', 'awaiting: "Awaiting approval"');
has('id awaiting has no hourglass emoji', 'awaiting: "Menunggu persetujuan"');
has('ru awaiting has no hourglass emoji', 'awaiting: "Ожидает подтверждения"');
missing('no hourglass emoji anywhere in awaiting text', '⏳');

// ─── Commit A (docs/booking-engine-structural-spec.md): act-card rebuild ──
missing('act-icon element removed', 'className: "act-icon"');
has('act-image placeholder added', '}, /*#__PURE__*/React.createElement("div", {\n    className: "act-image"\n  }), /*#__PURE__*/React.createElement("div", {\n    className: "act-name"');
has('.act-image styled as fog placeholder', '.act-image { width: 100%; height: 140px; border-radius: 14px; background: var(--fog); margin-bottom: 8px; }');
has('act-card is a vertical column now', '.act-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 18px;\n  margin-bottom: 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 6px;\n  position: relative;\n}');
has('act-check repositioned absolute (was margin-left:auto)', '.act-check {\n  position: absolute;\n  top: 14px;\n  right: 14px;');
missing('act-check no longer uses margin-left:auto', 'margin-left: auto;\n  width: 20px; height: 20px;\n  border-radius: 50%;\n  background: var(--clay);\n  color: #fff;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 11px;\n  flex-shrink: 0;\n  opacity: 0;\n  transform: scale(0.6);\n  transition: all 0.2s;\n}\n.act-card.selected .act-check');
has('per-card Book button reuses existing state setters, not a new handler', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerTier(null);\n      setGrooming(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');
has('en bookActivity label', 'bookActivity: "Book →"');
has('id bookActivity label', 'bookActivity: "Pesan →"');
has('ru bookActivity label', 'bookActivity: "Забронировать →"');

// ─── Commit B (docs/booking-engine-structural-spec.md): Step 2 additions ──
has('detail-header-band CSS present', '.detail-header-band {\n  position: relative;\n  border-radius: 14px;\n  overflow: hidden;');
has('detail-header-band overlay at 0.8 opacity (image ~20% visible)', 'background: rgba(20,20,20,0.8);');
has('detail-header-band wraps back-link + title, keyed off actCategory image', 'className: "detail-header-band",\n    style: {\n      backgroundImage: "url(" + (actCategory === "Photoshoots" ? IMG_PHOTOSHOOTS : actCategory === "Rides" ? IMG_RIDES : IMG_LESSONS) + ")"\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "back-link"');
has('en stepHeading1/2/3 keys', 'stepHeading1: "1. Book a date and time"', 1);
has('en stepHeading2 key', 'stepHeading2: "2. Who\'s coming?"');
has('en stepHeading3 key', 'stepHeading3: "3. Your booking summary"');
has('id stepHeading1 key', 'stepHeading1: "1. Pilih tanggal dan waktu"');
has('ru stepHeading1 key', 'stepHeading1: "1. Выберите дату и время"');
has('heading 2 sits above numPeople block (current, pre-reorder order)', 'React.createElement("h3", {\n    className: "section-title",\n    style: {\n      marginTop: 24\n    }\n  }, t.stepHeading2), duration && (!needsGrooming || grooming) && /*#__PURE__*/React.createElement("div", {\n    className: "fu2 control-card"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.numPeople)');
has('section 3 (notes/notice/summary/Send) gated on datesComplete, not detailsComplete (Commit C)', 'screen === "riders" && datesComplete && /*#__PURE__*/React.createElement("div", {\n    className: "fu"\n  }, React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0\n    }\n  }, t.notesLabel)');
has('en sTotal label added, sRiders renamed to Participant (Figma parity commit 1)', 'sRiders: "Participant",\n    sTotal: "Total",\n    sStatus: "Status"');
has('id sTotal label added, sRiders renamed to Peserta (Figma parity commit 1)', 'sRiders: "Peserta",\n    sTotal: "Total",\n    sStatus: "Status"');
has('ru sTotal label added, sRiders renamed to Участник (Figma parity commit 1)', 'sRiders: "Участник",\n    sTotal: "Итого",\n    sStatus: "Статус"');
has('confirm-summary block now appears twice (Step 2 in-page + Step 3 confirm)', 'className: "confirm-summary"', 2);
has('sum-row Total on riders screen reads totalPriceStr, not a fresh computation', 't.sTotal), /*#__PURE__*/React.createElement("span", {\n    className: "sum-val"\n  }, totalPriceStr))');
has('riders-screen summary sits before Send, heading 3 immediately precedes it', 't.stepHeading3), /*#__PURE__*/React.createElement("div", {\n    className: "confirm-summary"');
has('Send button disabled on selectedTime OR incomplete details (Commit C moves the completeness check here)', 'className: "cta",\n    disabled: !selectedTime || !detailsComplete,\n    onClick: handleSend\n  }, t.sendBtn)');

// ─── User request (2026-08-17): Step 2 reorder + ungate, Futura upright type ──
has('--display CSS variable now Futura system stack, not Cormorant italic', "--display: 'Futura', 'Century Gothic', 'Outfit', sans-serif;");
missing('Cormorant Garamond no longer used as the display font', "--display: 'Cormorant Garamond'");
has('font-style: italic only remains on the 3 non-display notes (loading label, price-note, byo-note)', 'font-style: italic', 3);
has('price-note keeps its own italic styling untouched (not a --display heading)', '.price-note { font-size: 11px; color: var(--dusk); margin-top: 5px; font-style: italic; }');
has('byo-note keeps its own italic styling untouched (not a --display heading)', '.byo-note { font-size: 11.5px; color: var(--dusk); margin-top: 6px; line-height: 1.45; font-style: italic; }');
has('duration-to-slot filtering still reads duration + sortedDates, untouched by reorder', 'const availableSlots = slotsFor(actObj, duration, sortedDates);');
has('Horse Whisperer multi-day week-lock logic untouched by reorder', 'if (isCourse && selectedDates.length > 0) {\n      if (weekKey({ y: calYear, m: calMonth, d: day }) !== weekKey(selectedDates[0])) return false;\n    }');
has('detailsComplete definition unchanged (still riders+duration+numPeople+grooming based)', 'const detailsComplete = !!duration && !!numPeople && (!needsGrooming || !!grooming) && ridersComplete;');
missing('the old marginTop:22 spacer above the calendar is gone (large gap removed)', 'className: "fu",\n    style: {\n      marginTop: 22');

// ─── docs/step2-figma-parity-batch.md, Commit 1: copy and labels ──────────
has('en dateTimeHint key added under stepHeading1 (diff #3)', 'dateTimeHint: "Select an available date below to choose your time slot."');
has('dateTimeHint rendered as a section-hint right after heading 1', 't.stepHeading1), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      marginTop: -6\n    }\n  }, t.dateTimeHint)');
has('en participantDetails key added (diff #7)', 'participantDetails: "Participant details"');
missing('aboutYou key removed (folded into participantDetails for the single-rider case)', 'aboutYou:');
missing('yourDetails key removed (folded into participantDetails for the single-rider case)', 'yourDetails:');
has('outer "about riders" wrapper only shows for 2+ riders now (was riders.length > 0)', 'riders.length > 1 && /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.aboutRiders)');
has('single-rider card label reads participantDetails, multi-rider keeps numbered personNoun', 'className: "rider-label"\n    }, riders.length === 1 ? t.participantDetails : personNoun + " " + (idx + 1))');
has('en sTotal label sits alongside renamed sRiders (diff #13)', 'sRiders: "Participant",');
has('en awaiting stays hourglass-free (diff #16 declined, no-decorative-emoji decision stands)', 'awaiting: "Awaiting approval"');
missing('hourglass emoji not reintroduced anywhere in awaiting text', '⏳');

// ─── docs/step2-figma-parity-batch.md, Commit 2: card containers ──────────
has('.control-card CSS added, matches rider-card bordered treatment (diff #4/#6)', '.control-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 16.5px 22px;\n  margin-bottom: 16px;\n}');
has('duration selector wrapped in control-card (diff #4)', 'React.createElement("div", {\n    className: "fu control-card"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0');
has('number-of-people selector wrapped in control-card (diff #6)', 'React.createElement("div", {\n    className: "fu2 control-card"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.numPeople)');
has('grooming selector NOT wrapped in control-card (only duration, date and numPeople are in scope)', 'needsGrooming && /*#__PURE__*/React.createElement("div", {\n    className: "fu2"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.groomingLabel)');
has('sel-title (selected single-date readout) now a bordered field (diff #5)', '.sel-title {\n  font-family: var(--display);\n  font-size: 16px;\n  color: var(--earth);\n  margin-bottom: 14px;\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 10px;\n  padding: 12px 14px;\n}');

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
