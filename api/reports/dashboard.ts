import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Fund from '../_models/Fund';
import Sponsorship from '../_models/Sponsorship';
import Expense from '../_models/Expense';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { festivalId } = req.query;
  if (!festivalId) {
    return res.status(400).json({ message: 'Festival ID is required' });
  }

  try {
    const db = await connectToDatabase();

    let funds: any[] = [];
    let sponsorships: any[] = [];
    let expenses: any[] = [];

    if (db) {
      funds = await Fund.find({ festivalId });
      sponsorships = await Sponsorship.find({ festivalId });
      expenses = await Expense.find({ festivalId });
    } else {
      await store.init();
      funds = store.funds.filter((f) => f.festivalId === festivalId);
      sponsorships = store.sponsorships.filter((s) => s.festivalId === festivalId);
      expenses = store.expenses.filter((e) => e.festivalId === festivalId);
    }

    // Dynamic Calculations
    let regularCash = 0;
    let regularOnline = 0;
    funds.forEach((f) => {
      if (f.paymentMode === 'CASH') regularCash += f.amount;
      else if (f.paymentMode === 'ONLINE') regularOnline += f.amount;
    });

    let sponsorshipCash = 0;
    let sponsorshipOnline = 0;
    sponsorships.forEach((s) => {
      if (s.paymentMode === 'CASH') sponsorshipCash += s.amount;
      else if (s.paymentMode === 'ONLINE') sponsorshipOnline += s.amount;
    });

    let expenseCash = 0;
    let expenseOnline = 0;
    expenses.forEach((e) => {
      if (e.paymentMode === 'CASH') expenseCash += e.amount;
      else if (e.paymentMode === 'ONLINE') expenseOnline += e.amount;
    });

    const totalRegular = regularCash + regularOnline;
    const totalSponsorship = sponsorshipCash + sponsorshipOnline;
    const totalFundsReceived = totalRegular + totalSponsorship;
    const totalExpenses = expenseCash + expenseOnline;

    const currentBalance = totalFundsReceived - totalExpenses;

    const cashReceived = regularCash + sponsorshipCash;
    const onlineReceived = regularOnline + sponsorshipOnline;
    const cashSpent = expenseCash;
    const onlineSpent = expenseOnline;

    const cashBalance = cashReceived - cashSpent;
    const onlineBalance = onlineReceived - onlineSpent;

    // Contributing flats count
    const flatSet = new Set<string>();
    funds.forEach((f) => flatSet.add(f.flatNumber));
    sponsorships.forEach((s) => flatSet.add(s.flatNumber));
    const contributingFlatsCount = flatSet.size;

    // Daily Expenses aggregation
    const dailyExpensesMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      dailyExpensesMap[dateStr] = (dailyExpensesMap[dateStr] || 0) + e.amount;
    });

    const dailyExpensesChart = Object.entries(dailyExpensesMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Combine recent transactions
    const recentFunds = funds.map((f) => ({
      _id: f._id.toString(),
      type: 'REGULAR_CONTRIBUTION',
      title: `Flat ${f.flatNumber} - ${f.residentName}`,
      subtitle: f.description || 'Regular Contribution',
      amount: f.amount,
      paymentMode: f.paymentMode,
      date: f.date,
    }));

    const recentSponsorships = sponsorships.map((s) => ({
      _id: s._id.toString(),
      type: 'SPONSORSHIP',
      title: `Flat ${s.flatNumber} - ${s.residentName}`,
      subtitle: `Sponsored: ${s.sponsoredItem}`,
      amount: s.amount,
      paymentMode: s.paymentMode,
      date: s.date,
    }));

    const recentExpenses = expenses.map((e) => ({
      _id: e._id.toString(),
      type: 'EXPENSE',
      title: e.expenseDescription,
      subtitle: `Spent by ${e.spentBy}`,
      amount: e.amount,
      paymentMode: e.paymentMode,
      date: e.date,
    }));

    const recentTransactions = [...recentFunds, ...recentSponsorships, ...recentExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return res.status(200).json({
      summary: {
        totalRegular,
        totalSponsorship,
        totalFundsReceived,
        totalExpenses,
        currentBalance,
        cashReceived,
        cashSpent,
        cashBalance,
        onlineReceived,
        onlineSpent,
        onlineBalance,
        contributingFlatsCount,
      },
      charts: {
        dailyExpenses: dailyExpensesChart,
        cashVsOnlineReceived: [
          { name: 'Cash', value: cashReceived },
          { name: 'Online', value: onlineReceived },
        ],
        cashVsOnlineExpenses: [
          { name: 'Cash', value: cashSpent },
          { name: 'Online', value: onlineSpent },
        ],
        fundsVsExpenses: [
          { name: 'Funds Received', amount: totalFundsReceived },
          { name: 'Expenses', amount: totalExpenses },
          { name: 'Balance', amount: Math.max(0, currentBalance) },
        ],
        contributionBreakdown: [
          { name: 'Regular Contributions', amount: totalRegular },
          { name: 'Sponsorships', amount: totalSponsorship },
        ],
      },
      recentTransactions,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
