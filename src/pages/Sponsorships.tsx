import React, { useState, useEffect, useCallback } from 'react';
import { Sponsorship } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { SponsorshipModal } from '../components/modals/SponsorshipModal';
import { ReceiptViewModal } from '../components/modals/ReceiptViewModal';
import { Plus, Search, Filter, Edit, Trash2, FileText, Gift, Info } from 'lucide-react';

export const Sponsorships: React.FC = () => {
  const { activeFestival } = useFestival();
  const { user, isAdmin } = useAuth();

  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sponsorshipToEdit, setSponsorshipToEdit] = useState<Sponsorship | null>(null);

  // Proof Modal
  const [viewProofUrl, setViewProofUrl] = useState('');
  const [viewProofTitle, setViewProofTitle] = useState('');

  const fetchSponsorships = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const res = await api.get<Sponsorship[]>(`/sponsorships?festivalId=${activeFestival._id}`);
      setSponsorships(res);
    } catch (err) {
      console.error('Failed to load sponsorships:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    fetchSponsorships();
  }, [fetchSponsorships]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sponsorship record?')) {
      return;
    }
    try {
      await api.delete(`/sponsorships/${id}`);
      fetchSponsorships();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const filteredSponsorships = sponsorships.filter((s) => {
    const matchesSearch =
      s.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sponsoredItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = paymentModeFilter === 'ALL' || s.paymentMode === paymentModeFilter;

    return matchesSearch && matchesMode;
  });

  const totalAmount = filteredSponsorships.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Event & Item Sponsorships</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Sponsorship Contributions</h1>
          <p className="text-xs text-slate-500">Track flat contributions for Lunch, Idol, Laddoo, Decoration, Prasadam</p>
        </div>

        <button
          onClick={() => {
            setSponsorshipToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1.5" /> + Add Sponsorship
        </button>
      </div>

      {/* Financial Logic Explanation Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Financial Accounting Rule:</strong> Sponsorship money is paid directly to the Ganesh Utsav Committee.
          It increases Total Funds Received, Cash/Online Received, and Overall Festival Balance. The committee later spends it via normal Expense transactions.
        </div>
      </div>

      {/* Filter Bar & Summary */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Flat #, Resident, Item (Lunch, Idol), or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
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

        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs font-black shrink-0">
          Sponsorships Total: {formatCurrency(totalAmount)} ({filteredSponsorships.length} Items)
        </div>
      </div>

      {/* Sponsorships Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading sponsorship records...</div>
        ) : filteredSponsorships.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No sponsorship records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Flat #</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4">Sponsored For</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Proof</th>
                  <th className="py-3.5 px-4">Entered By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredSponsorships.map((s) => {
                  const createdById = typeof s.createdBy === 'object' ? s.createdBy._id : s.createdBy;
                  const createdName = typeof s.createdBy === 'object' ? s.createdBy.fullName : s.createdByName || 'Admin';
                  const canEdit = isAdmin || createdById === user?.id;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900">Flat {s.flatNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.residentName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                          {s.sponsoredItem}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-amber-600 text-sm">
                        {formatCurrency(s.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            s.paymentMode === 'CASH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {s.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(s.date)}</td>
                      <td className="py-3 px-4">
                        {s.proofUrl ? (
                          <button
                            onClick={() => {
                              setViewProofUrl(s.proofUrl!);
                              setViewProofTitle(`Sponsorship Proof - ${s.sponsoredItem}`);
                            }}
                            className="p-1 rounded text-amber-600 hover:bg-amber-50 flex items-center font-bold text-[11px]"
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
                                setSponsorshipToEdit(s);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(s._id)}
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
        <SponsorshipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchSponsorships}
          festivalId={activeFestival?._id || ''}
          sponsorshipToEdit={sponsorshipToEdit}
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
