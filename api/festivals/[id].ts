import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Festival from '../_models/Festival';
import ActivityLog from '../_models/ActivityLog';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload || payload.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }

  const { id } = req.query;
  const festivalId = Array.isArray(id) ? id[0] : id;

  if (!festivalId) {
    return res.status(400).json({ message: 'Festival ID is required' });
  }

  const db = await connectToDatabase();

  if (req.method === 'PUT') {
    const { apartmentName, festivalName, isActive } = req.body || {};

    try {
      if (db) {
        if (isActive) {
          await Festival.updateMany({}, { isActive: false });
        }

        const festival = await Festival.findById(festivalId);
        if (!festival) return res.status(404).json({ message: 'Festival not found' });

        if (apartmentName) festival.apartmentName = apartmentName.trim();
        if (festivalName) festival.festivalName = festivalName.trim();
        if (typeof isActive === 'boolean') festival.isActive = isActive;

        await festival.save();

        await ActivityLog.create({
          userId: payload.userId,
          userName: payload.fullName,
          action: 'UPDATE_FESTIVAL',
          entityType: 'FESTIVAL',
          entityId: festivalId,
          description: `Updated festival ${festival.festivalName} ${festival.year}`,
        });

        return res.status(200).json(festival);
      } else {
        await store.init();
        if (isActive) {
          store.festivals.forEach((f) => (f.isActive = false));
        }

        const festival = store.festivals.find((f) => f._id === festivalId);
        if (!festival) return res.status(404).json({ message: 'Festival not found' });

        if (apartmentName) festival.apartmentName = apartmentName.trim();
        if (festivalName) festival.festivalName = festivalName.trim();
        if (typeof isActive === 'boolean') festival.isActive = isActive;
        festival.updatedAt = new Date().toISOString();

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          userId: payload.userId,
          userName: payload.fullName,
          action: 'UPDATE_FESTIVAL',
          entityType: 'FESTIVAL',
          entityId: festivalId,
          description: `Updated festival ${festival.festivalName} ${festival.year}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json(festival);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
