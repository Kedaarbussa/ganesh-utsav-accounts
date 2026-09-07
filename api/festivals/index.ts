import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Festival from '../_models/Festival';
import ActivityLog from '../_models/ActivityLog';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const db = await connectToDatabase();

  if (req.method === 'GET') {
    try {
      if (db) {
        let festivals = await Festival.find().sort({ year: -1 });
        if (festivals.length === 0) {
          const defaultFest = await Festival.create({
            apartmentName: 'CHANAKYA RESIDENCY',
            festivalName: 'GANESH UTSAV',
            year: new Date().getFullYear(),
            isActive: true,
          });
          festivals = [defaultFest];
        }
        return res.status(200).json(festivals);
      } else {
        await store.init();
        return res.status(200).json(store.festivals);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const { apartmentName, festivalName, year } = req.body || {};

    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }

    try {
      if (db) {
        const existing = await Festival.findOne({ year: Number(year) });
        if (existing) {
          return res.status(400).json({ message: `Festival year ${year} already exists.` });
        }

        // Deactivate other festivals if requested, or leave as active switch
        const festival = await Festival.create({
          apartmentName: apartmentName?.trim() || 'CHANAKYA RESIDENCY',
          festivalName: festivalName?.trim() || 'GANESH UTSAV',
          year: Number(year),
          isActive: true,
        });

        await ActivityLog.create({
          userId: payload.userId,
          userName: payload.fullName,
          action: 'CREATE_FESTIVAL',
          entityType: 'FESTIVAL',
          entityId: festival._id.toString(),
          description: `Created festival year ${year}`,
        });

        return res.status(201).json(festival);
      } else {
        await store.init();
        const existing = store.festivals.find((f) => f.year === Number(year));
        if (existing) {
          return res.status(400).json({ message: `Festival year ${year} already exists.` });
        }

        const newFest = {
          _id: 'fest_' + Date.now(),
          apartmentName: apartmentName?.trim() || 'CHANAKYA RESIDENCY',
          festivalName: festivalName?.trim() || 'GANESH UTSAV',
          year: Number(year),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.festivals.unshift(newFest);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          userId: payload.userId,
          userName: payload.fullName,
          action: 'CREATE_FESTIVAL',
          entityType: 'FESTIVAL',
          entityId: newFest._id,
          description: `Created festival year ${year}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(201).json(newFest);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
