import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from './_lib/auth';
import { connectToDatabase } from './_lib/db';
import CommitteeMember from './_models/CommitteeMember';
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

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const db = await connectToDatabase();
  const { festivalId } = req.query;

  if (req.method === 'GET') {
    try {
      if (db) {
        const members = await CommitteeMember.find({ festivalId }).sort({ createdAt: 1 });
        return res.status(200).json(members);
      } else {
        store.init();
        const members = store.committeeMembers.filter((m) => m.festivalId === festivalId);
        return res.status(200).json(members);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const { festivalId: fId, name, position } = req.body || {};

    if (!fId || !name) {
      return res.status(400).json({ message: 'Festival ID and Name are required' });
    }

    try {
      if (db) {
        const member = await CommitteeMember.create({
          festivalId: fId,
          name: name.trim(),
          position: position?.trim(),
        });
        return res.status(201).json(member);
      } else {
        store.init();
        const newMember = {
          _id: 'cm_' + Date.now(),
          festivalId: fId,
          name: name.trim(),
          position: position?.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.committeeMembers.push(newMember);
        return res.status(201).json(newMember);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const { id } = req.query;
    const memberId = Array.isArray(id) ? id[0] : id;

    if (!memberId) {
      return res.status(400).json({ message: 'Member ID is required' });
    }

    try {
      if (db) {
        await CommitteeMember.findByIdAndDelete(memberId);
        return res.status(200).json({ message: 'Committee member deleted' });
      } else {
        store.init();
        const idx = store.committeeMembers.findIndex((m) => m._id === memberId);
        if (idx !== -1) store.committeeMembers.splice(idx, 1);
        return res.status(200).json({ message: 'Committee member deleted' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

