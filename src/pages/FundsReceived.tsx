import React, { useState, useEffect, useCallback } from 'react';
import { Fund } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { FundModal } from '../components/modals/FundModal';
import { ReceiptViewModal } from '../components/modals/ReceiptViewModal';
import { Plus, Search, Filter, Edit, Trash2, FileText, Wallet } from 'lucide-react';

export const FundsReceived: React.FC = () => {
  const { activeFestival } = useFestival();
  const { user, isAdmin } = useAuth();

  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fundToEdit, setFundToEdit] = useState<Fund | null>(null);

  // Attachment Modal
  const [viewProofUrl, setViewProofUrl] = useState('');
  const [viewProofTitle, setViewProofTitle] = useState('');

  const fetchFunds = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const res = await api.get<Fund[]>(`/funds?festivalId=${activeFestival._id}`);
      setFunds(res);
    } catch (err) {
      console.error('Failed to load funds:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fund contribution record?')) {
      return;
    }
    try {
      await api.delete(`/funds/${id}`);
      fetchFunds();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const filteredFunds = funds.filter((f) => {
    const matchesSearch =
      f.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = paymentModeFilter === 'ALL' || f.paymentMode === paymentModeFilter;

    return matchesSearch && matchesMode;
  });

  const totalAmount = filteredFunds.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Contributions Record</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Regular Funds Received</h1>
          <p className="text-xs text-slate-500">Flat-wise Ganesh festival contributions received by committee</p>
        </div>

        <button
          onClick={() => {
            setFundToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1.5" /> + Add Funds Received
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
              placeholder="Search Flat #, Resident Name, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Mode Filter */}
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">💵 CASH Only</option>
            <option value="ONLINE">📱 ONLINE Only</option>
          </select>
        </div>

        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-black shrink-0">
          Filtered Total: {formatCurrency(totalAmount)} ({filteredFunds.length} Records)
        </div>
      </div>

      {/* Funds Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading regular funds...</div>
        ) : filteredFunds.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No contribution records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Flat #</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Proof</th>
                  <th className="py-3.5 px-4">Entered By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredFunds.map((f) => {
                  const createdById = typeof f.createdBy === 'object' ? f.createdBy._id : f.createdBy;
                  const createdName = typeof f.createdBy === 'object' ? f.createdBy.fullName : f.createdByName || 'Admin';
                  const canEdit = isAdmin || createdById === user?.id;

                  return (
                    <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900">Flat {f.flatNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{f.residentName}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 text-sm">
                        {formatCurrency(f.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            f.paymentMode === 'CASH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {f.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(f.date)}</td>
                      <td className="py-3 px-4 text-slate-600">{f.description || 'Contribution'}</td>
                      <td className="py-3 px-4">
                        {f.proofUrl ? (
                          <button
                            onClick={() => {
                              setViewProofUrl(f.proofUrl!);
                              setViewProofTitle(`Proof - Flat ${f.flatNumber}`);
                            }}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 flex items-center font-bold text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" /> View
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
                                setFundToEdit(f);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(f._id)}
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
        <FundModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchFunds}
          festivalId={activeFestival?._id || ''}
          fundToEdit={fundToEdit}
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
