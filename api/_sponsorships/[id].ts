import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Sponsorship from '../_models/Sponsorship';
import ActivityLog from '../_models/ActivityLog';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const sponsorshipId = Array.isArray(id) ? id[0] : id;

  if (!sponsorshipId) {
    return res.status(400).json({ message: 'Sponsorship ID is required' });
  }

  const db = await connectToDatabase();

  if (req.method === 'PUT') {
    const {
      flatNumber,
      residentName,
      sponsoredItem,
      amount,
      paymentMode,
      date,
      description,
      notes,
      paymentReference,
      proofUrl,
    } = req.body || {};

    try {
      if (db) {
        const sponsorship = await Sponsorship.findById(sponsorshipId);
        if (!sponsorship) return res.status(404).json({ message: 'Sponsorship record not found' });

        const isOwner = sponsorship.createdBy.toString() === payload.userId;
        if (payload.role !== 'ADMIN' && !isOwner) {
          return res.status(403).json({ message: 'Forbidden. You can edit only records created by yourself.' });
        }

        if (flatNumber) sponsorship.flatNumber = flatNumber.trim();
        if (residentName) sponsorship.residentName = residentName.trim();
        if (sponsoredItem) sponsorship.sponsoredItem = sponsoredItem.trim();
        if (amount) sponsorship.amount = Number(amount);
        if (paymentMode) sponsorship.paymentMode = paymentMode;
        if (date) sponsorship.date = new Date(date);
        if (description !== undefined) sponsorship.description = description.trim();
        if (notes !== undefined) sponsorship.notes = notes.trim();
        if (paymentReference !== undefined) sponsorship.paymentReference = paymentReference.trim();
        if (proofUrl !== undefined) sponsorship.proofUrl = proofUrl;

        sponsorship.updatedBy = payload.userId;
        await sponsorship.save();

        await ActivityLog.create({
          festivalId: sponsorship.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'EDIT_SPONSORSHIP',
          entityType: 'SPONSORSHIP',
          entityId: sponsorshipId,
          description: `Updated sponsorship record for Flat ${sponsorship.flatNumber} (${sponsorship.sponsoredItem})`,
        });

        return res.status(200).json(sponsorship);
      } else {
        await store.init();
        const sponsorship = store.sponsorships.find((s) => s._id === sponsorshipId);
        if (!sponsorship) return res.status(404).json({ message: 'Sponsorship record not found' });

        const isOwner = sponsorship.createdBy === payload.userId;
        if (payload.role !== 'ADMIN' && !isOwner) {
          return res.status(403).json({ message: 'Forbidden. You can edit only records created by yourself.' });
        }

        if (flatNumber) sponsorship.flatNumber = flatNumber.trim();
        if (residentName) sponsorship.residentName = residentName.trim();
        if (sponsoredItem) sponsorship.sponsoredItem = sponsoredItem.trim();
        if (amount) sponsorship.amount = Number(amount);
        if (paymentMode) sponsorship.paymentMode = paymentMode;
        if (date) sponsorship.date = new Date(date).toISOString();
        if (description !== undefined) sponsorship.description = description.trim();
        if (notes !== undefined) sponsorship.notes = notes.trim();
        if (paymentReference !== undefined) sponsorship.paymentReference = paymentReference.trim();
        if (proofUrl !== undefined) sponsorship.proofUrl = proofUrl;
        sponsorship.updatedBy = payload.userId;
        sponsorship.updatedAt = new Date().toISOString();

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: sponsorship.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'EDIT_SPONSORSHIP',
          entityType: 'SPONSORSHIP',
          entityId: sponsorshipId,
          description: `Updated sponsorship record for Flat ${sponsorship.flatNumber} (${sponsorship.sponsoredItem})`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json(sponsorship);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Only Admins can delete transaction records.' });
    }

    try {
      if (db) {
        const sponsorship = await Sponsorship.findById(sponsorshipId);
        if (!sponsorship) return res.status(404).json({ message: 'Sponsorship record not found' });

        await Sponsorship.findByIdAndDelete(sponsorshipId);

        await ActivityLog.create({
          festivalId: sponsorship.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_SPONSORSHIP',
          entityType: 'SPONSORSHIP',
          entityId: sponsorshipId,
          description: `Deleted sponsorship of ₹${sponsorship.amount} (${sponsorship.sponsoredItem}) for Flat ${sponsorship.flatNumber}`,
        });

        return res.status(200).json({ message: 'Sponsorship record deleted successfully' });
      } else {
        await store.init();
        const index = store.sponsorships.findIndex((s) => s._id === sponsorshipId);
        if (index === -1) return res.status(404).json({ message: 'Sponsorship record not found' });

        const sponsorship = store.sponsorships[index];
        store.sponsorships.splice(index, 1);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: sponsorship.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_SPONSORSHIP',
          entityType: 'SPONSORSHIP',
          entityId: sponsorshipId,
          description: `Deleted sponsorship of ₹${sponsorship.amount} (${sponsorship.sponsoredItem}) for Flat ${sponsorship.flatNumber}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json({ message: 'Sponsorship record deleted successfully' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
