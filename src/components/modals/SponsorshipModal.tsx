import React, { useState, useEffect } from 'react';
import { Sponsorship, PaymentMode } from '../../types';
import { api } from '../../services/api';
import { X, Upload, Info, AlertCircle } from 'lucide-react';

interface SponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  festivalId: string;
  sponsorshipToEdit?: Sponsorship | null;
}

export const SponsorshipModal: React.FC<SponsorshipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  festivalId,
  sponsorshipToEdit,
}) => {
  const [flatNumber, setFlatNumber] = useState('');
  const [residentName, setResidentName] = useState('');
  const [sponsoredItem, setSponsoredItem] = useState('Lunch');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('ONLINE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popularSponsorships = [
    'Lunch',
    'Dinner',
    'Ganesh Idol',
    'Laddoo',
    'Decoration',
    'Homam Items',
    'Prasadam',
    'Flowers & Garland',
    'Sound & Lighting',
  ];

  useEffect(() => {
    if (sponsorshipToEdit) {
      setFlatNumber(sponsorshipToEdit.flatNumber);
      setResidentName(sponsorshipToEdit.residentName);
      setSponsoredItem(sponsorshipToEdit.sponsoredItem);
      setAmount(sponsorshipToEdit.amount.toString());
      setPaymentMode(sponsorshipToEdit.paymentMode);
      setDate(new Date(sponsorshipToEdit.date).toISOString().split('T')[0]);
      setDescription(sponsorshipToEdit.description || '');
      setNotes(sponsorshipToEdit.notes || '');
      setPaymentReference(sponsorshipToEdit.paymentReference || '');
      setProofUrl(sponsorshipToEdit.proofUrl || '');
    } else {
      setFlatNumber('');
      setResidentName('');
      setSponsoredItem('Lunch');
      setAmount('');
      setPaymentMode('ONLINE');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setNotes('');
      setPaymentReference('');
      setProofUrl('');
    }
    setError('');
  }, [sponsorshipToEdit, isOpen]);

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
    if (!flatNumber.trim() || !residentName.trim() || !sponsoredItem.trim() || !amount || Number(amount) <= 0) {
      setError('Please fill in Flat Number, Resident Name, What is Sponsored, and Amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const body = {
        festivalId,
        flatNumber: flatNumber.trim(),
        residentName: residentName.trim(),
        sponsoredItem: sponsoredItem.trim(),
        amount: Number(amount),
        paymentMode,
        date,
        description: description.trim(),
        notes: notes.trim(),
        paymentReference: paymentReference.trim(),
        proofUrl,
      };

      if (sponsorshipToEdit) {
        await api.put(`/sponsorships/${sponsorshipToEdit._id}`, body);
      } else {
        await api.post('/sponsorships', body);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save sponsorship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative border border-amber-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 text-left">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded-md">
            {sponsorshipToEdit ? 'Edit Sponsorship' : 'New Sponsorship'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {sponsorshipToEdit ? 'Edit Sponsorship' : 'Add Sponsorship Contribution'}
          </h2>
        </div>

        {/* Explanation Banner */}
        <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start text-left">
          <Info className="w-4 h-4 text-amber-600 mr-2 shrink-0 mt-0.5" />
          <div>
            <strong>Financial Rule:</strong> Sponsorship money is paid directly to the Ganesh Utsav Committee.
            It will increase Total Funds Received & Balance. The committee later spends it via normal Expenses.
          </div>
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
                placeholder="e.g. 503"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resident Name *</label>
              <input
                type="text"
                placeholder="e.g. Anand Jaya Babu"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">What is being Sponsored? *</label>
            <input
              type="text"
              placeholder="e.g. Lunch, Ganesh Idol, Laddoo, Decoration"
              value={sponsoredItem}
              onChange={(e) => setSponsoredItem(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-500"
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {popularSponsorships.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setSponsoredItem(item)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    sponsoredItem === item
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sponsorship Amount (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 8000"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500"
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
                    ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/30'
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
                    ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📱 ONLINE (UPI/Bank)
              </button>
            </div>
          </div>

          {paymentMode === 'ONLINE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Reference / UTR #</label>
              <input
                type="text"
                placeholder="e.g. UPI/44129837192"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description / Occasion</label>
              <input
                type="text"
                placeholder="e.g. Grand Day 1 Mahaprasadam"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt / Proof Screenshot</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="sponsorship-file-upload"
                />
                <label
                  htmlFor="sponsorship-file-upload"
                  className="w-full flex items-center justify-center px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-1.5 text-slate-400" />
                  {uploading ? 'Uploading...' : proofUrl ? 'Proof Attached ✓' : 'Upload File'}
                </label>
              </div>
            </div>
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
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Sponsorship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
