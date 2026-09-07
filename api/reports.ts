import type { VercelRequest, VercelResponse } from '@vercel/node';
import dashboardHandler from './_reports/dashboard';
import finalHandler from './_reports/final';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  if (url.includes('final')) {
    return finalHandler(req, res);
  }
  return dashboardHandler(req, res);
}
