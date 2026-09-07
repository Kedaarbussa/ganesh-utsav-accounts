import React, { useState, useEffect, useCallback } from 'react';
import { Fund, Sponsorship, Expense } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { FundModal } from '../components/modals/FundModal';
import { SponsorshipModal } from '../components/modals/SponsorshipModal';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { ReceiptViewModal } from '../components/modals/ReceiptViewModal';
import { History, Search, Filter, Edit, Trash2, FileText } from 'lucide-react';

export const Transactions: React.FC = () => {
  const { activeFestival } = useFestival();
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for Editing
  const [fundToEdit, setFundToEdit] = useState<Fund | null>(null);
  const [sponsorshipToEdit, setSponsorshipToEdit] = useState<Sponsorship | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Proof Modal
  const [viewProofUrl, setViewProofUrl] = useState('');
  const [viewProofTitle, setViewProofTitle] = useState('');

  const loadAllTransactions = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const [fundsRes, spnRes, expRes] = await Promise.all([
        api.get<Fund[]>(`/funds?festivalId=${activeFestival._id}`),
        api.get<Sponsorship[]>(`/sponsorships?festivalId=${activeFestival._id}`),
        api.get<Expense[]>(`/expenses?festivalId=${activeFestival._id}`),
      ]);

      const fList = fundsRes.map((f) => ({
        ...f,
        txType: 'REGULAR_CONTRIBUTION',
        txLabel: 'Regular Contribution',
        title: `Flat ${f.flatNumber} - ${f.residentName}`,
        details: f.description || 'Contribution',
        rawItem: f,
      }));

      const sList = spnRes.map((s) => ({
        ...s,
        txType: 'SPONSORSHIP',
        txLabel: 'Sponsorship',
        title: `Flat ${s.flatNumber} - ${s.residentName}`,
        details: `Sponsored: ${s.sponsoredItem}`,
        rawItem: s,
      }));

      const eList = expRes.map((e) => ({
        ...e,
        txType: 'EXPENSE',
        txLabel: 'Expense',
        title: e.expenseDescription,
        details: `Spent by ${e.spentBy}`,
        rawItem: e,
      }));

      const combined = [...fList, ...sList, ...eList].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setAllTransactions(combined);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    loadAllTransactions();
  }, [loadAllTransactions]);

  const handleDelete = async (tx: any) => {
    if (!window.confirm(`Are you sure you want to delete this ${tx.txLabel} record?`)) return;

    try {
      if (tx.txType === 'REGULAR_CONTRIBUTION') {
        await api.delete(`/funds/${tx._id}`);
      } else if (tx.txType === 'SPONSORSHIP') {
        await api.delete(`/sponsorships/${tx._id}`);
      } else if (tx.txType === 'EXPENSE') {
        await api.delete(`/expenses/${tx._id}`);
      }
      loadAllTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  const filtered = allTransactions.filter((tx) => {
    const matchesType = typeFilter === 'ALL' || tx.txType === typeFilter;
    const matchesMode = paymentModeFilter === 'ALL' || tx.paymentMode === paymentModeFilter;

    const str = `${tx.title} ${tx.details} ${tx.amount} ${tx.paymentMode} ${tx.flatNumber || ''}`.toLowerCase();
    const matchesSearch = str.includes(searchTerm.toLowerCase());

    return matchesType && matchesMode && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Master Transaction Audit Log</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Complete Transaction History</h1>
          <p className="text-xs text-slate-500">View and audit all Regular Contributions, Sponsorships, and Expenses</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Flat #, Person, Amount, Description, Spent By..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="REGULAR_CONTRIBUTION">💰 Regular Contributions</option>
            <option value="SPONSORSHIP">🎁 Sponsorships</option>
            <option value="EXPENSE">🧾 Expenses</option>
          </select>

          {/* Payment Mode Filter */}
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
          >
            <option value="ALL">All Modes</option>
            <option value="CASH">💵 CASH</option>
            <option value="ONLINE">📱 ONLINE</option>
          </select>
        </div>

        <div className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 text-xs font-black shrink-0">
          Showing {filtered.length} of {allTransactions.length} Transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading complete history...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No transactions match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Title / Flat</th>
                  <th className="py-3.5 px-4">Particulars / Details</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Proof</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filtered.map((tx) => {
                  const createdById = typeof tx.createdBy === 'object' ? tx.createdBy._id : tx.createdBy;
                  const canEdit = isAdmin || createdById === user?.id;
                  const proof = tx.proofUrl || tx.receiptUrl;

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-semibold">{formatDate(tx.date)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            tx.txType === 'REGULAR_CONTRIBUTION'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.txType === 'SPONSORSHIP'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.txLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tx.title}</td>
                      <td className="py-3 px-4 text-slate-600">{tx.details}</td>
                      <td
                        className={`py-3 px-4 text-right font-black text-sm ${
                          tx.txType === 'EXPENSE' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {tx.txType === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 font-bold">{tx.paymentMode}</td>
                      <td className="py-3 px-4">
                        {proof ? (
                          <button
                            onClick={() => {
                              setViewProofUrl(proof);
                              setViewProofTitle(`Attachment - ${tx.title}`);
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded font-bold text-[11px] flex items-center"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" /> View
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {canEdit && (
                            <button
                              onClick={() => {
                                if (tx.txType === 'REGULAR_CONTRIBUTION') setFundToEdit(tx.rawItem);
                                else if (tx.txType === 'SPONSORSHIP') setSponsorshipToEdit(tx.rawItem);
                                else if (tx.txType === 'EXPENSE') setExpenseToEdit(tx.rawItem);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {fundToEdit && (
        <FundModal
          isOpen={!!fundToEdit}
          onClose={() => setFundToEdit(null)}
          onSuccess={loadAllTransactions}
          festivalId={activeFestival?._id || ''}
          fundToEdit={fundToEdit}
        />
      )}

      {sponsorshipToEdit && (
        <SponsorshipModal
          isOpen={!!sponsorshipToEdit}
          onClose={() => setSponsorshipToEdit(null)}
          onSuccess={loadAllTransactions}
          festivalId={activeFestival?._id || ''}
          sponsorshipToEdit={sponsorshipToEdit}
        />
      )}

      {expenseToEdit && (
        <ExpenseModal
          isOpen={!!expenseToEdit}
          onClose={() => setExpenseToEdit(null)}
          onSuccess={loadAllTransactions}
          festivalId={activeFestival?._id || ''}
          expenseToEdit={expenseToEdit}
        />
      )}

      {viewProofUrl && (
        <ReceiptViewModal
          isOpen={!!viewProofUrl}
          onClose={() => setViewProofUrl('')}
          title={viewProofTitle}
          url={viewProofUrl}
        />
      )}
    </div>
  );
};
