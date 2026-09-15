import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const list = await db.getAuditLogs();
    setLogs(list);
  };

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.user_name && l.user_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Audit Trail & Log Keamanan Sistem
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak seluruh aktivitas administrasi, pembuatan ujian, mutasi bank soal, dan perubahan konfigurasi
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aksi atau pengguna..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Waktu Kejadian</th>
                <th className="p-3.5 font-bold">Pengguna / Eksekutor</th>
                <th className="p-3.5 font-bold">Jenis Aksi</th>
                <th className="p-3.5 font-bold">Entitas Sasaran</th>
                <th className="p-3.5 font-bold">Detail Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {log.user_name || 'Administrator Sistem'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900 text-white uppercase font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 uppercase font-bold text-slate-600">
                    {log.entity_type}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-600 max-w-md">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
