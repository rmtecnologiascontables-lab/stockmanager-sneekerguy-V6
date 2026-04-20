import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1yTp-53mSv89l3LALHDlYevqeYk2AqhwUc8CiCBEN7ss';

const getCleanAuth = async () => {
  try {
    const saJsonPath = path.join(process.cwd(), 'sneeker-guy-v3-d4f33535e63e.json');
    if (fs.existsSync(saJsonPath)) {
      const saData = JSON.parse(fs.readFileSync(saJsonPath, 'utf-8'));
      return { clientEmail: saData.client_email, privateKey: saData.private_key };
    }
  } catch (e) {
    console.error('[Auth] Error:', e);
  }
  let clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  let rawKeyInput = process.env.GOOGLE_PRIVATE_KEY || '';
  let privateKey = rawKeyInput.includes('\\n') ? rawKeyInput.replace(/\\n/g, '\n') : rawKeyInput;
  return { clientEmail, privateKey };
};

export const getAuthClient = async () => {
  const { clientEmail, privateKey } = await getCleanAuth();
  if (!clientEmail || !privateKey) return null;
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });
};

export const parseSheetNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().trim().replace(/[$\s]/g, '').replace(/,/g, '').replace(/\((.*)\)/, '-$1');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const sheets = google.sheets('v4');
export { SHEET_ID };
export const getCleanAuth as getAuthHelpers };