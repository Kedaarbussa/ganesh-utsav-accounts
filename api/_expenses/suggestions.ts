import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Expense from '../_models/Expense';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { query, festivalId } = req.query;
  const qStr = (Array.isArray(query) ? query[0] : query || '').toLowerCase().trim();

  try {
    const db = await connectToDatabase();
    let descriptions: string[] = [];

    if (db) {
      const matchCondition: any = {};
      if (festivalId) {
        matchCondition.festivalId = festivalId;
      }
      const results = await Expense.distinct('expenseDescription', matchCondition);
      descriptions = results;
    } else {
      await store.init();
      let expenses = store.expenses;
      if (festivalId) {
        expenses = expenses.filter((e) => e.festivalId === festivalId);
      }
      descriptions = Array.from(new Set(expenses.map((e) => e.expenseDescription)));
    }

    const defaultSuggestions = [
      'Ganesh Idol',
      'Pooja Items',
      'Utensils',
      'Flowers & Mala',
      'Coconuts',
      'Water Cans',
      'Homam Items',
      'Decoration',
      'Catering Day 1',
      'Catering Day 2',
      'Electricity Charges',
      'Crane Charges',
      'Sound System',
      'Laddoo',
      'Miscellaneous',
    ];

    const merged = Array.from(new Set([...descriptions, ...defaultSuggestions]));

    const filtered = qStr
      ? merged.filter((item) => item.toLowerCase().includes(qStr))
      : merged;

    return res.status(200).json(filtered.slice(0, 15));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
