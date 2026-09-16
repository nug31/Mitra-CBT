import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, title = 'Pratinjau Gambar Teknik' }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 shrink-0" />
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 active:scale-95"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-6 flex items-center justify-center bg-slate-900/5 max-h-[60vh] sm:max-h-[70vh] overflow-auto touch-scroll">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border-t border-slate-100 text-[11px] sm:text-xs text-slate-500 shrink-0">
          <span className="text-center sm:text-left">Format gambar adaptif & beresolusi tinggi</span>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = imageUrl;
              a.download = 'diagram-soal-mitracbt.svg';
              a.click();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition active:scale-95 w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
