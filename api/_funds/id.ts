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

  const { id } = req.query;
  const fundId = Array.isArray(id) ? id[0] : id;

  if (!fundId) {
    return res.status(400).json({ message: 'Fund ID is required' });
  }

  const db = await connectToDatabase();

  if (req.method === 'PUT') {
    const {
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

    try {
      if (db) {
        const fund = await Fund.findById(fundId);
        if (!fund) return res.status(404).json({ message: 'Fund record not found' });

        // Permission check: Admin can edit any, Member can edit only their own
        const isOwner = fund.createdBy.toString() === payload.userId;
        if (payload.role !== 'ADMIN' && !isOwner) {
          return res.status(403).json({ message: 'Forbidden. You can edit only records created by yourself.' });
        }

        if (flatNumber) fund.flatNumber = flatNumber.trim();
        if (residentName) fund.residentName = residentName.trim();
        if (amount) fund.amount = Number(amount);
        if (paymentMode) fund.paymentMode = paymentMode;
        if (date) fund.date = new Date(date);
        if (description) fund.description = description.trim();
        if (notes !== undefined) fund.notes = notes.trim();
        if (transactionReference !== undefined) fund.transactionReference = transactionReference.trim();
        if (proofUrl !== undefined) fund.proofUrl = proofUrl;

        fund.updatedBy = payload.userId;
        await fund.save();

        await ActivityLog.create({
          festivalId: fund.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'EDIT_FUND',
          entityType: 'FUND',
          entityId: fundId,
          description: `Updated fund record for Flat ${fund.flatNumber} (₹${fund.amount})`,
        });

        return res.status(200).json(fund);
      } else {
        await store.init();
        const fund = store.funds.find((f) => f._id === fundId);
        if (!fund) return res.status(404).json({ message: 'Fund record not found' });

        const isOwner = fund.createdBy === payload.userId;
        if (payload.role !== 'ADMIN' && !isOwner) {
          return res.status(403).json({ message: 'Forbidden. You can edit only records created by yourself.' });
        }

        if (flatNumber) fund.flatNumber = flatNumber.trim();
        if (residentName) fund.residentName = residentName.trim();
        if (amount) fund.amount = Number(amount);
        if (paymentMode) fund.paymentMode = paymentMode;
        if (date) fund.date = new Date(date).toISOString();
        if (description) fund.description = description.trim();
        if (notes !== undefined) fund.notes = notes.trim();
        if (transactionReference !== undefined) fund.transactionReference = transactionReference.trim();
        if (proofUrl !== undefined) fund.proofUrl = proofUrl;
        fund.updatedBy = payload.userId;
        fund.updatedAt = new Date().toISOString();

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: fund.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'EDIT_FUND',
          entityType: 'FUND',
          entityId: fundId,
          description: `Updated fund record for Flat ${fund.flatNumber} (₹${fund.amount})`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json(fund);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Only Admin can delete financial records!
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden. Only Admins can delete transaction records.' });
    }

    try {
      if (db) {
        const fund = await Fund.findById(fundId);
        if (!fund) return res.status(404).json({ message: 'Fund record not found' });

        await Fund.findByIdAndDelete(fundId);

        await ActivityLog.create({
          festivalId: fund.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_FUND',
          entityType: 'FUND',
          entityId: fundId,
          description: `Deleted fund record of ₹${fund.amount} for Flat ${fund.flatNumber}`,
        });

        return res.status(200).json({ message: 'Fund record deleted successfully' });
      } else {
        await store.init();
        const index = store.funds.findIndex((f) => f._id === fundId);
        if (index === -1) return res.status(404).json({ message: 'Fund record not found' });

        const fund = store.funds[index];
        store.funds.splice(index, 1);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: fund.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_FUND',
          entityType: 'FUND',
          entityId: fundId,
          description: `Deleted fund record of ₹${fund.amount} for Flat ${fund.flatNumber}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json({ message: 'Fund record deleted successfully' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
