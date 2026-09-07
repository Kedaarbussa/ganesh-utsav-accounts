import React, { useState, useEffect } from 'react';
import { useFestival } from '../context/FestivalContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import {
  Wallet,
  Gift,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Plus,
  TrendingUp,
  CreditCard,
  Banknote,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardProps {
  onOpenQuickAdd: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickAdd, onNavigateTab }) => {
  const { activeFestival } = useFestival();
  const [data, setData] = useState<{
    summary: DashboardSummary;
    charts: any;
    recentTransactions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!activeFestival) return;
      setLoading(true);
      try {
        const res = await api.get<any>(`/reports/dashboard?festivalId=${activeFestival._id}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [activeFestival]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ganesh-600"></div>
      </div>
    );
  }

  const { summary, charts, recentTransactions } = data;

  const COLORS = ['#E65100', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-ganesh-900 via-ganesh-800 to-amber-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 rounded-full">
              {activeFestival?.year} Active Festival
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            {activeFestival?.apartmentName} - {activeFestival?.festivalName}
          </h1>
          <p className="text-xs text-amber-200/80 mt-0.5">
            Complete financial summary and live festival accounts tracking
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="relative z-10 inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm shadow-lg shadow-amber-400/30 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1.5 stroke-[3]" /> + Quick Add Entry
        </button>
      </div>

      {/* 5 MAJOR FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Regular */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Regular</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(summary.totalRegular)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Flat festival contributions</div>
          </div>
        </div>

        {/* Card 2: Total Sponsorship */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sponsorship</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(summary.totalSponsorship)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Lunch, Idol, Prasadam, etc.</div>
          </div>
        </div>

        {/* Card 3: Total Funds Received */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Received</span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-950">{formatCurrency(summary.totalFundsReceived)}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Regular + Sponsorships</div>
          </div>
        </div>

        {/* Card 4: Total Expenses */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-5 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-sm">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-950">{formatCurrency(summary.totalExpenses)}</div>
            <div className="text-[11px] text-rose-700 mt-0.5">Money spent for festival</div>
          </div>
        </div>

        {/* Card 5: Current Balance */}
        <div className="bg-gradient-to-br from-ganesh-600 to-amber-600 text-white p-5 rounded-2xl shadow-lg shadow-ganesh-600/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">Current Balance</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{formatCurrency(summary.currentBalance)}</div>
            <div className="text-[11px] text-amber-100 mt-0.5">Received - Expenses</div>
          </div>
        </div>
      </div>

      {/* CASH & ONLINE BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CASH SUMMARY BOX */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">CASH SUMMARY</h3>
                <p className="text-xs text-slate-500">Physical cash transaction breakdown</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
              Mode: CASH
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-500">Cash Received</div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-600 mt-1">
                {formatCurrency(summary.cashReceived)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-500">Cash Spent</div>
              <div className="text-sm sm:text-base font-extrabold text-rose-600 mt-1">
                {formatCurrency(summary.cashSpent)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-800">Cash Balance</div>
              <div className="text-sm sm:text-base font-black text-emerald-950 mt-1">
                {formatCurrency(summary.cashBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* ONLINE SUMMARY BOX */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">ONLINE SUMMARY</h3>
                <p className="text-xs text-slate-500">UPI / Bank transfer breakdown</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Mode: ONLINE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-500">Online Received</div>
              <div className="text-sm sm:text-base font-extrabold text-indigo-600 mt-1">
                {formatCurrency(summary.onlineReceived)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-500">Online Spent</div>
              <div className="text-sm sm:text-base font-extrabold text-rose-600 mt-1">
                {formatCurrency(summary.onlineSpent)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
              <div className="text-[11px] font-bold text-indigo-800">Online Balance</div>
              <div className="text-sm sm:text-base font-black text-indigo-950 mt-1">
                {formatCurrency(summary.onlineBalance)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Funds vs Expenses */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-ganesh-600 mr-2" /> Overall Financial Overview
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.fundsVsExpenses}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#E65100" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cash vs Online Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mb-4 flex items-center">
            <CreditCard className="w-4 h-4 text-amber-600 mr-2" /> Funds Received Mode (Cash vs Online)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.cashVsOnlineReceived}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ₹${entry.value}`}
                >
                  {charts.cashVsOnlineReceived.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS & CONTRIBUTING FLATS COUNTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contributing Flats Banner */}
        <div className="bg-gradient-to-br from-amber-500 to-ganesh-600 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-100">
              <Building className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Participation</span>
            </div>
            <h3 className="text-3xl font-black mt-4">{summary.contributingFlatsCount} Flats</h3>
            <p className="text-xs text-amber-100 mt-1">
              Flats actively contributed to Ganesh Utsav celebrations
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('flat-contributions')}
            className="mt-6 w-full py-2.5 rounded-xl bg-white text-ganesh-900 font-extrabold text-xs shadow hover:bg-amber-50 transition-colors"
          >
            View Flat-wise Contributions →
          </button>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">Recent Transactions</h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-ganesh-600 hover:text-ganesh-700"
            >
              View All →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.type === 'REGULAR_CONTRIBUTION'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tx.type === 'SPONSORSHIP'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tx.type === 'REGULAR_CONTRIBUTION' ? '💰' : tx.type === 'SPONSORSHIP' ? '🎁' : '🧾'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{tx.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {tx.subtitle} • <span className="font-semibold">{tx.paymentMode}</span> • {formatDate(tx.date)}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-extrabold ${
                    tx.type === 'EXPENSE' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
