import React from 'react';
import { Wallet, Gift, Receipt, X } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: 'fund' | 'sponsorship' | 'expense') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative border border-amber-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-ganesh-600 flex items-center justify-center mx-auto mb-2 text-2xl">
            🪔
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Quick Data Entry</h3>
          <p className="text-xs text-slate-500">Select transaction type to enter into Ganesh Utsav accounts</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              onSelectOption('fund');
              onClose();
            }}
            className="w-full flex items-center space-x-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 font-bold transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-emerald-900">+ Add Funds Received</div>
              <div className="text-xs text-emerald-700 font-normal">Regular festival contribution from flat / resident</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectOption('sponsorship');
              onClose();
            }}
            className="w-full flex items-center space-x-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-950 font-bold transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-amber-900">+ Add Sponsorship</div>
              <div className="text-xs text-amber-700 font-normal">Contribution for Lunch, Idol, Laddoo, Decoration, etc.</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectOption('expense');
              onClose();
            }}
            className="w-full flex items-center space-x-4 p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-950 font-bold transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-rose-900">+ Add Expense</div>
              <div className="text-xs text-rose-700 font-normal">Money spent for festival items, catering, pooja, etc.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
