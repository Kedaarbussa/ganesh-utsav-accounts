import React, { useState, useEffect, useCallback } from 'react';
import { Fund } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { FundModal } from '../components/modals/FundModal';
import { ReceiptViewModal } from '../components/modals/ReceiptViewModal';
import { Plus, Search, Filter, Edit, Trash2, FileText, Wallet, Upload, FileSpreadsheet, Check, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  // Excel Import
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

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

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws) as any[];

        if (!rawData || rawData.length === 0) {
          setImportResult({ success: false, message: 'No rows found in the uploaded file.' });
          setImporting(false);
          return;
        }

        const parsedFunds: Partial<Fund>[] = [];
        for (const row of rawData) {
          const flatNum = row['Flat No'] || row['Flat Number'] || row['Flat'] || row['FlatNo'] || row['flatNumber'] || row['flat'] || '';
          const name = row['Name'] || row['Resident Name'] || row['Resident'] || row['residentName'] || '';
          const amount = row['Amount'] || row['Chanda'] || row['Paid'] || row['Contribution'] || row['amount'] || 0;
          const mode = (row['Payment Mode'] || row['Mode'] || row['paymentMode'] || 'CASH').toString().toUpperCase().includes('ONLINE') ? 'ONLINE' : 'CASH';
          const date = row['Date'] || row['date'] || new Date().toISOString().split('T')[0];

          if (flatNum && Number(amount) > 0) {
            parsedFunds.push({
              festivalId: activeFestival?._id || 'fest_2026_001',
              flatNumber: flatNum.toString().trim(),
              residentName: name ? name.toString().trim() : undefined,
              amount: Number(amount),
              paymentMode: mode as any,
              date: date ? new Date(date).toISOString() : new Date().toISOString(),
              description: 'Festival Contribution (Imported from Excel)',
            });
          }
        }

        if (parsedFunds.length === 0) {
          setImportResult({ success: false, message: 'Could not find valid Flat Number and Amount columns in Excel.' });
          setImporting(false);
          return;
        }

        await api.post('/funds/bulk', { funds: parsedFunds });
        setImportResult({ success: true, message: `Successfully imported ${parsedFunds.length} contributions!` });
        fetchFunds();
      } catch (err: any) {
        setImportResult({ success: false, message: err.message || 'Error processing Excel file.' });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-sm shadow-sm transition-transform active:scale-95"
          >
            <Upload className="w-4 h-4 mr-1.5 text-emerald-600" /> Import from Excel
          </button>

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

      {/* Excel Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative border border-emerald-100">
            <button
              onClick={() => setImportModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Bulk Excel Import</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Import Funds from Excel</h2>
            <p className="text-xs text-slate-500 mb-4">
              Upload your Excel sheet (.xlsx, .xls, .csv). The sheet should have columns for <strong>Flat No</strong>, <strong>Name</strong>, and <strong>Amount</strong>.
            </p>

            {importResult && (
              <div
                className={`mb-4 p-3.5 rounded-xl text-xs flex items-center ${
                  importResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {importResult.success ? (
                  <Check className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-500" />
                )}
                <span className="font-semibold">{importResult.message}</span>
              </div>
            )}

            <div className="p-6 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/40 text-center">
              <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <label className="cursor-pointer inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                {importing ? 'Processing File...' : 'Choose Excel File (.xlsx)'}
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelUpload}
                  disabled={importing}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">Accepted formats: .xlsx, .xls, .csv</p>
            </div>
          </div>
        </div>
      )}

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
