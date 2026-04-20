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
      range: "'MASTER_DATA'!A2:AL",
    });

    const rows = response.data.values;
    if (!rows) return res.json([]);

    const products = rows.map((row, index) => ({
      id: `${row[0] || `row-${index + 2}`}-${index}`,
      originalId: row[0] || '',
      createdAt: row[1] || '',
      sku: row[2] || '',
      clientName: row[3] || '',
      clientEmail: row[4] || '',
      clientPhone: row[5] || '',
      clientAddress: row[6] || '',
      referenciado_por: row[7] || '',
      metodo_pago_cliente: row[8] || '',
      name: row[9] || '',
      category: row[10] || '',
      boutique: row[11] || '',
      imageUrl: row[12] || '',
      tipo_compra: row[13] || '',
      buyPriceUsd: parseSheetNumber(row[14]),
      exchangeRate: parseSheetNumber(row[15]),
      buyPriceMxn: parseSheetNumber(row[16]),
      sellPriceMxn: parseSheetNumber(row[17]),
      profit: parseSheetNumber(row[18]),
      costo_envio_usa: parseSheetNumber(row[19]),
      estado_envio_usa: row[20] || '',
      estado_entrega_usa: row[21] || '',
      ubicacion_actual: row[22] || '',
      fecha_ingreso_zafiro: row[23] || '',
      incluido_en_corte_zafiro: row[24] || '',
      estado_entrega_mx: row[25] || '',
      fecha_entrega_cliente: row[26] || '',
      anticipo_abonado: parseSheetNumber(row[27]),
      total_pagado: parseSheetNumber(row[28]),
      saldo_pendiente: parseSheetNumber(row[29]),
      abonado_amex: parseSheetNumber(row[30]),
      utilidad_tomada: parseSheetNumber(row[31]),
      revisado_rodrigo: row[32] || '',
      notes: row[33] || '',
      currentStatus: (row[34] || 'COMPRADO').toUpperCase(),
      totalBuyPriceUsd: parseSheetNumber(row[35]),
      totalBuyPriceMxn: parseSheetNumber(row[36]),
      card: row[37] || '',
      quantity: 1,
      brand: '',
      updatedAt: new Date().toISOString(),
    }));

    res.json(products);
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}