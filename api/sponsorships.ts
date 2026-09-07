import type { VercelRequest, VercelResponse } from '@vercel/node';
import indexHandler from './_sponsorships/index';
import idHandler from './_sponsorships/id';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  const parts = url.split('?')[0].split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];

  if (lastPart && lastPart !== 'sponsorships' && lastPart !== 'api') {
    req.query = req.query || {};
    req.query.id = lastPart;
    return idHandler(req, res);
  }
  return indexHandler(req, res);
}
