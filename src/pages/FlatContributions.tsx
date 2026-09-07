import React, { useState, useEffect, useCallback } from 'react';
import { Fund, Sponsorship } from '../types';
import { useFestival } from '../context/FestivalContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/exportUtils';
import { Building, Search, Eye, X, Gift, Wallet } from 'lucide-react';

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
  const [flatSummaries, setFlatSummaries] = useState<FlatSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Flat Modal Detail
  const [selectedFlat, setSelectedFlat] = useState<FlatSummary | null>(null);

  const loadData = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const [fundsRes, spnRes] = await Promise.all([
        api.get<Fund[]>(`/funds?festivalId=${activeFestival._id}`),
        api.get<Sponsorship[]>(`/sponsorships?festivalId=${activeFestival._id}`),
      ]);

      const flatMap: Record<string, FlatSummary> = {};

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
      });

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

  const filteredFlats = flatSummaries.filter(
    (f) =>
      f.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.residentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-ganesh-600 font-bold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Apartment Resident Summary</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Flat Contributions</h1>
          <p className="text-xs text-slate-500">Regular contributions + Sponsorships breakdown by flat</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Flat # or Resident Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-ganesh-500"
          />
        </div>

        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs font-black">
          Total Contributing Flats: {flatSummaries.length}
        </div>
      </div>

      {/* Flat Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading flat contributions...</div>
        ) : filteredFlats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No flats found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Flat Number</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4 text-right">Regular Contribution</th>
                  <th className="py-3.5 px-4 text-right">Sponsorship Contribution</th>
                  <th className="py-3.5 px-4 text-right">Total Contribution</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredFlats.map((flat) => (
                  <tr key={flat.flatNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">Flat {flat.flatNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{flat.residentName}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      {formatCurrency(flat.regularTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-amber-600">
                      {formatCurrency(flat.sponsorshipTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(flat.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedFlat(flat)}
                        className="px-3 py-1 rounded-lg bg-ganesh-50 hover:bg-ganesh-100 text-ganesh-700 font-bold text-xs inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
