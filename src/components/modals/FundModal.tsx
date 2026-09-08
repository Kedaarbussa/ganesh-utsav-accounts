import React, { useState, useEffect } from 'react';
import { Fund, PaymentMode, Flat } from '../../types';
import { api } from '../../services/api';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  festivalId: string;
  fundToEdit?: Fund | null;
  initialFlatNumber?: string;
  initialResidentName?: string;
}

export const FundModal: React.FC<FundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  festivalId,
  fundToEdit,
  initialFlatNumber,
  initialResidentName,
}) => {
  const [flatNumber, setFlatNumber] = useState('');
  const [residentName, setResidentName] = useState('');
  const [flatsList, setFlatsList] = useState<Flat[]>([]);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Festival Contribution');
  const [notes, setNotes] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(fundToEdit && fundToEdit._id);

  useEffect(() => {
    if (isOpen) {
      api.get<Flat[]>('/flats').then((flats) => {
        setFlatsList(flats || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleFlatChange = (val: string) => {
    setFlatNumber(val);
    const match = flatsList.find((f) => f.flatNumber.trim().toLowerCase() === val.trim().toLowerCase());
    if (match) {
      setResidentName(match.residentName);
    }
  };

  useEffect(() => {
    if (fundToEdit && fundToEdit._id) {
      setFlatNumber(fundToEdit.flatNumber);
      setResidentName(fundToEdit.residentName);
      setAmount(fundToEdit.amount ? fundToEdit.amount.toString() : '');
      setPaymentMode(fundToEdit.paymentMode || 'CASH');
      setDate(fundToEdit.date ? new Date(fundToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setDescription(fundToEdit.description || 'Festival Contribution');
      setNotes(fundToEdit.notes || '');
      setTransactionReference(fundToEdit.transactionReference || '');
      setProofUrl(fundToEdit.proofUrl || '');
    } else {
      setFlatNumber(initialFlatNumber || '');
      setResidentName(initialResidentName || '');
      setAmount('');
      setPaymentMode('CASH');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('Festival Contribution');
      setNotes('');
      setTransactionReference('');
      setProofUrl('');
    }
    setError('');
  }, [fundToEdit, initialFlatNumber, initialResidentName, isOpen]);

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
          setProofUrl(res.url);
        } catch (err: any) {
          setError(err.message || 'File upload failed');
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
    if (!flatNumber.trim() || !residentName.trim() || !amount || Number(amount) <= 0) {
      setError('Please fill in Flat Number, Resident Name, and a valid Amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const body = {
        festivalId,
        flatNumber: flatNumber.trim(),
        residentName: residentName.trim(),
        amount: Number(amount),
        paymentMode,
        date,
        description: description.trim(),
        notes: notes.trim(),
        transactionReference: transactionReference.trim(),
        proofUrl,
      };

      if (isEdit && fundToEdit?._id) {
        await api.put(`/funds/${fundToEdit._id}`, body);
      } else {
        await api.post('/funds', body);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative border border-emerald-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md">
            {isEdit ? 'Edit Transaction' : 'New Contribution'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {isEdit ? 'Edit Funds Received' : 'Add Funds Received'}
          </h2>
          <p className="text-xs text-slate-500">Record festival contribution money received from flat / resident</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Flat Number *</label>
              <input
                type="text"
                list="fund-flats-list"
                placeholder="e.g. 101"
                value={flatNumber}
                onChange={(e) => handleFlatChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <datalist id="fund-flats-list">
                {flatsList.map((f) => (
                  <option key={f.flatNumber} value={f.flatNumber}>
                    {f.flatNumber} - {f.residentName}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resident Name *</label>
              <input
                type="text"
                placeholder="e.g. Anand Jaya Babu"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
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
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
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
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📱 ONLINE (UPI/Bank)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              Note: Split payments must be entered as two separate transactions.
            </p>
          </div>

          {paymentMode === 'ONLINE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Ref / UPI UTR #</label>
              <input
                type="text"
                placeholder="e.g. UPI/491823981273"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Festival Contribution"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Proof / Screenshot</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fund-file-upload"
                />
                <label
                  htmlFor="fund-file-upload"
                  className="w-full flex items-center justify-center px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-1.5 text-slate-400" />
                  {uploading ? 'Uploading...' : proofUrl ? 'Proof Attached ✓' : 'Upload File'}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Any additional remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
