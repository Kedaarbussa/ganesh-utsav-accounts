import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Fund from '../_models/Fund';
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

        const funds = await Fund.find(query)
          .populate('createdBy', 'fullName username')
          .sort({ date: -1, createdAt: -1 });

        return res.status(200).json(funds);
      } else {
        await store.init();
        let funds = store.funds;
        if (festivalId) {
          funds = funds.filter((f) => f.festivalId === festivalId);
        }
        funds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json(funds);
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
      amount,
      paymentMode,
      date,
      description,
      notes,
      transactionReference,
      proofUrl,
    } = req.body || {};

    if (!fId || !flatNumber || !residentName || !amount || !paymentMode) {
      return res.status(400).json({
        message: 'Festival ID, Flat Number, Resident Name, Amount, and Payment Mode are required',
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
        const fund = await Fund.create({
          festivalId: fId,
          flatNumber: flatNumber.trim(),
          residentName: residentName.trim(),
          amount: Number(amount),
          paymentMode,
          date: date ? new Date(date) : new Date(),
          description: description?.trim() || 'Festival Contribution',
          notes: notes?.trim(),
          transactionReference: transactionReference?.trim(),
          proofUrl,
          createdBy: payload.userId,
        });

        await ActivityLog.create({
          festivalId: fId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'ADD_FUND',
          entityType: 'FUND',
          entityId: fund._id.toString(),
          description: `Added ₹${amount} (${paymentMode}) from Flat ${flatNumber} (${residentName})`,
        });

        return res.status(201).json(fund);
      } else {
        await store.init();
        const newFund = {
          _id: 'fnd_' + Date.now(),
          festivalId: fId,
          flatNumber: flatNumber.trim(),
          residentName: residentName.trim(),
          amount: Number(amount),
          paymentMode,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          description: description?.trim() || 'Festival Contribution',
          notes: notes?.trim(),
          transactionReference: transactionReference?.trim(),
          proofUrl,
          createdBy: payload.userId,
          createdByName: payload.fullName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.funds.unshift(newFund);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: fId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'ADD_FUND',
          entityType: 'FUND',
          entityId: newFund._id,
          description: `Added ₹${amount} (${paymentMode}) from Flat ${flatNumber} (${residentName})`,
          createdAt: new Date().toISOString(),
        });

        return res.status(201).json(newFund);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
