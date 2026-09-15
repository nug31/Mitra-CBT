import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Projector, Copy, Check, Smartphone, Settings, Globe } from 'lucide-react';
import { Exam } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, exam }) => {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);
  
  // Default host is current origin (e.g. http://localhost:5173 or https://mitracbt.com)
  const [customOrigin, setCustomOrigin] = useState<string>(window.location.origin);

  if (!isOpen || !exam) return null;

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const examUrl = `${customOrigin.replace(/\/$/, '')}/?exam=${exam.id}&pin=${exam.pin_code}`;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(exam.pin_code);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(examUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-center p-5 sm:p-7 my-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon */}
        <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2.5">
          <Projector className="w-5 h-5" />
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700">
          Tampilan Proyektor Ruang Ujian
        </span>

        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mt-2 tracking-tight leading-snug">
          {exam.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {exam.class?.name || 'Seluruh Kelas'} • Durasi: {exam.duration_minutes} Menit
        </p>

        {/* QR Code Container */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block shadow-inner">
          <QRCodeSVG
            value={examUrl}
            size={190}
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"H"}
            includeMargin={true}
          />
        </div>

        {/* Big PIN for Classroom Projector */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 mb-3.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            KODE PIN UJIAN
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-sky-400">
              {exam.pin_code}
            </span>
            <button
              onClick={handleCopyPin}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Salin PIN"
            >
              {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 mb-3">
          <Smartphone className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p>
            Siswa memindai QR Code di atas menggunakan kamera HP, lalu login dengan <b>NISN</b> untuk langsung masuk ke ruang ujian.
          </p>
        </div>

        {/* Local Network / Custom Host Setting */}
        {isLocalhost && (
          <div className="pt-2 border-t border-slate-100 text-left">
            <button
              type="button"
              onClick={() => setShowNetworkSettings(!showNetworkSettings)}
              className="text-[11px] text-slate-500 hover:text-brand-600 flex items-center gap-1 font-medium transition"
            >
              <Settings className="w-3 h-3" />
              <span>{showNetworkSettings ? 'Sembunyikan Pengaturan IP WiFi HP' : 'Scan dari HP di WiFi yang sama? Klik di sini'}</span>
            </button>

            {showNetworkSettings && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 animate-in fade-in">
                <p className="text-[11px] text-amber-900 font-medium">
                  Karena Anda membuka di <code>localhost</code>, masukkan IP WiFi Laptop Anda agar kamera HP bisa membuka web ini (misal: <code>http://192.168.1.15:5173</code>):
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customOrigin}
                    onChange={(e) => setCustomOrigin(e.target.value)}
                    placeholder="http://192.168.x.x:5173"
                    className="flex-1 px-2 py-1 rounded-lg border border-amber-300 bg-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[11px] font-bold transition"
                  >
                    {copiedUrl ? 'Tersalin' : 'Salin URL'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
