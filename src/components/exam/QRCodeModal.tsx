import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Projector, KeyRound, Copy, Check } from 'lucide-react';
import { Exam } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, exam }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !exam) return null;

  const examUrl = `${window.location.origin}/?exam=${exam.id}&pin=${exam.pin_code}`;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(exam.pin_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-center p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <Projector className="w-6 h-6" />
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
          Tampilan Proyektor Ruang Ujian
        </span>

        <h3 className="font-extrabold text-slate-900 text-xl mt-2 tracking-tight">
          {exam.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {exam.class?.name || 'Seluruh Kelas'} • Durasi: {exam.duration_minutes} Menit
        </p>

        {/* QR Code Container */}
        <div className="my-6 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block shadow-inner">
          <QRCodeSVG
            value={examUrl}
            size={220}
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"H"}
            includeMargin={true}
          />
        </div>

        {/* Big PIN for Classroom Projector */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            KODE PIN UJIAN
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-sky-400">
              {exam.pin_code}
            </span>
            <button
              onClick={handleCopyPin}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Salin PIN"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Siswa dapat memindai QR Code di atas menggunakan smartphone/Chromebook atau memasukkan 5 digit PIN ujian melalui portal siswa.
        </p>
      </div>
    </div>
  );
};
