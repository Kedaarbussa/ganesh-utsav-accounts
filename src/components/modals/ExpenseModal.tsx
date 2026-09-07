import React, { useState, useEffect, useRef } from 'react';
import { Expense, PaymentMode } from '../../types';
import { api } from '../../services/api';
import { X, Upload, AlertCircle, Sparkles } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  festivalId: string;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  festivalId,
  expenseToEdit,
}) => {
  const [expenseDescription, setExpenseDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [spentBy, setSpentBy] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setExpenseDescription(expenseToEdit.expenseDescription);
      setAmount(expenseToEdit.amount.toString());
      setSpentBy(expenseToEdit.spentBy);
      setPaymentMode(expenseToEdit.paymentMode);
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setNotes(expenseToEdit.notes || '');
      setReceiptUrl(expenseToEdit.receiptUrl || '');
    } else {
      setExpenseDescription('');
      setAmount('');
      setSpentBy('');
      setPaymentMode('CASH');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setReceiptUrl('');
    }
    setError('');
  }, [expenseToEdit, isOpen]);

  // Fetch suggestions when user types in expenseDescription
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<string[]>(
          `/expenses/suggestions?festivalId=${festivalId}&query=${encodeURIComponent(expenseDescription)}`
        );
        setSuggestions(res);
      } catch (err) {
        console.warn('Failed to load suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [expenseDescription, festivalId, isOpen]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await api.post<{ url: string }>('/upload', {
            fileData: reader.result,
            fileName: file.name,
          });
          setReceiptUrl(res.url);
        } catch (err: any) {
          setError(err.message || 'Bill upload failed');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Failed to process image');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription.trim() || !amount || Number(amount) <= 0 || !spentBy.trim()) {
      setError('Please fill in What Money Was Spent For, Amount, and Who Spent The Money');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const body = {
        festivalId,
        expenseDescription: expenseDescription.trim(),
        amount: Number(amount),
        spentBy: spentBy.trim(),
        paymentMode,
        date,
        notes: notes.trim(),
        receiptUrl,
      };

      if (expenseToEdit) {
        await api.put(`/expenses/${expenseToEdit._id}`, body);
      } else {
        await api.post('/expenses', body);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative border border-rose-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 text-left">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 rounded-md">
            {expenseToEdit ? 'Edit Expense' : 'New Expense Entry'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {expenseToEdit ? 'Edit Expense Record' : 'Add Expense'}
          </h2>
          <p className="text-xs text-slate-500">Record money spent for Ganesh Utsav festival activities</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* FREE-TEXT EXPENSE DESCRIPTION WITH SMART SUGGESTIONS */}
          <div className="relative" ref={suggestionRef}>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>What Was The Money Spent For? *</span>
              <span className="text-[10px] text-amber-600 font-semibold flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Free-text + Smart Suggestions
              </span>
            </label>

            <input
              type="text"
              placeholder="e.g. Catering Day 1, Water Cans, Flowers & Mala, Ganesh Idol"
              value={expenseDescription}
              onChange={(e) => {
                setExpenseDescription(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500"
            />

            {/* Smart Suggestions Popup */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  Matching Previous Entries
                </div>
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setExpenseDescription(item);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-900 transition-colors flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <span className="text-[10px] text-slate-400">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount Spent (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Who Spent The Money? *</label>
              <input
                type="text"
                placeholder="e.g. Ravinder, Anand"
                value={spentBy}
                onChange={(e) => setSpentBy(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bill / Receipt Upload</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="expense-file-upload"
                />
                <label
                  htmlFor="expense-file-upload"
                  className="w-full flex items-center justify-center px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-1.5 text-slate-400" />
                  {uploading ? 'Uploading...' : receiptUrl ? 'Receipt Attached ✓' : 'Upload Bill'}
                </label>
              </div>
            </div>
          </div>

          {/* Payment Mode Selector - Strictly CASH or ONLINE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode (Select One) *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center transition-all ${
                  paymentMode === 'CASH'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                💵 CASH
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('ONLINE')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center transition-all ${
                  paymentMode === 'ONLINE'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📱 ONLINE (UPI/Card)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Vendor details, bill number, notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
