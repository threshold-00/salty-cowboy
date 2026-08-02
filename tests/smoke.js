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

  // Poke at the app
  const activityCards = doc.querySelectorAll('.activity-card, .a-card, [data-activity]');
  const anyContent = doc.body.innerHTML.length;
  const hasBeach = doc.body.innerHTML.includes('Beach');
  const hasCottages = doc.body.innerHTML.includes('Cottages');
  const hasInsta = doc.body.innerHTML.includes('Insta');
  const hasDressage = doc.body.innerHTML.includes('Dressage');

  console.log('Body innerHTML length:', anyContent);
  console.log('Contains "Beach":', hasBeach);
  console.log('Contains "Cottages":', hasCottages);
  console.log('Contains "Insta":', hasInsta);
  console.log('Contains "Dressage":', hasDressage);
  console.log('Console errors:', consoleErrs.length);
  if (consoleErrs.length) {
    consoleErrs.slice(0, 10).forEach((e) => console.log('  ' + e.slice(0, 200)));
  }
  process.exit(consoleErrs.filter(e => !e.includes('warn')).length > 0 ? 1 : 0);
}, 1500);
