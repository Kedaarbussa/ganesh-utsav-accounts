import type { VercelRequest, VercelResponse } from '@vercel/node';
import indexHandler from './_festivals/index';
import idHandler from './_festivals/id';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

