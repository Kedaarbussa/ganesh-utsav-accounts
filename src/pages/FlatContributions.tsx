import React, { useState, useEffect, useCallback } from 'react';
import { Fund, Sponsorship, Flat } from '../types';
import { useFestival } from '../context/FestivalContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { Building, Search, Eye, X, Plus, Edit2, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { FundModal } from '../components/modals/FundModal';
import * as XLSX from 'xlsx';

interface FlatSummary {
  flatNumber: string;
  residentName: string;
  regularTotal: number;
  sponsorshipTotal: number;
  grandTotal: number;
  funds: Fund[];
  sponsorships: Sponsorship[];
}

export const FlatContributions: React.FC = () => {
  const { activeFestival } = useFestival();
  const [loading, setLoading] = useState(true);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [flatSummaries, setFlatSummaries] = useState<FlatSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  // Modals state
  const [selectedFlat, setSelectedFlat] = useState<FlatSummary | null>(null);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [selectedFlatForFund, setSelectedFlatForFund] = useState<{ flatNumber: string; residentName: string } | null>(null);

  // Edit / Add Flat Modal
  const [flatModalOpen, setFlatModalOpen] = useState(false);
  const [editingFlatNumber, setEditingFlatNumber] = useState('');
  const [editingResidentName, setEditingResidentName] = useState('');
  const [isNewFlat, setIsNewFlat] = useState(false);
  const [flatActionLoading, setFlatActionLoading] = useState(false);
  const [flatActionError, setFlatActionError] = useState('');

  // Excel Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const [flatsRes, fundsRes, spnRes] = await Promise.all([
        api.get<Flat[]>('/flats'),
        api.get<Fund[]>(`/funds?festivalId=${activeFestival._id}`),
        api.get<Sponsorship[]>(`/sponsorships?festivalId=${activeFestival._id}`),
      ]);

      const flatList = flatsRes || [];
      setFlats(flatList);

      const flatMap: Record<string, FlatSummary> = {};

      // Initialize all directory flats
      flatList.forEach((f) => {
        const key = f.flatNumber.trim();
        flatMap[key] = {
          flatNumber: key,
          residentName: f.residentName,
          regularTotal: 0,
          sponsorshipTotal: 0,
          grandTotal: 0,
          funds: [],
          sponsorships: [],
        };
      });

      // Add regular funds
      fundsRes.forEach((f) => {
        const key = f.flatNumber.trim();
        if (!flatMap[key]) {
          flatMap[key] = {
            flatNumber: key,
            residentName: f.residentName,
            regularTotal: 0,
            sponsorshipTotal: 0,
            grandTotal: 0,
            funds: [],
            sponsorships: [],
          };
        }
        flatMap[key].regularTotal += f.amount;
        flatMap[key].grandTotal += f.amount;
        flatMap[key].funds.push(f);
        if (f.residentName && (!flatMap[key].residentName || flatMap[key].residentName.startsWith('Flat '))) {
          flatMap[key].residentName = f.residentName;
        }
      });

      // Add sponsorships
      spnRes.forEach((s) => {
        const key = s.flatNumber.trim();
        if (!flatMap[key]) {
          flatMap[key] = {
            flatNumber: key,
            residentName: s.residentName,
            regularTotal: 0,
            sponsorshipTotal: 0,
            grandTotal: 0,
            funds: [],
            sponsorships: [],
          };
        }
        flatMap[key].sponsorshipTotal += s.amount;
        flatMap[key].grandTotal += s.amount;
        flatMap[key].sponsorships.push(s);
        if (s.residentName && (!flatMap[key].residentName || flatMap[key].residentName.startsWith('Flat '))) {
          flatMap[key].residentName = s.residentName;
        }
      });

      const sorted = Object.values(flatMap).sort((a, b) =>
        a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' })
      );

      setFlatSummaries(sorted);
    } catch (err) {
      console.error('Failed to load flat contributions:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Edit Flat Modal
  const handleOpenEditFlat = (flatNumber: string, residentName: string) => {
    setEditingFlatNumber(flatNumber);
    setEditingResidentName(residentName);
    setIsNewFlat(false);
    setFlatActionError('');
    setFlatModalOpen(true);
  };

  // Open Add Flat Modal
  const handleOpenAddFlat = () => {
    setEditingFlatNumber('');
    setEditingResidentName('');
    setIsNewFlat(true);
    setFlatActionError('');
    setFlatModalOpen(true);
  };

  // Save Flat Name / Create Flat
  const handleSaveFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlatNumber.trim() || !editingResidentName.trim()) {
      setFlatActionError('Please enter both Flat Number and Resident Name');
      return;
    }

    setFlatActionLoading(true);
    setFlatActionError('');
    try {
      if (isNewFlat) {
        await api.post('/flats', {
          flatNumber: editingFlatNumber.trim(),
          residentName: editingResidentName.trim(),
        });
      } else {
        await api.put(`/flats/${encodeURIComponent(editingFlatNumber.trim())}`, {
          residentName: editingResidentName.trim(),
        });
      }
      setFlatModalOpen(false);
      loadData();
    } catch (err: any) {
      setFlatActionError(err.message || 'Failed to save flat details');
    } finally {
      setFlatActionLoading(false);
    }
  };

  // Quick Open Fund Modal for specific flat
  const handleQuickAddChanda = (flat: FlatSummary) => {
    setSelectedFlatForFund({
      flatNumber: flat.flatNumber,
      residentName: flat.residentName,
    });
    setFundModalOpen(true);
  };

  // Handle Excel File Upload
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

        // Map column variations
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
        loadData();
      } catch (err: any) {
        setImportResult({ success: false, message: err.message || 'Error processing Excel file.' });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredFlats = flatSummaries.filter((f) => {
    const matchesSearch =
      f.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.residentName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterPaid === 'PAID') return matchesSearch && f.grandTotal > 0;
    if (filterPaid === 'UNPAID') return matchesSearch && f.grandTotal === 0;
    return matchesSearch;
  });

  const totalPaidCount = flatSummaries.filter((f) => f.grandTotal > 0).length;
  const totalUnpaidCount = flatSummaries.filter((f) => f.grandTotal === 0).length;
  const totalGrandSum = flatSummaries.reduce((acc, curr) => acc + curr.grandTotal, 0);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-ganesh-600 font-bold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Apartment Flats Directory & Chanda Roster</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Flat Directory & Contributions</h1>
          <p className="text-xs text-slate-500">All 40 Apartment Flats with resident names, paid status, and quick Chanda entry</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all inline-flex items-center shadow-sm"
          >
            <Upload className="w-4 h-4 mr-1.5 text-emerald-600" /> Import from Excel
          </button>

          <button
            onClick={handleOpenAddFlat}
            className="px-4 py-2.5 bg-ganesh-600 hover:bg-ganesh-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center shadow-md shadow-ganesh-600/30"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Flat
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Flats</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{flatSummaries.length} Flats</div>
          <div className="text-xs text-slate-500 mt-1">Active apartment units</div>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Paid Flats</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{totalPaidCount} Flats</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Total: {formatCurrency(totalGrandSum)}</div>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 shadow-sm">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending / Unpaid</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{totalUnpaidCount} Flats</div>
          <div className="text-xs text-amber-700 font-semibold mt-1">Awaiting contribution</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Flat # (e.g. 101) or Resident Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-ganesh-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterPaid('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterPaid === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({flatSummaries.length})
          </button>
          <button
            onClick={() => setFilterPaid('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterPaid === 'PAID'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Paid ({totalPaidCount})
          </button>
          <button
            onClick={() => setFilterPaid('UNPAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterPaid === 'UNPAID'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Unpaid ({totalUnpaidCount})
          </button>
        </div>
      </div>

      {/* Flat Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading flats and contributions...</div>
        ) : filteredFlats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No flats found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Flat No</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Regular Chanda</th>
                  <th className="py-3.5 px-4 text-right">Sponsorship</th>
                  <th className="py-3.5 px-4 text-right">Total Paid</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredFlats.map((flat) => {
                  const isPaid = flat.grandTotal > 0;
                  return (
                    <tr key={flat.flatNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">
                        Flat {flat.flatNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm">{flat.residentName}</span>
                          <button
                            onClick={() => handleOpenEditFlat(flat.flatNumber, flat.residentName)}
                            title="Edit Resident Name"
                            className="p-1 text-slate-400 hover:text-ganesh-600 hover:bg-ganesh-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 inline-flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                        {flat.regularTotal > 0 ? formatCurrency(flat.regularTotal) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-amber-600">
                        {flat.sponsorshipTotal > 0 ? formatCurrency(flat.sponsorshipTotal) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                        {isPaid ? formatCurrency(flat.grandTotal) : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleQuickAddChanda(flat)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> + Enter Chanda
                          </button>

                          {isPaid && (
                            <button
                              onClick={() => setSelectedFlat(flat)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
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

      {/* Edit / Add Flat Modal */}
      {flatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative border border-slate-200">
            <button
              onClick={() => setFlatModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 mb-1">
              {isNewFlat ? 'Add New Flat' : `Edit Resident - Flat ${editingFlatNumber}`}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {isNewFlat ? 'Enter the flat number and resident name' : 'Update the resident name for this flat'}
            </p>

            {flatActionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {flatActionError}
              </div>
            )}

            <form onSubmit={handleSaveFlat} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Flat Number</label>
                <input
                  type="text"
                  disabled={!isNewFlat}
                  value={editingFlatNumber}
                  onChange={(e) => setEditingFlatNumber(e.target.value)}
                  placeholder="e.g. 601"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-ganesh-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resident Name</label>
                <input
                  type="text"
                  value={editingResidentName}
                  onChange={(e) => setEditingResidentName(e.target.value)}
                  placeholder="e.g. Ravi Sharma"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-ganesh-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFlatModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={flatActionLoading}
                  className="px-5 py-2 bg-ganesh-600 hover:bg-ganesh-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {flatActionLoading ? 'Saving...' : 'Save Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <h2 className="text-xl font-black text-slate-900 mb-2">Import Chanda from Excel</h2>
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

      {/* Chanda Modal (Preloaded with flat if clicked from row) */}
      <FundModal
        isOpen={fundModalOpen}
        onClose={() => {
          setFundModalOpen(false);
          setSelectedFlatForFund(null);
        }}
        onSuccess={() => {
          setFundModalOpen(false);
          setSelectedFlatForFund(null);
          loadData();
        }}
        festivalId={activeFestival?._id || 'fest_2026_001'}
        fundToEdit={
          selectedFlatForFund
            ? ({
                _id: '',
                festivalId: activeFestival?._id || 'fest_2026_001',
                flatNumber: selectedFlatForFund.flatNumber,
                residentName: selectedFlatForFund.residentName,
                amount: '' as any,
                paymentMode: 'CASH',
                date: new Date().toISOString(),
                description: 'Festival Contribution',
                createdBy: '',
              } as any)
            : null
        }
      />

      {/* Flat History Detail Modal */}
      {selectedFlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedFlat(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-ganesh-100 text-ganesh-800 rounded-md">
                Contribution History
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                FLAT {selectedFlat.flatNumber} - {selectedFlat.residentName}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div>
                <div className="text-[10px] font-bold text-slate-500">Regular</div>
                <div className="text-sm font-extrabold text-emerald-600">
                  {formatCurrency(selectedFlat.regularTotal)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500">Sponsorship</div>
                <div className="text-sm font-extrabold text-amber-600">
                  {formatCurrency(selectedFlat.sponsorshipTotal)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500">TOTAL</div>
                <div className="text-sm font-black text-slate-900">
                  {formatCurrency(selectedFlat.grandTotal)}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400">All Transactions for Flat {selectedFlat.flatNumber}</h4>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Mode</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedFlat.funds.map((f) => (
                    <tr key={f._id}>
                      <td className="py-2 px-3">{formatDate(f.date)}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          Regular
                        </span>
                      </td>
                      <td className="py-2 px-3">{f.description || 'Festival Contribution'}</td>
                      <td className="py-2 px-3 font-semibold">{f.paymentMode}</td>
                      <td className="py-2 px-3 text-right font-extrabold text-emerald-600">
                        {formatCurrency(f.amount)}
                      </td>
                    </tr>
                  ))}

                  {selectedFlat.sponsorships.map((s) => (
                    <tr key={s._id}>
                      <td className="py-2 px-3">{formatDate(s.date)}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          Sponsorship
                        </span>
                      </td>
                      <td className="py-2 px-3">Sponsored: {s.sponsoredItem}</td>
                      <td className="py-2 px-3 font-semibold">{s.paymentMode}</td>
                      <td className="py-2 px-3 text-right font-extrabold text-amber-600">
                        {formatCurrency(s.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
