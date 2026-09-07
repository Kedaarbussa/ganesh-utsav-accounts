import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import Fund from '../_models/Fund';
import Sponsorship from '../_models/Sponsorship';
import Expense from '../_models/Expense';
import CommitteeMember from '../_models/CommitteeMember';
import Festival from '../_models/Festival';
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

    let festival: any = null;
    let funds: any[] = [];
    let sponsorships: any[] = [];
    let expenses: any[] = [];
    let committeeMembers: any[] = [];

    if (db) {
      festival = await Festival.findById(festivalId);
      funds = await Fund.find({ festivalId });
      sponsorships = await Sponsorship.find({ festivalId });
      expenses = await Expense.find({ festivalId });
      committeeMembers = await CommitteeMember.find({ festivalId });
    } else {
      await store.init();
      festival = store.festivals.find((f) => f._id === festivalId);
      funds = store.funds.filter((f) => f.festivalId === festivalId);
      sponsorships = store.sponsorships.filter((s) => s.festivalId === festivalId);
      expenses = store.expenses.filter((e) => e.festivalId === festivalId);
      committeeMembers = store.committeeMembers.filter((c) => c.festivalId === festivalId);
    }

    if (!festival) {
      festival = { apartmentName: 'CHANAKYA RESIDENCY', festivalName: 'GANESH UTSAV', year: 2026 };
    }

    // --- AMOUNT RECEIVED (Grouped by Flat) ---
    const flatMap: Record<string, { flatNumber: string; residentName: string; regularAmount: number; sponsorshipAmount: number; totalAmount: number }> = {};

    funds.forEach((f) => {
      const key = f.flatNumber.trim();
      if (!flatMap[key]) {
        flatMap[key] = {
          flatNumber: key,
          residentName: f.residentName,
          regularAmount: 0,
          sponsorshipAmount: 0,
          totalAmount: 0,
        };
      }
      flatMap[key].regularAmount += f.amount;
      flatMap[key].totalAmount += f.amount;
    });

    sponsorships.forEach((s) => {
      const key = s.flatNumber.trim();
      if (!flatMap[key]) {
        flatMap[key] = {
          flatNumber: key,
          residentName: s.residentName,
          regularAmount: 0,
          sponsorshipAmount: 0,
          totalAmount: 0,
        };
      }
      flatMap[key].sponsorshipAmount += s.amount;
      flatMap[key].totalAmount += s.amount;
    });

    const amountReceivedList = Object.values(flatMap).sort((a, b) =>
      a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' })
    );

    // --- PAYMENTS MADE (Grouped by Expense Description) ---
    const expenseGroupMap: Record<string, { particular: string; count: number; totalAmount: number }> = {};

    expenses.forEach((e) => {
      const desc = e.expenseDescription.trim();
      if (!expenseGroupMap[desc]) {
        expenseGroupMap[desc] = { particular: desc, count: 0, totalAmount: 0 };
      }
      expenseGroupMap[desc].count += 1;
      expenseGroupMap[desc].totalAmount += e.amount;
    });

    const paymentsMadeList = Object.values(expenseGroupMap).sort((a, b) => b.totalAmount - a.totalAmount);

    // --- EVENT CONTRIBUTIONS (Sponsorship recognition list) ---
    const eventContributionsList = sponsorships.map((s) => ({
      _id: s._id.toString(),
      flatNumber: s.flatNumber,
      residentName: s.residentName,
      sponsoredItem: s.sponsoredItem,
      amount: s.amount,
      paymentMode: s.paymentMode,
      date: s.date,
    }));

    // --- GRAND TOTALS ---
    const totalRegular = funds.reduce((acc, f) => acc + f.amount, 0);
    const totalSponsorship = sponsorships.reduce((acc, s) => acc + s.amount, 0);
    const totalFundsReceived = totalRegular + totalSponsorship;
    const totalPaymentsMade = expenses.reduce((acc, e) => acc + e.amount, 0);
    const remainingBalance = totalFundsReceived - totalPaymentsMade;

    return res.status(200).json({
      header: {
        apartmentName: festival.apartmentName,
        festivalName: festival.festivalName,
        year: festival.year,
      },
      amountReceived: amountReceivedList,
      paymentsMade: paymentsMadeList,
      eventContributions: eventContributionsList,
      committeeMembers,
      totals: {
        totalRegular,
        totalSponsorship,
        totalFundsReceived,
        totalPaymentsMade,
        remainingBalance,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
