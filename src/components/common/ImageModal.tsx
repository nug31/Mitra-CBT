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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex items-center justify-center bg-slate-900/5 max-h-[75vh] overflow-auto">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          <span>Format gambar adaptif & beresolusi tinggi untuk keperluan asesmen teknik kejuruan</span>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = imageUrl;
              a.download = 'diagram-soal-mitracbt.svg';
              a.click();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
