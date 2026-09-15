const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('../index.html', 'utf8');

const errors = [];
const consoleErrs = [];
const virtualConsole = new (require('jsdom').VirtualConsole)();
virtualConsole.on('error', (e) => consoleErrs.push('error: ' + e.message));
virtualConsole.on('warn', (e) => consoleErrs.push('warn: ' + e));
virtualConsole.on('jsdomError', (e) => consoleErrs.push('jsdom: ' + e.message));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
});

// Give React a moment to render
setTimeout(() => {
  const { window } = dom;
  const doc = window.document;

  // Read the React root, NOT document.body. body.innerHTML contains the inline
  // <script> source, so every substring check against it matched the JS text
  // rather than anything rendered, and passed no matter what the app did.
  // Found 13 Sep 2026 when the first screen changed and the old checks did not.
  const root = doc.getElementById('root');
  const text = root ? root.textContent : '';

  console.log('Rendered root text length:', text.length);
  if (!root || text.length < 50) {
    console.log('FAIL: the app rendered nothing into #root');
    process.exit(1);
  }

  // First screen is the category chooser. Category names are on it, and since
  // 13 Sep 2026 so are the activity names, as a preview of what is inside each
  // one. Prices and the Book button are still one click deeper, so those are the
  // discriminator for "we are on the category screen, not the activity list".
  const checks = [
    ['Rides', true], ['Photoshoots', true], ['Lessons', true],
    ['Beach & Rice Field Ride', true], ['Next', true],
    ['IDR 1,600,000', false], ['Book \u2192', false],
  ];
  let bad = 0;
  checks.forEach(([needle, want]) => {
    const got = text.includes(needle);
    if (got !== want) { bad++; console.log(`FAIL: "${needle}" expected ${want}, got ${got}`); }
    else console.log(`  ok  "${needle}" ${want ? 'present' : 'absent'}`);
  });

  console.log('Console errors:', consoleErrs.length);
  if (consoleErrs.length) {
    consoleErrs.slice(0, 10).forEach((e) => console.log('  ' + e.slice(0, 200)));
  }
  process.exit(bad > 0 || consoleErrs.filter(e => !e.includes('warn')).length > 0 ? 1 : 0);
}, 1500);
