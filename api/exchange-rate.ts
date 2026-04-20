import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json() as { rates: { MXN: number } };
    const rate = data.rates.MXN > 18 ? 17.31 : data.rates.MXN;
    res.json({ rate });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el tipo de cambio' });
  }
}