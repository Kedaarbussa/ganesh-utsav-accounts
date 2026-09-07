import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from './_lib/auth';
import { connectToDatabase } from './_lib/db';
import ActivityLog from './_models/ActivityLog';
import { store } from './_lib/inMemoryStore';

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

  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload || payload.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }

  const { festivalId } = req.query;

  try {
    const db = await connectToDatabase();

    if (db) {
      const query: any = {};
      if (festivalId) query.festivalId = festivalId;

      const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
      return res.status(200).json(logs);
    } else {
      store.init();
      let logs = store.activityLogs;
      if (festivalId) {
        logs = logs.filter((l) => !l.festivalId || l.festivalId === festivalId);
      }
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(200).json(logs.slice(0, 100));
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

