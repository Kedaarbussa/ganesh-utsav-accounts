import type { VercelRequest, VercelResponse } from '@vercel/node';
import indexHandler from './_festivals/index';
import idHandler from './_festivals/id';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  const parts = url.split('?')[0].split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];

  if (lastPart && lastPart !== 'festivals' && lastPart !== 'api') {
    req.query = req.query || {};
    req.query.id = lastPart;
    return idHandler(req, res);
  }
  return indexHandler(req, res);
}
