"use client";
import NavbarUser from '@/app/components/navbaruser';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function KeislamanTracker() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState('Semua');
  const [selectedYear, setSelectedYear] = useState('Semua');

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/keislaman');
      const result = await res.json();
      if (result.success) setActivities(result.data);
    } catch (error) {
      console.error("Gagal load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActivities();
  }, []);

  // KALKULASI STATS TOTAL (HANYA MENGHITUNG YANG STATUSNYA "SELESAI")
  const totalSisaBudget = activities
    .filter(act => act.status === 'Selesai')
    .reduce((acc, curr) => acc + (curr.budget - curr.pengeluaran), 0);
  
  // LOGIKA FILTER GRAFIK
  const completedActivities = [...activities].reverse().filter(act => act.status === 'Selesai');
  const availableYears = ['Semua', ...Array.from(new Set(completedActivities.map(a => a.tanggal.split(' ')[2]).filter(Boolean)))];
  const listMonths = ['Semua', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const chartData = completedActivities.filter(act => {
    const parts = act.tanggal.split(' '); 
    if (parts.length < 3) return true; 
    const actMonth = parts[1];
    const actYear = parts[2];
    const matchMonth = selectedMonth === 'Semua' || actMonth.toLowerCase() === selectedMonth.toLowerCase();
    const matchYear = selectedYear === 'Semua' || actYear === selectedYear;
    return matchMonth && matchYear;
  }).map(act => ({
    name: act.tanggal.split(' ').slice(0, 2).join(' '), 
    tanggalLengkap: act.tanggal,
    kehadiran: act.kehadiran
  }));

  // LOGIKA FILTER TABEL HANYA BULAN SAAT INI
  const listMonthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentDate = new Date();
  const currentMonthString = listMonthsIndo[currentDate.getMonth()];
  const currentYearString = currentDate.getFullYear().toString();

  const currentMonthActivities = activities.filter((act) => {
    const parts = act.tanggal.split(' ');
    if (parts.length >= 3) {
      return parts[1].toLowerCase() === currentMonthString.toLowerCase() && parts[2] === currentYearString;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <nav className="bg-white p-4 md:p-6 flex justify-between items-center border-b border-violet-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="text-lg md:text-xl font-black text-violet-700 hover:text-violet-800 transition-colors">Keislaman Irmala</Link>
        </div>
        <NavbarUser name="Admin Keislaman" role="PENGURUS" initial="K" />
      </nav>
    
      <main className="max-w-6xl mx-auto p-4 md:p-6 mt-4">
        
        {/* TOP DASHBOARD: STATS & GRAFIK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl border border-violet-100 shadow-sm flex-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Pengembalian Kas</p>
              <h3 className="text-3xl font-black text-violet-600 mt-2">Rp {totalSisaBudget.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Kegiatan</p>
              <h3 className="text-3xl font-black text-blue-600 mt-2">{activities.length} <span className="text-sm font-medium text-slate-500">Sesi</span></h3>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Grafik Kehadiran Jamaah</h3>
              
              {/* FILTER DROPDOWN */}
              <div className="flex gap-2">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-violet-500"
                >
                  {listMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-violet-500"
                >
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            
            {/* RENDER DIAGRAM BATANG (BAR CHART) RECHARTS */}
            <div className="flex-1 min-h-[220px] w-full">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-300">
                  Tidak ada data untuk periode ini.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.tanggalLengkap || label}
                      // eslint-disable-next-line react/jsx-key
                      formatter={(value) => [<span className="font-black text-violet-600">{value} Anak</span>, "Hadir"]}
                    />
                    <Bar 
                      dataKey="kehadiran" 
                      fill="#8b5cf6" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* HEADER TABEL & ACTION BAR */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800">Jadwal & Piket Bulan Ini</h2>
            <p className="text-sm text-slate-500 font-medium">Periode {currentMonthString} {currentYearString}</p>
          </div>
          {session && (
            <Link href="/jadwal" className="bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-violet-700 shadow-md transition-all text-sm">
              Lihat Seluruh Jadwal
            </Link>
          )}
        </div>

        {/* TABEL DATA BULAN INI (READ-ONLY) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-5">Tanggal & Status</th>
                  <th className="p-5">Kegiatan & Detail Petugas</th>
                  <th className="p-5">Piket Konsumsi</th>
                  <th className="p-5 text-center">Sisa Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Memuat data bulan ini...</td></tr>
                ) : currentMonthActivities.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Belum ada agenda keagamaan di bulan {currentMonthString} {currentYearString}.</td></tr>
                ) : (
                  currentMonthActivities.map((act) => {
                    const sisa = act.budget - act.pengeluaran;
                    return (
                      <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5">
                          <div className="font-black text-slate-700">{act.tanggal}</div>
                          <span className={`inline-block px-2 py-0.5 mt-1 text-[9px] font-black uppercase tracking-wider rounded-md ${
                            act.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                            act.status === 'Batal' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>{act.status}</span>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-violet-700">{act.kegiatan}</div>
                          {act.kegiatan !== 'Latihan Hadroh' && (
                            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                              MC: {act.mc} | {act.kegiatan === 'Talkshow' ? 'Moderator' : 'Ratib'}: {act.penceramah} | {act.kegiatan === 'Talkshow' ? 'Tahlil' : 'Rawi'}: {act.petugas}
                            </div>
                          )}
                        </td>
                        <td className="p-5 font-bold text-slate-600">
                          {act.kegiatan === 'Latihan Hadroh' ? '-' : (act.konsumsi || '-')}
                        </td>
                        <td className="p-5 text-center">
                          {/* LOGIKA SISA BUDGET TAMPIL KALAU SUDAH SELESAI */}
                          {act.status === 'Selesai' ? (
                            <>
                              <div className="font-black text-xs text-amber-600">Rp {sisa.toLocaleString('id-ID')}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Terpakai: Rp {act.pengeluaran.toLocaleString('id-ID')}</div>
                            </>
                          ) : act.status === 'Batal' ? (
                            <span className="text-[10px] font-bold text-slate-400">Dibatalkan</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">Menunggu Acara</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}