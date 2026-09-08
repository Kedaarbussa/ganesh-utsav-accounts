import React, { useState, useEffect, useCallback } from 'react';
import { FinalReportData } from '../types';
import { useFestival } from '../context/FestivalContext';
import { api } from '../services/api';
import { formatCurrency, exportFinalReportPDF, exportToExcel, exportToCSV } from '../utils/exportUtils';
import { FileCheck, Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';

export const FinalReport: React.FC = () => {
  const { activeFestival } = useFestival();
  const [data, setData] = useState<FinalReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinalReport = useCallback(async () => {
    if (!activeFestival) return;
    setLoading(true);
    try {
      const res = await api.get<FinalReportData>(`/reports/final?festivalId=${activeFestival._id}`);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch final report:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFestival]);

  useEffect(() => {
    fetchFinalReport();
  }, [fetchFinalReport]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ganesh-600"></div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportFinalReportPDF(data);
  };

  const handleDownloadExcel = () => {
    exportToExcel(`${data.header.apartmentName}_Ganesh_Utsav_${data.header.year}_Final_Report`, [
      {
        name: 'Amount Received',
        data: data.amountReceived.map((a) => ({
          'Flat No': a.flatNumber,
          'Resident Name': a.residentName,
          'Regular Contribution': a.regularAmount,
          'Sponsorship Contribution': a.sponsorshipAmount,
          'Total Amount Received': a.totalAmount,
        })),
      },
      {
        name: 'Payments Made',
        data: data.paymentsMade.map((p) => ({
          Particulars: p.particular,
          Amount: p.totalAmount,
        })),
      },
      {
        name: 'Event Contributions',
        data: data.eventContributions.map((e) => ({
          'Flat No': e.flatNumber,
          'Resident Name': e.residentName,
          'Sponsored Item': e.sponsoredItem,
          Amount: e.recognitionAmount || e.amount,
          Mode: e.paymentMode,
        })),
      },
      {
        name: 'Totals',
        data: [
          { Metric: 'Total Regular Contributions', Amount: data.totals.totalRegular },
          { Metric: 'Total Sponsorship Contributions', Amount: data.totals.totalSponsorship },
          { Metric: 'Total Funds Received', Amount: data.totals.totalFundsReceived },
          { Metric: 'Total Payments Made', Amount: data.totals.totalPaymentsMade },
          { Metric: 'Remaining Balance', Amount: data.totals.remainingBalance },
        ],
      },
    ]);
  };

  const handleDownloadCSV = () => {
    const csvRows = [
      ...data.amountReceived.map((a) => ({
        Category: 'AMOUNT_RECEIVED',
        Flat: a.flatNumber,
        Name: a.residentName,
        Amount: a.totalAmount,
      })),
      ...data.paymentsMade.map((p) => ({
        Category: 'PAYMENTS_MADE',
        Flat: '-',
        Name: p.particular,
        Amount: p.totalAmount,
      })),
    ];
    exportToCSV(`${data.header.apartmentName}_Ganesh_Utsav_${data.header.year}_Final_Statement`, csvRows);
  };

  // Prepare side-by-side combined rows for traditional 2-column financial statement table
  const maxRows = Math.max(data.amountReceived.length, data.paymentsMade.length);
  const sideBySideRows: Array<{ recv: any; pay: any }> = [];

  for (let i = 0; i < maxRows; i++) {
    sideBySideRows.push({
      recv: data.amountReceived[i] || null,
      pay: data.paymentsMade[i] || null,
    });
  }

  return (
    <div className="space-y-8 pb-16 text-left">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-ganesh-600 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Official Financial Statement</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Final Ganesh Utsav Report</h1>
          <p className="text-xs text-slate-500">Traditional 2-column financial statement ready for printing & sharing</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Report
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ganesh-600 to-amber-600 hover:from-ganesh-700 hover:to-amber-700 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download PDF (A4)
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5" /> Excel
          </button>
        </div>
      </div>

      {/* PRINTABLE FINANCIAL STATEMENT CARD */}
      <div
        id="printable-final-report"
        className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* REPORT HEADER */}
        <div className="text-center space-y-1 border-b-2 border-ganesh-600 pb-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ganesh-700 uppercase">
            {data.header.apartmentName}
          </h2>
          <h3 className="text-lg sm:text-xl font-extrabold text-amber-800 tracking-wide uppercase">
            {data.header.festivalName} {data.header.year}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            STATEMENT OF ACCOUNTS
          </p>
        </div>

        {/* 2-COLUMN FINANCIAL STATEMENT TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              {/* Header row 1: Column Group Titles */}
              <tr className="text-white text-xs font-black uppercase tracking-wider">
                <th colSpan={3} className="bg-ganesh-600 py-3 px-4 text-center border-r border-slate-300">
                  AMOUNT RECEIVED
                </th>
                <th colSpan={2} className="bg-rose-700 py-3 px-4 text-center">
                  PAYMENTS MADE
                </th>
              </tr>
              {/* Header row 2: Specific Columns */}
              <tr className="bg-amber-50 text-[11px] font-black uppercase text-slate-700 border-b border-slate-300">
                <th className="py-2.5 px-3 border-r border-slate-300 w-16">Flat</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Name of Resident</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-right w-28">Amount</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Particulars</th>
                <th className="py-2.5 px-3 text-right w-28">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-800">
              {sideBySideRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {/* Amount Received Side */}
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                    {row.recv ? row.recv.flatNumber : ''}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    {row.recv ? row.recv.residentName : ''}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-extrabold text-emerald-700">
                    {row.recv ? formatCurrency(row.recv.totalAmount) : ''}
                  </td>

                  {/* Payments Made Side */}
                  <td className="py-2 px-3 border-r border-slate-200 font-bold">
                    {row.pay ? row.pay.particular : ''}
                  </td>
                  <td className="py-2 px-3 text-right font-extrabold text-rose-700">
                    {row.pay ? formatCurrency(row.pay.totalAmount) : ''}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Foot Totals */}
            <tfoot>
              <tr className="bg-slate-100 font-black text-xs text-slate-900 border-t-2 border-slate-400">
                <td colSpan={2} className="py-3 px-4 border-r border-slate-300 uppercase">
                  TOTAL AMOUNT RECEIVED
                </td>
                <td className="py-3 px-3 border-r border-slate-300 text-right text-emerald-800 text-sm">
                  {formatCurrency(data.totals.totalFundsReceived)}
                </td>
                <td className="py-3 px-4 border-r border-slate-300 uppercase">
                  TOTAL PAYMENTS MADE
                </td>
                <td className="py-3 px-3 text-right text-rose-800 text-sm">
                  {formatCurrency(data.totals.totalPaymentsMade)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* SECTION 2: EVENT CONTRIBUTIONS (SPONSORSHIPS RECOGNITION) */}
        {data.eventContributions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-ganesh-700 text-sm tracking-wide uppercase">
                EVENT CONTRIBUTIONS (SPONSORSHIP RECOGNITION)
              </h4>
              <span className="text-[10px] text-slate-400 italic">
                * Note: Sponsorship amounts are already included in Total Amount Received above.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-amber-200 text-xs">
                <thead>
                  <tr className="bg-amber-100/70 text-amber-950 font-black uppercase text-[10px]">
                    <th className="py-2 px-3 border-r border-amber-200">Flat No</th>
                    <th className="py-2 px-3 border-r border-amber-200">Name of Resident</th>
                    <th className="py-2 px-3 border-r border-amber-200">Contribution / Sponsored For</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 font-semibold text-slate-800">
                  {data.eventContributions.map((ev) => (
                    <tr key={ev._id}>
                      <td className="py-2 px-3 border-r border-amber-100 font-bold">Flat {ev.flatNumber}</td>
                      <td className="py-2 px-3 border-r border-amber-100">{ev.residentName}</td>
                      <td className="py-2 px-3 border-r border-amber-100 font-extrabold text-amber-900">
                        {ev.sponsoredItem}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-amber-800">
                        {formatCurrency(ev.recognitionAmount || ev.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: GRAND TOTALS & REMAINING BALANCE SUMMARY BOX */}
        <div className="p-6 bg-gradient-to-tr from-ganesh-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-ganesh-300 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
            <div>
              <div className="font-bold text-slate-500">Regular Contributions</div>
              <div className="font-black text-sm text-slate-900 mt-0.5">
                {formatCurrency(data.totals.totalRegular)}
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-500">Sponsorship Contributions</div>
              <div className="font-black text-sm text-slate-900 mt-0.5">
                {formatCurrency(data.totals.totalSponsorship)}
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-500">Total Funds Received</div>
              <div className="font-black text-sm text-emerald-700 mt-0.5">
                {formatCurrency(data.totals.totalFundsReceived)}
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-500">Total Payments Made</div>
              <div className="font-black text-sm text-rose-700 mt-0.5">
                {formatCurrency(data.totals.totalPaymentsMade)}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between text-slate-900">
            <span className="font-extrabold text-base uppercase text-ganesh-800">
              REMAINING FESTIVAL BALANCE:
            </span>
            <span className="text-2xl font-black text-ganesh-700">
              {formatCurrency(data.totals.remainingBalance)}
            </span>
          </div>
        </div>

        {/* SECTION 4: COMMITTEE MEMBERS FOOTER */}
        {data.committeeMembers.length > 0 && (
          <div className="pt-8 border-t border-slate-200 text-center space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              COMMITTEE MEMBERS
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-extrabold text-slate-800">
              {data.committeeMembers.map((m) => (
                <div key={m._id} className="text-center">
                  <div className="border-t border-slate-300 pt-2 min-w-[140px]">
                    <div>{m.name.toUpperCase()}</div>
                    {m.position && (
                      <div className="text-[11px] font-semibold text-slate-500">{m.position}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
