import React, { useState, useEffect, useCallback } from 'react';
import { Fund, Sponsorship, Expense } from '../types';
import { useFestival } from '../context/FestivalContext';
import { api } from '../services/api';
import { formatCurrency, exportToExcel, exportToCSV } from '../utils/exportUtils';
import { FileSpreadsheet, Download, Filter, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const { activeFestival } = useFestival();
  const [loading, setLoading] = useState(true);

  const [funds, setFunds] = useState<Fund[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Date Range Filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReportData = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const [fRes, sRes, eRes] = await Promise.all([
        api.get<Fund[]>(`/funds?festivalId=${activeFestival._id}`),
        api.get<Sponsorship[]>(`/sponsorships?festivalId=${activeFestival._id}`),
        api.get<Expense[]>(`/expenses?festivalId=${activeFestival._id}`),
      ]);
      setFunds(fRes);
      setSponsorships(sRes);
      setExpenses(eRes);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Date Filtering helper
  const isWithinRange = (dateStr: string) => {
    if (!startDate && !endDate) return true;
    const d = new Date(dateStr).getTime();
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;
    return d >= start && d <= end;
  };

  const filteredFunds = funds.filter((f) => isWithinRange(f.date));
  const filteredSponsorships = sponsorships.filter((s) => isWithinRange(s.date));
  const filteredExpenses = expenses.filter((e) => isWithinRange(e.date));

  // Totals Calculations
  const regCash = filteredFunds.filter((f) => f.paymentMode === 'CASH').reduce((a, b) => a + b.amount, 0);
  const regOnline = filteredFunds.filter((f) => f.paymentMode === 'ONLINE').reduce((a, b) => a + b.amount, 0);
  const spnCash = filteredSponsorships.filter((s) => s.paymentMode === 'CASH').reduce((a, b) => a + b.amount, 0);
  const spnOnline = filteredSponsorships.filter((s) => s.paymentMode === 'ONLINE').reduce((a, b) => a + b.amount, 0);
  const expCash = filteredExpenses.filter((e) => e.paymentMode === 'CASH').reduce((a, b) => a + b.amount, 0);
  const expOnline = filteredExpenses.filter((e) => e.paymentMode === 'ONLINE').reduce((a, b) => a + b.amount, 0);

  const totalRegular = regCash + regOnline;
  const totalSponsorship = spnCash + spnOnline;
  const totalFundsReceived = totalRegular + totalSponsorship;
  const totalExpenses = expCash + expOnline;
  const currentBalance = totalFundsReceived - totalExpenses;

  const cashReceived = regCash + spnCash;
  const onlineReceived = regOnline + spnOnline;
  const cashSpent = expCash;
  const onlineSpent = expOnline;
  const cashBalance = cashReceived - cashSpent;
  const onlineBalance = onlineReceived - onlineSpent;

  // Expense-wise Grouping
  const expenseGroupMap: Record<string, { description: string; count: number; totalAmount: number }> = {};
  filteredExpenses.forEach((e) => {
    const desc = e.expenseDescription.trim();
    if (!expenseGroupMap[desc]) {
      expenseGroupMap[desc] = { description: desc, count: 0, totalAmount: 0 };
    }
    expenseGroupMap[desc].count += 1;
    expenseGroupMap[desc].totalAmount += e.amount;
  });
  const expenseWiseList = Object.values(expenseGroupMap).sort((a, b) => b.totalAmount - a.totalAmount);

  // Person-wise Expense Grouping
  const personExpenseMap: Record<string, { name: string; count: number; totalAmount: number }> = {};
  filteredExpenses.forEach((e) => {
    const name = e.spentBy.trim();
    if (!personExpenseMap[name]) {
      personExpenseMap[name] = { name, count: 0, totalAmount: 0 };
    }
    personExpenseMap[name].count += 1;
    personExpenseMap[name].totalAmount += e.amount;
  });
  const personWiseList = Object.values(personExpenseMap).sort((a, b) => b.totalAmount - a.totalAmount);

  // Export handlers
  const handleExportExcel = () => {
    exportToExcel(`${activeFestival?.apartmentName}_Ganesh_Utsav_${activeFestival?.year}_Financial_Report`, [
      {
        name: 'Summary',
        data: [
          { Metric: 'Total Regular Contributions', Amount: totalRegular },
          { Metric: 'Total Sponsorship Contributions', Amount: totalSponsorship },
          { Metric: 'Total Funds Received', Amount: totalFundsReceived },
          { Metric: 'Total Expenses', Amount: totalExpenses },
          { Metric: 'Current Balance', Amount: currentBalance },
          { Metric: 'Cash Received', Amount: cashReceived },
          { Metric: 'Cash Spent', Amount: cashSpent },
          { Metric: 'Cash Balance', Amount: cashBalance },
          { Metric: 'Online Received', Amount: onlineReceived },
          { Metric: 'Online Spent', Amount: onlineSpent },
          { Metric: 'Online Balance', Amount: onlineBalance },
        ],
      },
      {
        name: 'Expense-Wise',
        data: expenseWiseList.map((e) => ({
          'Expense Description': e.description,
          'Number of Transactions': e.count,
          'Total Amount Spent': e.totalAmount,
        })),
      },
      {
        name: 'Person-Wise Expenses',
        data: personWiseList.map((p) => ({
          'Person Name': p.name,
          'Number of Expenses': p.count,
          'Total Amount': p.totalAmount,
        })),
      },
    ]);
  };

  const handleExportCSV = () => {
    const csvData = [
      { Category: 'SUMMARY', Item: 'Total Funds Received', Amount: totalFundsReceived },
      { Category: 'SUMMARY', Item: 'Total Expenses', Amount: totalExpenses },
      { Category: 'SUMMARY', Item: 'Current Balance', Amount: currentBalance },
      ...expenseWiseList.map((e) => ({
        Category: 'EXPENSE_GROUP',
        Item: e.description,
        Amount: e.totalAmount,
      })),
    ];
    exportToCSV(`${activeFestival?.apartmentName}_Ganesh_Utsav_${activeFestival?.year}_Report`, csvData);
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-ganesh-600 font-bold text-xs uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Comprehensive Financial Analysis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Financial Reports</h1>
          <p className="text-xs text-slate-500">Summary reports, expense breakdowns, and exportable financial sheets</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download Excel
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Picker Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-ganesh-600" />
          <span>Filter Date Range:</span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* SECTION 1: OVERALL FINANCIAL SUMMARY */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100">
          1. Overall Financial Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500">Regular Contributions</div>
            <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(totalRegular)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500">Sponsorship Contributions</div>
            <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(totalSponsorship)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-800">Total Funds Received</div>
            <div className="text-lg font-black text-emerald-950 mt-1">{formatCurrency(totalFundsReceived)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="text-xs font-bold text-rose-800">Total Expenses</div>
            <div className="text-lg font-black text-rose-950 mt-1">{formatCurrency(totalExpenses)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-tr from-ganesh-600 to-amber-600 text-white shadow-md">
            <div className="text-xs font-bold text-amber-100">Current Balance</div>
            <div className="text-lg font-black mt-1">{formatCurrency(currentBalance)}</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PAYMENT MODE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
            💵 CASH Payment Mode Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Cash Received:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(cashReceived)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Cash Spent:</span>
              <span className="font-bold text-rose-600">{formatCurrency(cashSpent)}</span>
            </div>
            <div className="flex justify-between py-1 font-extrabold text-slate-900 pt-1">
              <span>Cash Balance:</span>
              <span className="text-emerald-700">{formatCurrency(cashBalance)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
            📱 ONLINE Payment Mode Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Online Received:</span>
              <span className="font-bold text-indigo-600">{formatCurrency(onlineReceived)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Online Spent:</span>
              <span className="font-bold text-rose-600">{formatCurrency(onlineSpent)}</span>
            </div>
            <div className="flex justify-between py-1 font-extrabold text-slate-900 pt-1">
              <span>Online Balance:</span>
              <span className="text-indigo-700">{formatCurrency(onlineBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: EXPENSE-WISE & PERSON-WISE TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Description Grouping */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Expense-Wise Grouped Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500">
                  <th className="py-2.5 px-3">Expense Description</th>
                  <th className="py-2.5 px-3 text-center">Tx Count</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseWiseList.map((e, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{e.description}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">{e.count}</td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-600">
                      {formatCurrency(e.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Person-Wise Expense Report */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Person-Wise Expense Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500">
                  <th className="py-2.5 px-3">Person Name (Spent By)</th>
                  <th className="py-2.5 px-3 text-center">Expenses Count</th>
                  <th className="py-2.5 px-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personWiseList.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{p.name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">{p.count}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatCurrency(p.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
