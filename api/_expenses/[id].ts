import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Expense from '../_models/Expense';
import ActivityLog from '../_models/ActivityLog';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const expenseId = Array.isArray(id) ? id[0] : id;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required' });
  }

  const db = await connectToDatabase();

  if (req.method === 'PUT') {
    const {
      expenseDescription,
      amount,
      spentBy,
      paymentMode,
      date,
      notes,
      receiptUrl,
    } = req.body || {};

    try {
      if (db) {
        const expense = await Expense.findById(expenseId);
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });

        const isOwner = expense.createdBy.toString() === payload.userId;
        if (payload.role !== 'ADMIN' && !isOwner) {
          return res.status(403).json({ message: 'Forbidden. You can edit only records created by yourself.' });
        }

        if (expenseDescription) expense.expenseDescription = expenseDescription.trim();
        if (amount) expense.amount = Number(amount);
        if (spentBy) expense.spentBy = spentBy.trim();
        if (paymentMode) expense.paymentMode = paymentMode;
        if (date) expense.date = new Date(date);
        if (notes !== undefined) expense.notes = notes.trim();
        if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

        expense.updatedBy = payload.userId;
        await expense.save();

        await ActivityLog.create({
          festivalId: expense.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'EDIT_EXPENSE',
          entityType: 'EXPENSE',
          entityId: expenseId,
          description: `Updated expense record "${expense.expenseDescription}" (₹${expense.amount})`,
        });

        return res.status(200).json(expense);
      } else {
        await store.init();
        const expense = store.expenses.find((e) => e._id === expenseId);
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });

        const isOwner = expense.createdBy === payload.userId;
        if (payload.role !== 'ADMIN' && !isOwner) {
          return res.status(403).json({ message: 'Forbidden. You can edit only records created by yourself.' });
        }

        if (expenseDescription) expense.expenseDescription = expenseDescription.trim();
        if (amount) expense.amount = Number(amount);
        if (spentBy) expense.spentBy = spentBy.trim();
        if (paymentMode) expense.paymentMode = paymentMode;
        if (date) expense.date = new Date(date).toISOString();
        if (notes !== undefined) expense.notes = notes.trim();
        if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
        expense.updatedBy = payload.userId;
        expense.updatedAt = new Date().toISOString();

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: expense.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'EDIT_EXPENSE',
          entityType: 'EXPENSE',
          entityId: expenseId,
          description: `Updated expense record "${expense.expenseDescription}" (₹${expense.amount})`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json(expense);
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
        const expense = await Expense.findById(expenseId);
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });

        await Expense.findByIdAndDelete(expenseId);

        await ActivityLog.create({
          festivalId: expense.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_EXPENSE',
          entityType: 'EXPENSE',
          entityId: expenseId,
          description: `Deleted expense of ₹${expense.amount} for "${expense.expenseDescription}"`,
        });

        return res.status(200).json({ message: 'Expense record deleted successfully' });
      } else {
        await store.init();
        const index = store.expenses.findIndex((e) => e._id === expenseId);
        if (index === -1) return res.status(404).json({ message: 'Expense record not found' });

        const expense = store.expenses[index];
        store.expenses.splice(index, 1);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: expense.festivalId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_EXPENSE',
          entityType: 'EXPENSE',
          entityId: expenseId,
          description: `Deleted expense of ₹${expense.amount} for "${expense.expenseDescription}"`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json({ message: 'Expense record deleted successfully' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
