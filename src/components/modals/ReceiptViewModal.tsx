import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ReceiptViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
}) => {
  if (!isOpen || !url) return null;

  const isPdf = url.toLowerCase().includes('.pdf') || url.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{title}</h3>
            <p className="text-xs text-slate-500">Transaction Attachment / Receipt</p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2 rounded-lg text-slate-600 hover:text-ganesh-600 hover:bg-slate-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100">
          {isPdf ? (
            <iframe src={url} className="w-full h-[60vh] rounded-xl border border-slate-300" title={title} />
          ) : (
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md border border-slate-200"
            />
          )}
        </div>
      </div>
    </div>
  );
};
