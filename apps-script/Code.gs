/**
 * Salty Cowboy booking log endpoint.
 *
 * Not deployed from this repo. Kept here so it stays version-controlled next to
 * the schema in index.html that it has to agree with. To change it: open the
 * Apps Script editor bound to the log spreadsheet, paste, save, redeploy.
 *
 * SETUP, in order:
 *   1. Create a NEW spreadsheet. Not Simone's "Customer Offerings" sheet.
 *   2. Rename the first tab to exactly:  log
 *   3. Extensions > Apps Script. Paste this file over Code.gs.
 *   4. Project Settings > set the timezone to  Asia/Makassar.
 *   5. Run setupHeaders() once from the editor. Grant the permission prompt.
 *   6. Deploy > New deployment > Web app.
 *        Execute as:      Me
 *        Who has access:  Anyone       <-- NOT "Anyone with a Google account"
 *   7. Copy the /exec URL into LOG_ENDPOINT in index.html.
 *
 * Step 6 is the single biggest failure in this project and it fails SILENTLY.
 * With "Anyone with a Google account", an anonymous cross-origin POST is
 * redirected to a Google login page, sendBeacon still returns true, the browser
 * try/catch sees nothing, and the sheet stays empty forever. It looks exactly
 * like "no bookings". setupDeadLogTrigger() below is what tells them apart.
 *
 * Also silent: creating a NEW deployment issues a NEW /exec URL and orphans the
 * old one. To change this code without breaking the site, edit the EXISTING
 * deployment instead of creating another.
 */

var SHEET_NAME = 'log';

// Written by name, never by position, so reordering columns in the sheet cannot
// silently shift the data. Must agree with bookingLogRow() in index.html.
var COLUMNS = [
  'ts_server',
  'ts_client',
  'ref',
  'session_id',
  'v',
  'type',
  'lang',
  'activity_id',
  'duration',
  'dates_iso',
  'date_count',
  'time',
  'num_people',
  'weight_asked',
  'w1',
  'w2',
  'w3',
  'w4',
  'photographer_addon',
  'booking_for_other',
  'grooming',
  'total_price',
  'has_notes',
  'outcome',
  'horse',
  // Schema v2, added 11 Sep 2026. Appended at the END on purpose: setupHeaders()
  // rewrites row 1 in place, so inserting mid-list would move the headers without
  // moving the data rows under them and silently mislabel every existing row.
  // Index-aligned per rider: ages[i], weights[i] and experience[i] are the same
  // person. No names, by design.
  'ages',
  'weights',
  'experience'
];

// Anything not in this list is dropped. Cheap defence against a stray POST from
// somewhere that is not the booking page. Keep in sync with ACTIVITIES.
// Verified against index.html on 10 Sep 2026, all twelve.
var VALID_ACTIVITY_IDS = [
  'beach', 'dressage', 'groupclinic', 'insta', 'joinup', 'masterclass',
  'photo_beach', 'photo_cottages', 'photo_paddock', 'photo_ricefield',
  'photo_stable', 'whisper'
];

function setupHeaders() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No sheet named "' + SHEET_NAME + '". Rename the first tab.');
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.setFrozenRows(1);
  Logger.log('Wrote ' + COLUMNS.length + ' headers.');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var payload = JSON.parse(e.postData.contents);

    // Drop rows whose activity we do not recognise. Silent by design: there is
    // no caller waiting on the answer, and sendBeacon cannot read a response.
    if (payload.activity_id && VALID_ACTIVITY_IDS.indexOf(payload.activity_id) === -1) {
      return ContentService.createTextOutput('ignored');
    }

    payload.ts_server = new Date();

    var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headers.map(function (name) {
      var v = payload[name];
      return v === undefined || v === null ? '' : v;
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    // Never throw. A 500 here would do nothing useful (nobody reads the
    // response) and Apps Script error mails are noisier than they are helpful.
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

/**
 * Run once from the editor. Creates a daily check that emails if the log has
 * been silent for 72 hours. Both silent failure modes (wrong access setting,
 * orphaned /exec URL) produce a sheet that looks identical to "no bookings",
 * so this is the only thing that distinguishes them.
 */
function setupDeadLogTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'checkDeadLog') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkDeadLog').timeBased().everyDays(1).atHour(9).create();
  Logger.log('Daily dead-log check installed.');
}

function checkDeadLog() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  var last = sheet.getLastRow();

  var body;
  if (last < 2) {
    body = 'The Salty Cowboy booking log has never received a row.\n\n' +
      'Most likely the web app deployment is set to "Anyone with a Google account" ' +
      'instead of "Anyone", or LOG_ENDPOINT in index.html is empty or points at an ' +
      'orphaned deployment URL.\n\n' + sheet.getParent().getUrl();
  } else {
    var tsCol = COLUMNS.indexOf('ts_server') + 1;
    var latest = sheet.getRange(last, tsCol).getValue();
    var ageHours = (new Date() - new Date(latest)) / 36e5;
    if (ageHours < 72) return;
    body = 'No bookings logged in ' + Math.round(ageHours) + ' hours.\n\n' +
      'Either genuinely quiet, or the endpoint broke. A new deployment issues a ' +
      'new /exec URL and orphans the old one, which fails silently.\n\n' +
      sheet.getParent().getUrl();
  }

  // Resolved at run time rather than hardcoded, since this file lives in a
  // public repo. The script executes as whoever deployed it, so this is Ro.
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Salty Cowboy booking log is quiet', body);
}
