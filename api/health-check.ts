import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1yTp-53mSv89l3LALHDlYevqeYk2AqhwUc8CiCBEN7ss';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Faltan credenciales',
        debug: { hasEmail: !!clientEmail, hasKey: !!privateKey }
      });
    }
    
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const doc = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    res.json({ status: 'ok', title: doc.data.properties?.title || 'Sheets' });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}