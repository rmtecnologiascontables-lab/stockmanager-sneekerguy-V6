import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { getAuthClient } from './helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = await getAuthClient();
    if (!auth) {
      return res.status(401).json({ status: 'error', message: 'Faltan credenciales' });
    }
    const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1yTp-53mSv89l3LALHDlYevqeYk2AqhwUc8CiCBEN7ss';
    const sheets = google.sheets({ version: 'v4', auth });
    const doc = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    res.json({ status: 'ok', title: doc.data.properties?.title || 'Sheets' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}