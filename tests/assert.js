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
has('photo_ricefield clones stable config', 'id: "photo_ricefield",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_paddock 1-3hr',         'id: "photo_paddock",\n    durations: ["1hr", "1.5hr", "2hr", "3hr"],\n    maxPeople: 5');
has('photo_cottages session, 6',   'id: "photo_cottages",\n    durations: ["3hr"],\n    maxPeople: 6');
has('beach ride 1/1.5hr',          'id: "beach",\n    durations: ["1hr", "1.5hr"]');
has('insta now offers 1hr/1.5hr/2hr (priced same as beach ride)', 'id: "insta",\n    durations: ["1hr", "1.5hr", "2hr"]');
has('joinup perPerson',            'id: "joinup",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2,\n    perPerson: true');
has('masterclass now offers 1hr/1.5hr (1.5hr calculated as 1.5x 1hr)', 'id: "masterclass",\n    durations: ["1hr", "1.5hr"],\n    maxPeople: 2');
has('groupclinic 1.5hr, 6 people', 'id: "groupclinic",\n    durations: ["1.5hr"],\n    maxPeople: 6');
has('whisper courseDays now 4',    'id: "whisper",\n    durations: ["3hr"],\n    maxPeople: 2,\n    minAge: 8,\n    course: true,\n    courseDays: 4');
missing('icon field removed from ACTIVITIES data as dead code (never rendered anywhere, Commit D emoji cleanup)', '    icon: "');
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
missing('priceBasis computation removed as dead code (Figma parity Commit 5, diff #8: value only, no breakdown line)', 'let priceBasis;');
missing('price-reveal-basis JSX span removed along with priceBasis', 'className: "price-reveal-basis"');

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
has('byo line on step2 now a static filled chip, not a paragraph (batch3 Commit 2, #2)', 'isPhotoshoot && /*#__PURE__*/React.createElement("span", {\n    className: "byo-chip"\n  }, t.byoPhotographer)');

// ─── Notes section: "times not suitable" hint, all activities ────────────
has('en notesTimeHint key ends "here" not "below" (Figma parity commit 1)', 'notesTimeHint: "We want you to have a memorable experience. If the times are not suitable, or you have an additional request, please let us know here."');
has('id notesTimeHint key ends "di sini" not "di bawah" (Figma parity commit 1)', 'notesTimeHint: "Kami ingin Anda mendapatkan pengalaman yang berkesan. Jika waktu yang tersedia tidak sesuai, atau Anda memiliki permintaan tambahan, silakan beri tahu kami di sini."');
has('ru notesTimeHint key ends "здесь" not "ниже" (Figma parity commit 1)', 'notesTimeHint: "Мы хотим, чтобы у вас остались незабываемые впечатления. Если время не подходит или у вас есть дополнительный запрос, пожалуйста, напишите нам об этом здесь."');
has('notesTimeHint rendered near notes area', 'className: "notes-time-hint"\n  }, t.notesTimeHint), React.createElement("textarea"');

// ─── Main page: "Where the money goes" bio copy (Step 2 cost-funds-card only, since batch 4 Commit 1 removed the Step 1 card) ─
has('en moneyGoesBody excerpt (still used by Step 2 cost-funds-card)', 'Every booking helps a horse. Salty Cowboys began as a rescue and it still is one.');
missing('moneyGoesTitle key removed as dead code (batch 4, Commit 1: Step 1 money-goes card deleted, Step 2 uses its own costFundsTitle)', 'moneyGoesTitle:');

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
has('heading 1 sits above duration pills, calendar shows unconditionally (Commit C)', 't.byoPhotographer), /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box"\n  }, /*#__PURE__*/React.createElement("h3", {\n    className: "section-title" + (section1Complete ? " section-title-toggle" : ""),\n    onClick: section1Complete ? () => setSection1ManualOpen(o => !o) : undefined\n  }, t.stepHeading1, section1Complete && /*#__PURE__*/React.createElement("span", {\n    className: "section-toggle-arrow"\n  }, section1Collapsed ? "▾" : "▴")), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }, t.dateTimeHint), section1Collapsed && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer"\n    },\n    onClick: () => setSection1ManualOpen(o => !o)\n  }, [duration, formattedDates.join(" · "), selectedTime].filter(Boolean).join(" · ")), React.createElement("div", {\n    className: "fu",\n    style: {\n      marginBottom: 22,\n      display: section1Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0,\n      marginBottom: 14\n    }\n  }, t.duration)');
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
has('notes-area placeholder now Futura 500 (styling parity sub-step 1)', ".notes-area::placeholder { font-family: var(--display); font-weight: 500; color: #999999; font-size: 11.5px; }");
has('price-reveal is a light bordered card, now stacked label-over-value (Figma parity Commit 5, diff #8)', '.price-reveal {\n  display: flex; flex-direction: column; gap: 4px;\n  margin-bottom: 22px; padding: 14px 16px; border-radius: 12px;\n  background: #fff; border: 1.5px solid var(--fog);');
has('price-reveal-value is dark text, weight 500 not 600 (styling parity sub-step 1)', '.price-reveal-value { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--earth); }');
has('price-reveal-label replaces price-reveal-basis, reads TOTAL COST, Futura 500 (diff #8)', '.price-reveal-label { font-family: var(--display); font-weight: 500; font-size: 10px; color: var(--dusk); text-transform: uppercase; letter-spacing: 2px; }');
missing('price-reveal-basis CSS class removed', '.price-reveal-basis');

// ─── Step 1 restyle (docs/booking-engine-restyle-spec.md) — look only ─────
has('cat-tab uses shared pill pattern (fallback, Figma unverified)', '.cat-tab { flex: 0 0 auto; white-space: nowrap; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--fog); background: #fff; color: var(--earth);');
has('cat-tab.active uses earth/sand', '.cat-tab.active { background: var(--earth); border-color: var(--earth); color: var(--sand); }');
has('cat-intro-text no longer has its own horizontal padding, so its left/right text edges land at the same inset as the act-cards beneath it (batch 5, Commit 2)', '.cat-intro-text {\n  margin-top: 12px;');
has('act-card border 1px + generous padding, matching the locked Step 2 card padding (Figma spacing audit)', '.act-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;');
has('act-name is 22px (was 14px)', '.act-name { font-size: 22px; font-weight: 500; color: var(--earth); }');
missing('act-name did not gain a new font-family (rule: change size/weight/colour only)', '.act-name { font-size: 22px; font-weight: 500; color: var(--earth); font-family');
has('act-desc is 14px/19.5 line-height, explicit weight 400 (Figma card rebuild)', '.act-desc  { font-size: 14px; font-weight: 400; color: #5c5c5c; line-height: 19.5px; }');
has('price-tag is a light pill, captured grey #eeeeee not the --fog token (Figma card rebuild, greys stay as captured)', '.price-tag { display: inline-flex; align-items: center; gap: 7px; padding: 5px 10px; border-radius: 300px; background: #eeeeee; border: 1px solid var(--fog); }');
has('pt-label uses near-black at 60% opacity via our token, not Figma\'s fractional-channel rgba(0.11,0.11,0.11,0.60) export glitch (Figma card rebuild landmine)', '.pt-label { font-size: 11px; color: rgba(20, 20, 20, 0.6); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }');
has('pt-value weight is 500 (was 700), matching the title/value/heading/Book weight hierarchy (Figma card rebuild)', '.pt-value { font-size: 13px; color: var(--earth); font-weight: 500; white-space: nowrap; }');

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
has('act-image placeholder sits in the act-right column, above the Book button (Figma card rebuild)', '/*#__PURE__*/React.createElement("div", {\n    className: "act-right"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-image"\n  }), /*#__PURE__*/React.createElement("button", {\n    className: "act-book-btn"');
has('.act-image is 233px tall, captured grey #d9d9d9 not the --fog token (Figma card rebuild, greys stay as captured)', '.act-image { width: 100%; height: 233px; border-radius: 14px; background: #d9d9d9; }');
has('act-card base is a mobile-first stacked column (locked Step 2 padding, 12px gap); the Figma two-column row only applies at the 900px desktop breakpoint (Figma card rebuild)', '.act-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 12px;\n  position: relative;\n}');
has('at 900px+, act-card becomes a row with nowrap (not wrap, see the comment: wrap would decide line-breaks on un-shrunk basis and always drop the image), left/right basis 316/284 so the image shrinks to fit the 623px column (Figma card rebuild)', '.act-card { flex-direction: row; flex-wrap: nowrap; align-items: flex-start; }\n  .act-left { flex: 0 1 316px; min-width: 220px; }\n  .act-right { flex: 1 1 284px; min-width: 160px; }');
has('.act-left base (mobile): title+desc and price pills stacked, 22px inner gap', '.act-left {\n  display: flex;\n  flex-direction: column;\n  gap: 22px;\n}');
has('.act-titledesc gives title and description their own tighter 9px gap, nested inside act-left\'s 22px rhythm (Figma card rebuild)', '.act-titledesc { display: flex; flex-direction: column; gap: 9px; }');
has('.act-right base (mobile): image and Book button stacked, right-aligned', '.act-right {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n}');
has('price pills stack vertically, one per duration, instead of wrapping in a row (Figma card rebuild)', '.price-tags { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }');
has('Book button font-weight is 500 (was 600), matching the title/value/heading/Book weight hierarchy (Figma card rebuild)', 'font-family: var(--display);\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.act-book-btn:hover');
has('act-check repositioned absolute (was margin-left:auto)', '.act-check {\n  position: absolute;\n  top: 14px;\n  right: 14px;');
missing('act-check no longer uses margin-left:auto', 'margin-left: auto;\n  width: 20px; height: 20px;\n  border-radius: 50%;\n  background: var(--clay);\n  color: #fff;\n  display: flex; align-items: center; justify-content: center;\n  font-size: 11px;\n  flex-shrink: 0;\n  opacity: 0;\n  transform: scale(0.6);\n  transition: all 0.2s;\n}\n.act-card.selected .act-check');
has('per-card Book button reuses existing state setters, not a new handler', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerTier(null);\n      setGrooming(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');
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
has('heading 2 sits above numPeople block (current, pre-reorder order)', 'React.createElement("h3", {\n    className: "section-title" + (detailsComplete ? " section-title-toggle" : ""),\n    onClick: detailsComplete ? () => setSection2ManualOpen(o => !o) : undefined\n  }, t.stepHeading2, detailsComplete && /*#__PURE__*/React.createElement("span", {\n    className: "section-toggle-arrow"\n  }, section2Collapsed ? "▾" : "▴")), section2Collapsed && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer"\n    },\n    onClick: () => setSection2ManualOpen(o => !o)\n  }, numPeople, " ", numPeople === "1" ? t.person : t.people), duration && (!needsGrooming || grooming) && /*#__PURE__*/React.createElement("div", {\n    className: "fu2 control-card",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.numPeople)');
has('section 3 (summary/total/notes/Send/notice) gated on datesComplete, not detailsComplete (Commit C)', 'screen === "riders" && datesComplete && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"\n  }, React.createElement("h3", {\n    className: "section-title"\n  }, t.stepHeading3)');
has('en sRiders renamed to Participant (Figma parity commit 1)', 'sRiders: "Participant",\n    sStatus: "Status"');
has('id sRiders renamed to Peserta (Figma parity commit 1)', 'sRiders: "Peserta",\n    sStatus: "Status"');
has('ru sRiders renamed to Участник (Figma parity commit 1)', 'sRiders: "Участник",\n    sStatus: "Статус"');
has('confirm-summary block still appears twice (Step 2 in-page + Step 3 confirm)', 'className: "confirm-summary"', 2);
missing('sTotal translation key removed as dead code (Figma parity Commit 5, diff #14: Total row dropped from the summary table)', 'sTotal:');
missing('t.sTotal no longer read anywhere in the summary table', 't.sTotal)');
has('riders-screen summary sits directly under heading 3, before the TOTAL COST block (Figma parity Commit 5)', 't.stepHeading3), React.createElement("div", {\n    className: "confirm-summary"');
has('Send button disabled on selectedTime OR incomplete details (Commit C moves the completeness check here)', 'className: "cta",\n    style: {\n      marginTop: 0,\n      marginBottom: 22\n    },\n    disabled: !selectedTime || !detailsComplete,\n    onClick: handleSend\n  }, t.sendBtn)');

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
has('dateTimeHint rendered as a section-hint right after heading 1, no negative-margin hack (styling parity)', 't.stepHeading1, section1Complete && /*#__PURE__*/React.createElement("span", {\n    className: "section-toggle-arrow"\n  }, section1Collapsed ? "▾" : "▴")), /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }, t.dateTimeHint)');
has('en participantDetails key added (diff #7)', 'participantDetails: "Participant details"');
missing('aboutYou key removed (folded into participantDetails for the single-rider case)', 'aboutYou:');
missing('yourDetails key removed (folded into participantDetails for the single-rider case)', 'yourDetails:');
has('outer "about riders" wrapper only shows for 2+ riders now (was riders.length > 0)', 'riders.length > 1 && /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, t.aboutRiders)');
has('single-rider card label reads participantDetails, multi-rider keeps numbered personNoun', 'className: "rider-label"\n    }, riders.length === 1 ? t.participantDetails : personNoun + " " + (idx + 1))');
has('en sTotal label sits alongside renamed sRiders (diff #13)', 'sRiders: "Participant",');
has('en awaiting stays hourglass-free (diff #16 declined, no-decorative-emoji decision stands)', 'awaiting: "Awaiting approval"');
missing('hourglass emoji not reintroduced anywhere in awaiting text', '⏳');

// ─── docs/step2-figma-parity-batch.md, Commit 2: card containers ──────────
has('.control-card CSS added, matches rider-card bordered treatment and padding (diff #4/#6, styling parity sub-step 3)', '.control-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
missing('duration selector no longer wrapped in control-card (reversed by batch 5, Commit 3: "Duration is not in a card")', 'className: "fu control-card"');
has('duration selector keeps the 14px label-to-pill gap and its own 22px trailing margin via inline style, just without the card chrome (batch 5, Commit 3)', 'React.createElement("div", {\n    className: "fu",\n    style: {\n      marginBottom: 22,\n      display: section1Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0,\n      marginBottom: 14\n    }\n  }, t.duration)');
has('number-of-people selector wrapped in control-card (diff #6)', 'React.createElement("div", {\n    className: "fu2 control-card",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.numPeople)');
has('grooming selector NOT wrapped in control-card (only duration, date and numPeople are in scope)', 'needsGrooming && /*#__PURE__*/React.createElement("div", {\n    className: "fu2",\n    style: {\n      marginBottom: 22,\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.groomingLabel)');
has('sel-title (selected single-date readout) now a bordered field (diff #5)', '.sel-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 16px;\n  color: var(--earth);\n  margin-bottom: 14px;\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 10px;\n  padding: 12px 14px;\n}');

// ─── docs/step2-figma-parity-batch.md, Commit 3: activity header ──────────
has('.detail-header-card CSS added, light bordered card (diff #1)', '.detail-header-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 20px 18px;\n  margin-top: -48px;\n  margin-bottom: 22px;\n}');
has('title and description sit in the light detail-header-card, no background image (diff #1)', 'className: "detail-header-card"\n  }, /*#__PURE__*/React.createElement("h2", {\n    className: "section-title"\n  }, t.activities[actObj?.id])');
missing('back-link no longer lives inside detail-header-card (moved above the image band, batch 5, Commit 3)', 'className: "detail-header-card"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "back-link"');
has('description now sits inside the header card, directly under the title (diff #2)', 't.activities[actObj?.id]), /*#__PURE__*/React.createElement("p", {\n    className: "detail-desc"\n  }, t.descs[actObj?.id]))');
missing('detail-intro wrapper removed (description no longer a separate sibling block)', 'className: "detail-intro"');
missing('detail-emoji (wave/sunrise icon prefix on the description) removed (diff #2)', 'className: "detail-emoji"');
has('IMG_PHOTOSHOOTS/IMG_RIDES/IMG_LESSONS still used by Step 1 category intro (unaffected)', 'src: activeCat === "Photoshoots" ? IMG_PHOTOSHOOTS : activeCat === "Rides" ? IMG_RIDES : IMG_LESSONS,');

// ─── docs/step2-figma-parity-batch.md, Commit 4: cost-funds section ───────
has('en costFundsTitle key added (diff #19)', 'costFundsTitle: "What your booking cost funds"');
has('id costFundsTitle key added', 'costFundsTitle: "Untuk apa biaya pemesanan Anda digunakan"');
has('ru costFundsTitle key added', 'costFundsTitle: "На что идёт стоимость вашего бронирования"');
has('.cost-funds-card CSS added, light not dark (unlike the now-removed Step 1 money-goes card)', '.cost-funds-card {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 19px 18px;\n  margin-bottom: 18px;\n}');
has('cost-funds block reuses moneyGoesBody copy (word-for-word identical to Figma diff #19 text)', 'className: "cost-funds-title"\n  }, t.costFundsTitle), /*#__PURE__*/React.createElement("p", {\n    className: "cost-funds-body"\n  }, t.moneyGoesBody)');
has('cost-funds block sits after the confirmation notice, which now sits after Send (Figma parity Commit 5, diffs #17/#18), always visible on the riders screen', 't.notice)), screen === "riders" && /*#__PURE__*/React.createElement("div", {\n    className: "cost-funds-card fu step2-block"');
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
has('Edit link appended inside the step 2 summary card, scroll-to-top only, no state mutation (diff #15)', 't.awaiting)), /*#__PURE__*/React.createElement("div", {\n    style: {\n      textAlign: "right",\n      marginTop: 8\n    }\n  }, /*#__PURE__*/React.createElement("span", {\n    className: "hint-link",\n    style: {\n      cursor: "pointer",\n      fontSize: 12\n    },\n    onClick: () => window.scrollTo({ top: 0, behavior: "smooth" })\n  }, t.editLink))');
has('TOTAL COST block sits directly after the summary card, still gated on duration/numPeople/selPrice (diff #9)', 'onClick: () => window.scrollTo({ top: 0, behavior: "smooth" })\n  }, t.editLink))), duration && numPeople && selPrice && /*#__PURE__*/React.createElement("div", {\n    className: "price-reveal"\n  }, /*#__PURE__*/React.createElement("span", {\n    className: "price-reveal-label"\n  }, t.totalCostLabel), /*#__PURE__*/React.createElement("span", {\n    className: "price-reveal-value"\n  }, totalPriceStr))');
has('notes block sits right after TOTAL COST, before Send (diffs #9/#12)', 'totalPriceStr)), React.createElement("div", {\n    className: "act-category",\n    style: {\n      marginTop: 0\n    }\n  }, t.notesLabel)');
has('Send button sits directly after the notes textarea, before the confirmation notice (diff #17)', 'onChange: e => setNotes(e.target.value)\n  }), React.createElement("button", {\n    className: "cta",\n    style: {\n      marginTop: 0,\n      marginBottom: 22\n    },\n    disabled: !selectedTime || !detailsComplete,\n    onClick: handleSend\n  }, t.sendBtn), React.createElement("div", {\n    className: "notice"');
has('confirmation notice now sits after Send, last inside the datesComplete-gated block, no decorative emoji (Commit D)', 't.sendBtn), React.createElement("div", {\n    className: "notice"\n  }, t.notice))');
missing('notice no longer wraps its text in a decorative-emoji span (Commit D: seedling-equivalent removed)', 'className: "notice"\n  }, /*#__PURE__*/React.createElement("span"');
has('handleSend / buildWhatsAppMessage payload fields untouched by the reorder (Simone\'s flow inviolable)', 'const message = buildWhatsAppMessage({\n      actObj,\n      durationLabel: duration,\n      formattedDates,\n      isCourse,\n      selectedTime,\n      numPeople,\n      riders,\n      showWeight,\n      notes,\n      photographerTier: isPhotoshoot ? photographerTier : null,\n      grooming: needsGrooming ? grooming : null\n    });');
has('totalPrice / totalPriceStr computation itself untouched, only its rendering moved (diff #9)', 'const totalPrice = unitPrice * mult + photographerPrice;\n  const totalPriceStr = "IDR " + totalPrice.toLocaleString("en-US");');

// ─── docs/step2-styling-parity.md, sub-step 1: weights to Futura 500 ──────
// Weight/family only. No size, colour, spacing or logic touched.
has('section-title (activity title / section headings) now explicitly weight 500, was bold by h2/h3 default', '.section-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 22px;');
has('section-hint (Step 1 helper line + Step 2 hints) now Futura 500, was inheriting Outfit at default weight', '.section-hint {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;');
has('back-link is Futura 500, plain text link with no button chrome (batch 5, Commit 3 reverses the bordered-pill treatment)', '.back-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;\n  color: var(--earth);\n  cursor: pointer;\n  margin-bottom: 14px;\n  width: fit-content;\n}');
missing('back-link no longer has its own padding/border/background/radius (button chrome removed)', '.back-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;\n  color: var(--earth);\n  cursor: pointer;\n  margin-bottom: 14px;\n  width: fit-content;\n  padding');
has('detail-desc (activity description) now Futura 500, was inheriting Outfit at default weight', '.detail-desc { font-family: var(--display); font-weight: 500; font-size: 13px;');
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
has('notice (confirmation note) now Futura 500', '.notice {\n  background: #f7f7f7;\n  border: 1px solid #dcdcdc;\n  border-radius: 10px;\n  padding: 12px 14px;\n  font-family: var(--display);\n  font-weight: 500;');
has('cta (WhatsApp button) now explicitly weight 500', '.cta {\n  display: block;\n  width: 100%;\n  padding: 16px;\n  background: var(--clay);\n  color: #fff;\n  border: none;\n  border-radius: 14px;\n  font-family: var(--display);\n  font-weight: 500;');
has('cost-funds-title now explicitly weight 500', '.cost-funds-title {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 18px;');
has('cost-funds-body now Futura 500, was inheriting Outfit at default weight', '.cost-funds-body {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12.5px;');
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
has('EXPR_B (summary/total/notes/Send/notice block) tagged step2-block, now also boxed (batch 5, Commit 3)', 'className: "step2-section-box fu step2-block"');
has('cost-funds block tagged step2-block', 'className: "cost-funds-card fu step2-block"');
has('detail-header-card trailing gap now the uniform 22px (was 18px)', '.detail-header-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 20px 20px 18px;\n  margin-top: -48px;\n  margin-bottom: 22px;\n}');
has('section-hint trailing gap now the uniform 22px (was 20px), covers isWhisper/BYO/dateTimeHint', '.section-hint {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;\n  color: var(--dusk);\n  margin-bottom: 22px;');
missing('isWhisper hint no longer uses the negative-margin jam-against-heading hack', 'isWhisper && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style:');
missing('isPhotoshoot (BYO Photographer) hint no longer uses the negative-margin hack, now gets a real defined slot', 'isPhotoshoot && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style:');
has('dateTimeHint no longer uses the negative-margin hack', '}, t.dateTimeHint), section1Collapsed && /*#__PURE__*/React.createElement("p", {');
has('duration control-card and rider-card share identical padding (23/16.5/25) and the uniform 22px gap (styling parity sub-step 3)', '.rider-card {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
has('cal-selection-panel (date readout + time slot) gets the trailing 22px gap before the next block, not cal-legend (keeps the dark calendar card visually seamless)', '.cal-selection-panel {\n  padding: 20px 24px;\n  margin-bottom: 22px;\n}');
missing('cal-legend itself has no margin-bottom (stays flush with cal-selection-panel, one continuous card)', '.cal-legend {\n  padding: 12px 24px;\n  background: var(--earth);\n  display: flex;\n  gap: 16px;\n  border-top: 1px solid rgba(255,255,255,0.06);\n  border-radius: 0 0 14px 14px;\n  margin-bottom');
has('heading 2 no longer carries an inline marginTop:24 nudge', 't.stepHeading2, detailsComplete && /*#__PURE__*/React.createElement("span", {\n    className: "section-toggle-arrow"\n  }, section2Collapsed ? "▾" : "▴")), section2Collapsed && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer"\n    },\n    onClick: () => setSection2ManualOpen(o => !o)\n  }, numPeople, " ", numPeople === "1" ? t.person : t.people), duration && (!needsGrooming || grooming) && /*#__PURE__*/React.createElement("div", {\n    className: "fu2 control-card"');
has('grooming card gets its own trailing 22px via inline style, not the shared .fu2 class (avoids touching every other .fu2 element site-wide)', 'className: "fu2",\n    style: {\n      marginBottom: 22,\n      display: section2Collapsed ? "none" : undefined\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "act-category"\n  }, t.groomingLabel)');
has('heading 3 no longer carries an inline marginTop:24 nudge', 't.stepHeading3), React.createElement("div", {\n    className: "confirm-summary",');
has('confirm-summary gets its trailing 22px via inline style scoped to the Step 2 instance only, not the shared class (Step 3 confirm screen summary is untouched)', 'React.createElement("h3", {\n    className: "section-title"\n  }, t.stepHeading3), React.createElement("div", {\n    className: "confirm-summary",\n    style: {\n      marginBottom: 22\n    }\n  }');
has('Step 3 confirm screen summary card has no margin override (only Step 2\'s in-page copy was touched)', 'React.createElement("div", {\n    className: "confirm-summary"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "sum-row"');
has('addon-group now uses trailing margin-bottom (22px) instead of a leading margin-top nudge', '.addon-group { margin-bottom: 22px; }');
missing('addon-group no longer uses margin-top', '.addon-group { margin-top');
has('notes-time-hint negative-margin hack removed, kept as a small heading-to-hint gap (not part of the 22px block rhythm)', '.notes-time-hint { font-size: 11.5px; color: var(--dusk); margin-bottom: 8px; line-height: 1.4; }');
has('notes-area trailing gap now the uniform 22px (was 16px)', 'transition: border 0.18s;\n  margin-bottom: 22px;\n}');
has('Send button (Step 2 instance) overrides the shared .cta margin locally: 0 top, 22 bottom', 'className: "cta",\n    style: {\n      marginTop: 0,\n      marginBottom: 22\n    },\n    disabled: !selectedTime || !detailsComplete');
has('notice trailing gap now the uniform 22px (was 16px), sits last before the always-visible cost-funds block', '.notice {\n  background: #f7f7f7;\n  border: 1px solid #dcdcdc;\n  border-radius: 10px;\n  padding: 12px 14px;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 12px;\n  color: #444444;\n  line-height: 1.5;\n  margin-bottom: 22px;');

// ─── docs/booking-engine-structural-spec.md, Commit D: copy cleanup ───────
missing('no em-dashes left anywhere in translation copy, the meta description, or the WhatsApp message builder (standing CLAUDE.md rule)', 'sentTitle: "WhatsApp has opened in another window —');
has('en sentTitle now reads as two sentences', 'sentTitle: "WhatsApp has opened in another window. Please hit send to make the booking request",');
has('id sentTitle now reads as two sentences', 'sentTitle: "WhatsApp telah terbuka di jendela lain. Silakan tekan kirim untuk membuat permintaan pemesanan",');
has('ru sentTitle now reads as two sentences', 'sentTitle: "WhatsApp открылся в другом окне. Нажмите «отправить», чтобы оформить запрос на бронирование",');
has('meta description em-dash replaced with a natural appositive comma', '<meta name="description" content="Book a horse riding experience at Salty Cowboys, a Bali horse rescue sanctuary & riding centre." />');
has('WhatsApp message title no longer uses an em-dash', 'lines.push("🐴 *New Salty Cowboys booking request*");');
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
has('back-link is now the first child of the body, sitting on white before the image band (batch 5, Commit 3)', 'className: "body fu step2-block"\n  }, /*#__PURE__*/React.createElement("div", {\n    className: "back-link",\n    onClick: () => setScreen("activity")\n  }, t.back), /*#__PURE__*/React.createElement("div", {\n    className: "detail-header-image"\n  }), /*#__PURE__*/React.createElement("div", {\n    className: "detail-header-card"');
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
missing('no manual accordion toggle handler introduced', 'toggleSection');
has('buildWhatsAppMessage takes formattedDates as a named param, not a DOM read', 'function buildWhatsAppMessage({\n  actObj,\n  durationLabel,\n  formattedDates,\n  isCourse,\n  selectedTime,\n  numPeople,\n  riders,');
has('handleSend passes riders/numPeople/selectedTime from state into buildWhatsAppMessage, not the DOM', 'const message = buildWhatsAppMessage({\n      actObj,\n      durationLabel: duration,\n      formattedDates,\n      isCourse,\n      selectedTime,\n      numPeople,\n      riders,');
missing('no document.querySelector calls anywhere in the app (payload assembly cannot depend on collapsed/hidden DOM state)', 'document.querySelector');
has('section 1 calendar block (cal-header) CSS-hidden on completion, not unmounted (stays out of a new conditional gate)', 'className: "cal-header",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  },');
has('section 1 cal-grid CSS-hidden on completion, still mounted', 'className: "cal-grid",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }');
has('section 1 cal-legend CSS-hidden on completion, still mounted', 'className: "cal-legend",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }');
has('section 1 cal-selection-panel (date+time readout) CSS-hidden on completion, still mounted', 'className: "cal-selection-panel",\n    style: {\n      display: section1Collapsed ? "none" : undefined\n    }\n  }');
has('section 1 collapsed summary line filters out null duration (Horse Whisperer Course has no duration pill) so it never prints the literal string "null", shows date/time once section1Collapsed, and is itself clickable to reopen (batch 4, Commit 2 manual toggle)', 'section1Collapsed && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer"\n    },\n    onClick: () => setSection1ManualOpen(o => !o)\n  }, [duration, formattedDates.join(" · "), selectedTime].filter(Boolean).join(" · ")');
has('section 2 rider-card keeps its key/animationDelay AND gains a display toggle, proving it stays mounted (not conditionally removed)', 'className: "rider-card fu",\n      style: {\n        animationDelay: idx * 0.06 + "s",\n        display: section2Collapsed ? "none" : undefined\n      }');
has('section 2 addon-group (photographer add-on) CSS-hidden on completion, still mounted so its selection stays live', 'className: "addon-group",\n    style: {\n      display: section2Collapsed ? "none" : undefined\n    }\n  }');
has('section 2 collapsed summary line shows numPeople once section2Collapsed, and is itself clickable to reopen (batch 4, Commit 2 manual toggle)', 'section2Collapsed && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint",\n    style: {\n      cursor: "pointer"\n    },\n    onClick: () => setSection2ManualOpen(o => !o)\n  }, numPeople, " ", numPeople === "1" ? t.person : t.people)');

// ─── docs/batch4-step1-cleanup-accordions.md, Commit 2: manual toggle ─────
// Reuses section1Complete/detailsComplete for the open/close decision; the
// manual flags only override which side of that state the section shows,
// so there is no parallel completion system.
has('section1ManualOpen/section2ManualOpen are plain UI toggle state, not a new completion system', 'const [section1ManualOpen, setSection1ManualOpen] = useState(false);\n  const [section2ManualOpen, setSection2ManualOpen] = useState(false);');
has('section1Collapsed reuses section1Complete, only the manual flag is new', 'const section1Collapsed = section1Complete && !section1ManualOpen;');
has('section2Collapsed reuses detailsComplete, only the manual flag is new', 'const section2Collapsed = detailsComplete && !section2ManualOpen;');
missing('no parallel/duplicate completeness calculation introduced for the accordions', 'const section1Complete2');
has('section 1 heading is only clickable once section1Complete (nothing to toggle before then)', 'className: "section-title" + (section1Complete ? " section-title-toggle" : ""),\n    onClick: section1Complete ? () => setSection1ManualOpen(o => !o) : undefined');
has('section 2 heading is only clickable once detailsComplete (nothing to toggle before then)', 'className: "section-title" + (detailsComplete ? " section-title-toggle" : ""),\n    onClick: detailsComplete ? () => setSection2ManualOpen(o => !o) : undefined');
has('section 1 collapsed summary line reuses the same toggle-flip handler as the heading (setSection1ManualOpen(o => !o))', 'onClick: () => setSection1ManualOpen(o => !o)');
has('section 2 collapsed summary line reuses the same toggle-flip handler as the heading (setSection2ManualOpen(o => !o))', 'onClick: () => setSection2ManualOpen(o => !o)');
has('.section-title-toggle CSS gives the clickable heading a pointer cursor', '.section-title-toggle {\n  cursor: pointer;\n  user-select: none;\n}');
has('.section-toggle-arrow CSS renders the open/closed indicator inline after the heading text', '.section-toggle-arrow {\n  display: inline-block;\n  margin-left: 8px;');
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
has('"Book →" is the sole navigation path off Step 1: sets activity plus every dependent reset AND advances the screen in one click, a strict superset of what tap-card-then-Next used to do', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerTier(null);\n      setGrooming(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');
has('tapping an act-card still only selects (sets state, no screen transition), the preview affordance was not removed, only the redundant global Next button was', 'className: "act-card " + (activity === item.id ? "selected" : ""),\n    onClick: () => {\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerTier(null);\n      setGrooming(null);\n    }\n  }');

// ─── docs/batch5-futura-headers-gate.md, Commit 1: sitewide Futura ────────
// Every explicit "font-family: 'Outfit'" declaration in the app's own
// injected stylesheet is gone; only var(--display) is used, whose own
// fallback chain ('Century Gothic', 'Outfit', sans-serif) is the sole
// intentional exception, per the doc's own carve-out.
missing('no explicit font-family: \'Outfit\' declarations remain anywhere (the --display token\'s own fallback chain is a --custom-property value, not a font-family: declaration, so it is unaffected by this check)', "font-family: 'Outfit'");
has('--display token itself is untouched: Futura first, Century Gothic and Outfit kept only as the sanctioned fallback chain', "--display: 'Futura', 'Century Gothic', 'Outfit', sans-serif;");
has('Google Fonts Outfit import kept (still needed to serve the fallback-of-fallback face named in the --display token)', "family=Outfit:wght@300;400;500;600");
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
missing('.cat-intro card background removed, no longer reads as a card', '.cat-intro {\n  background: #f7f7f7;');
missing('.cat-intro border removed, no longer reads as a card', '.cat-intro {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);');
missing('.cat-intro no longer clips its image with overflow: hidden (nothing to clip now the image bleeds past it)', '.cat-intro {\n  background: #f7f7f7;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  overflow: hidden;');
has('.cat-intro-img bleeds edge to edge of the standard content column via negative margins matching .body\'s 24px padding (full-bleed, not just 100% of its own card)', '.cat-intro-img {\n  display: block;\n  width: calc(100% + 48px);\n  margin: 0 -24px;');
has('.act-book-btn ("Book ->") is now full width (display: block, width: 100%), no longer align-self: flex-start sized to its own text', '.act-book-btn {\n  display: block;\n  width: 100%;');
missing('.act-book-btn no longer uses align-self: flex-start (superseded by display:block/width:100%)', '.act-book-btn {\n  align-self: flex-start;');
has('"Book ->" handler is untouched by the width change: still sets activity, resets every dependent field, and advances to Step 2 in one click', 'className: "act-book-btn",\n    onClick: e => {\n      e.stopPropagation();\n      setActivity(item.id);\n      setDuration(null);\n      setNumPeople(null);\n      setRiders([]);\n      setPhotographerTier(null);\n      setGrooming(null);\n      setScreen("riders");\n    }\n  }, t.bookActivity)');

// ─── docs/batch5-futura-headers-gate.md, Commit 3: Step 2 boxing + destructure ─
// Structural correctness of the two new step2-section-box wrappers was
// verified with an acorn AST parse (not just string matching): box 1 has
// exactly the 8 expected section-1 children (heading through
// cal-selection-panel) and box 2 has exactly the 7 expected section-2
// children (grooming through addon-group), nothing lost or duplicated.
has('.step2-section-box CSS matches the card system (same border/radius/padding as .control-card) for consistent boundaries across all three sections', '.step2-section-box {\n  background: #fff;\n  border: 1px solid var(--fog);\n  border-radius: 14px;\n  padding: 23px 16.5px 25px;\n  margin-bottom: 22px;\n}');
has('section 1 box wraps heading1 through cal-selection-panel (grooming and heading2 sit outside it, correctly starting section 2\'s box instead)', 'isPhotoshoot && /*#__PURE__*/React.createElement("span", {\n    className: "byo-chip"\n  }, t.byoPhotographer), /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box"\n  }, /*#__PURE__*/React.createElement("h3", {\n    className: "section-title" + (section1Complete');
has('section 1 box closes and section 2 box opens at the cal-selection-panel/grooming boundary, grooming is the first child inside section 2\'s box even though it renders before heading2', 'React.createElement("div", {\n    className: "step2-section-box"\n  }, needsGrooming && /*#__PURE__*/React.createElement("div", {\n    className: "fu2",');
has('section 2 box closes right after addon-group, immediately before section 3\'s own top-level div begins', '")")))))), screen === "riders" && datesComplete && /*#__PURE__*/React.createElement("div", {\n    className: "step2-section-box fu step2-block"');
has('header material (image band, header card, isWhisper hint, byo-chip) stays outside/above both section boxes, not swept into section 1\'s box', 'className: "detail-header-card"\n  }, /*#__PURE__*/React.createElement("h2", {\n    className: "section-title"\n  }, t.activities[actObj?.id]), /*#__PURE__*/React.createElement("p", {\n    className: "detail-desc"\n  }, t.descs[actObj?.id])), isWhisper && /*#__PURE__*/React.createElement("p", {\n    className: "section-hint"');

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
has('.cat-intro trailing gap now 22px (was 18px), completing the block-rhythm chain into the first act-category', '.cat-intro {\n  margin-bottom: 22px;\n  animation: fadeUp 0.3s ease both;\n}');
has('.act-book-btn padding now flat 16px and radius 14px, matching the Figma CTA spec and the site\'s other 14px-radius cards', '.act-book-btn {\n  display: block;\n  width: 100%;\n  margin-top: 10px;\n  padding: 16px;\n  border-radius: 14px;');

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
