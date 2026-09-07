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

  const db = await connectToDatabase();
  const { festivalId } = req.query;

  if (req.method === 'GET') {
    try {
      if (db) {
        const query: any = {};
        if (festivalId) query.festivalId = festivalId;

        const sponsorships = await Sponsorship.find(query)
          .populate('createdBy', 'fullName username')
          .sort({ date: -1, createdAt: -1 });

        return res.status(200).json(sponsorships);
      } else {
        await store.init();
        let sponsorships = store.sponsorships;
        if (festivalId) {
          sponsorships = sponsorships.filter((s) => s.festivalId === festivalId);
        }
        sponsorships.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json(sponsorships);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    const {
      festivalId: fId,
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

    if (!fId || !flatNumber || !residentName || !sponsoredItem || !amount || !paymentMode) {
      return res.status(400).json({
        message: 'Festival ID, Flat Number, Resident Name, Sponsored Item, Amount, and Payment Mode are required',
      });
    }

    if (paymentMode !== 'CASH' && paymentMode !== 'ONLINE') {
      return res.status(400).json({ message: 'Payment mode must be strictly CASH or ONLINE' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    try {
      if (db) {
        const sponsorship = await Sponsorship.create({
          festivalId: fId,
          flatNumber: flatNumber.trim(),
          residentName: residentName.trim(),
          sponsoredItem: sponsoredItem.trim(),
          amount: Number(amount),
          paymentMode,
          date: date ? new Date(date) : new Date(),
          description: description?.trim(),
          notes: notes?.trim(),
          paymentReference: paymentReference?.trim(),
          proofUrl,
          createdBy: payload.userId,
        });

        await ActivityLog.create({
          festivalId: fId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'ADD_SPONSORSHIP',
          entityType: 'SPONSORSHIP',
          entityId: sponsorship._id.toString(),
          description: `Added Sponsorship ₹${amount} (${paymentMode}) for ${sponsoredItem} from Flat ${flatNumber}`,
        });

        return res.status(201).json(sponsorship);
      } else {
        await store.init();
        const newSponsorship = {
          _id: 'spn_' + Date.now(),
          festivalId: fId,
          flatNumber: flatNumber.trim(),
          residentName: residentName.trim(),
          sponsoredItem: sponsoredItem.trim(),
          amount: Number(amount),
          paymentMode,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          description: description?.trim(),
          notes: notes?.trim(),
          paymentReference: paymentReference?.trim(),
          proofUrl,
          createdBy: payload.userId,
          createdByName: payload.fullName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.sponsorships.unshift(newSponsorship);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: fId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'ADD_SPONSORSHIP',
          entityType: 'SPONSORSHIP',
          entityId: newSponsorship._id,
          description: `Added Sponsorship ₹${amount} (${paymentMode}) for ${sponsoredItem} from Flat ${flatNumber}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(201).json(newSponsorship);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
