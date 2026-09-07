import type { VercelRequest, VercelResponse } from '@vercel/node';
import indexHandler from './_expenses/index';
import suggestionsHandler from './_expenses/suggestions';
import idHandler from './_expenses/id';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  if (url.includes('suggestions')) {
    return suggestionsHandler(req, res);
  }
  const parts = url.split('?')[0].split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];

  if (lastPart && lastPart !== 'expenses' && lastPart !== 'api' && lastPart !== 'suggestions') {
    req.query = req.query || {};
    req.query.id = lastPart;
    return idHandler(req, res);
  }
  return indexHandler(req, res);
}
