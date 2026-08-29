// src/config/google.config.js
const { google } = require('googleapis');

let sheetsClient = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const email = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  const rawKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim();
  // Strip enclosing quotes if present and replace escaped \n with actual newlines
  const privateKey = rawKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

module.exports = { getSheetsClient };
