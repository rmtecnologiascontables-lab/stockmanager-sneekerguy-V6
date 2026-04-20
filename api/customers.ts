import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1yTp-53mSv89l3LALHDlYevqeYk2AqhwUc8CiCBEN7ss';

const parseSheetNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().trim().replace(/[$\s]/g, '').replace(/,/g, '').replace(/\((.*)\)/, '-$1');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      return res.status(500).json({ error: 'Auth failed' });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SHEET_ID,
      range: "'CLIENTES'!A2:L",
    });

    const rows = response.data.values;
    if (!rows) return res.json([]);

    const customers = rows.map((row, index) => ({
      id: row[0] || `c-${index}`,
      name: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
      address: row[4] || '',
      ig_handle: row[5] || '',
      referido_por: row[6] || '',
      fecha_alta: row[7] || '',
      total_pedidos: parseInt(row[8]) || 0,
      total_comprado: parseSheetNumber(row[9]),
      notes: row[10] || '',
      tipo_de_pago: row[11] || '',
    }));

    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}