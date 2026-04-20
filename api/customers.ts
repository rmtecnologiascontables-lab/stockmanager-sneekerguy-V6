import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { getAuthClient, parseSheetNumber, SHEET_ID } from './helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = await getAuthClient();
    if (!auth) return res.status(500).json({ error: 'Auth failed' });

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