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

  const db = await connectToDatabase();
  const { festivalId } = req.query;

  if (req.method === 'GET') {
    try {
      if (db) {
        const query: any = {};
        if (festivalId) query.festivalId = festivalId;

        const expenses = await Expense.find(query)
          .populate('createdBy', 'fullName username')
          .sort({ date: -1, createdAt: -1 });

        return res.status(200).json(expenses);
      } else {
        await store.init();
        let expenses = store.expenses;
        if (festivalId) {
          expenses = expenses.filter((e) => e.festivalId === festivalId);
        }
        expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json(expenses);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    const {
      festivalId: fId,
      expenseDescription,
      amount,
      spentBy,
      paymentMode,
      date,
      notes,
      receiptUrl,
    } = req.body || {};

    if (!fId || !expenseDescription || !amount || !spentBy || !paymentMode) {
      return res.status(400).json({
        message: 'Festival ID, Expense Description, Amount, Spent By, and Payment Mode are required',
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
        const expense = await Expense.create({
          festivalId: fId,
          expenseDescription: expenseDescription.trim(),
          amount: Number(amount),
          spentBy: spentBy.trim(),
          paymentMode,
          date: date ? new Date(date) : new Date(),
          notes: notes?.trim(),
          receiptUrl,
          createdBy: payload.userId,
        });

        await ActivityLog.create({
          festivalId: fId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'ADD_EXPENSE',
          entityType: 'EXPENSE',
          entityId: expense._id.toString(),
          description: `Added expense ₹${amount} (${paymentMode}) for "${expenseDescription}" spent by ${spentBy}`,
        });

        return res.status(201).json(expense);
      } else {
        await store.init();
        const newExpense = {
          _id: 'exp_' + Date.now(),
          festivalId: fId,
          expenseDescription: expenseDescription.trim(),
          amount: Number(amount),
          spentBy: spentBy.trim(),
          paymentMode,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          notes: notes?.trim(),
          receiptUrl,
          createdBy: payload.userId,
          createdByName: payload.fullName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.expenses.unshift(newExpense);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          festivalId: fId,
          userId: payload.userId,
          userName: payload.fullName,
          action: 'ADD_EXPENSE',
          entityType: 'EXPENSE',
          entityId: newExpense._id,
          description: `Added expense ₹${amount} (${paymentMode}) for "${expenseDescription}" spent by ${spentBy}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(201).json(newExpense);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
