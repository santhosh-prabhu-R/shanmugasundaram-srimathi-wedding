/**
 * =====================================================
 * Wedding Guest Wishes — Google Apps Script Backend
 * Shanmugasundaram × Srimathi | 16 November 2026
 * =====================================================
 *
 * Deploy as: Web App
 *   Execute as:  Me (your Google account)
 *   Who has access: Anyone
 *
 * Spreadsheet columns (Row 1 = header):
 *   A: ID          (auto-generated UUID)
 *   B: Name        (guest name, 1–80 chars)
 *   C: Message     (wish text, 1–1000 chars)
 *   D: CreatedAt   (ISO 8601 timestamp)
 */

// ─── CONFIGURATION ─────────────────────────────────
// Replace with your actual Google Sheets Spreadsheet ID
// (the long string in the spreadsheet URL between /d/ and /edit)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Wishes';

// ─── VALIDATION CONSTANTS ──────────────────────────
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 1000;

// ─── HELPERS ───────────────────────────────────────

/**
 * Generate a UUID v4 string.
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Get the wishes sheet, creating it with headers if needed.
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID', 'Name', 'Message', 'CreatedAt']);
    // Protect the sheet so only the script owner can edit directly
    const protection = sheet.protect().setDescription('Wishes data — script-managed');
    protection.setWarningOnly(true);
  }
  return sheet;
}

/**
 * Build a JSON response with CORS headers for cross-origin access.
 */
function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sanitize a string — trim whitespace.
 * The frontend uses textContent for rendering so HTML is safe,
 * but we still trim server-side.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

// ─── REQUEST HANDLERS ──────────────────────────────

/**
 * Handle GET requests — retrieve all wishes, newest first.
 *
 * Query params:
 *   action=get (default)
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();

    // If only the header row exists, return empty array
    if (lastRow <= 1) {
      return jsonResponse({ success: true, wishes: [] });
    }

    // Read all data rows (skip header)
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 4);
    const rows = dataRange.getValues();

    // Map to objects and reverse for newest-first
    const wishes = rows
      .filter(row => row[0] && row[1]) // skip any empty rows
      .map(row => ({
        id: row[0],
        name: row[1],
        message: row[2],
        created_at: row[3]
      }))
      .reverse();

    return jsonResponse({ success: true, wishes: wishes });

  } catch (error) {
    console.error('GET error:', error);
    return jsonResponse({ success: false, error: 'Unable to retrieve wishes.' });
  }
}

/**
 * Handle POST requests — submit a new wish.
 *
 * POST body (JSON):
 *   { "name": "Guest Name", "message": "Wish message" }
 */
function doPost(e) {
  try {
    // Parse request body
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: 'Invalid request format.' });
    }

    const name = sanitize(body.name);
    const message = sanitize(body.message);

    // ── Server-side validation ──
    if (!name || name.length === 0) {
      return jsonResponse({ success: false, error: 'Name is required.' });
    }
    if (name.length > MAX_NAME_LENGTH) {
      return jsonResponse({ success: false, error: 'Name must be ' + MAX_NAME_LENGTH + ' characters or fewer.' });
    }
    if (!message || message.length === 0) {
      return jsonResponse({ success: false, error: 'Message is required.' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ success: false, error: 'Message must be ' + MAX_MESSAGE_LENGTH + ' characters or fewer.' });
    }

    // ── Save to spreadsheet ──
    const sheet = getSheet();
    const id = generateUUID();
    const createdAt = new Date().toISOString();

    sheet.appendRow([id, name, message, createdAt]);

    // Return the saved wish
    return jsonResponse({
      success: true,
      wish: {
        id: id,
        name: name,
        message: message,
        created_at: createdAt
      }
    });

  } catch (error) {
    console.error('POST error:', error);
    return jsonResponse({ success: false, error: 'Unable to save your wish. Please try again.' });
  }
}
