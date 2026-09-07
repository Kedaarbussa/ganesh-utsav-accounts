import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { ReceiptViewModal } from '../components/modals/ReceiptViewModal';
import { Plus, Search, Filter, Edit, Trash2, FileText, Receipt, Sparkles } from 'lucide-react';

export const Expenses: React.FC = () => {
  const { activeFestival } = useFestival();
  const { user, isAdmin } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Receipt Modal
  const [viewReceiptUrl, setViewReceiptUrl] = useState('');
  const [viewReceiptTitle, setViewReceiptTitle] = useState('');

  const fetchExpenses = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const res = await api.get<Expense[]>(`/expenses?festivalId=${activeFestival._id}`);
      setExpenses(res);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense record');
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.expenseDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.spentBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = paymentModeFilter === 'ALL' || e.paymentMode === paymentModeFilter;

    return matchesSearch && matchesMode;
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Festival Outflow</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Expenses Log</h1>
          <p className="text-xs text-slate-500">Record all money spent for idol, pooja, catering, flowers, decoration</p>
        </div>

        <button
          onClick={() => {
            setExpenseToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1.5" /> + Add Expense
        </button>
      </div>

      {/* Filter Bar & Summary */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search What Spent For (Idol, Water, Catering), Person (Spent By), Notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Payment Mode Filter */}
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">💵 CASH Spent</option>
            <option value="ONLINE">📱 ONLINE Spent</option>
          </select>
        </div>

        <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs font-black shrink-0">
          Expenses Total: {formatCurrency(totalAmount)} ({filteredExpenses.length} Entries)
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading expense records...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No expense records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">What Money Was Spent For</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Spent By</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Bill/Receipt</th>
                  <th className="py-3.5 px-4">Entered By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredExpenses.map((e) => {
                  const createdById = typeof e.createdBy === 'object' ? e.createdBy._id : e.createdBy;
                  const createdName = typeof e.createdBy === 'object' ? e.createdBy.fullName : e.createdByName || 'Admin';
                  const canEdit = isAdmin || createdById === user?.id;

                  return (
                    <tr key={e._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-slate-900 text-sm">
                        {e.expenseDescription}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {e.spentBy}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            e.paymentMode === 'CASH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {e.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(e.date)}</td>
                      <td className="py-3 px-4">
                        {e.receiptUrl ? (
                          <button
                            onClick={() => {
                              setViewReceiptUrl(e.receiptUrl!);
                              setViewReceiptTitle(`Receipt - ${e.expenseDescription}`);
                            }}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 flex items-center font-bold text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" /> Bill
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{createdName}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setExpenseToEdit(e);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(e._id)}
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

      {/* Modals */}
      {isModalOpen && (
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchExpenses}
          festivalId={activeFestival?._id || ''}
          expenseToEdit={expenseToEdit}
        />
      )}

      {viewReceiptUrl && (
        <ReceiptViewModal
          isOpen={!!viewReceiptUrl}
          onClose={() => setViewReceiptUrl('')}
          title={viewReceiptTitle}
          url={viewReceiptUrl}
        />
      )}
    </div>
  );
};
