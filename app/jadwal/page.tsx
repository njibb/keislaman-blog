"use client";
import NavbarUser from '@/app/components/navbaruser';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function JadwalKeislaman() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', kegiatan: 'Pengajian Rutin', tanggal: '', status: 'Upcoming', 
    mc: '', penceramah: '', petugas: '', konsumsi: '', budget: '400000', pengeluaran: '0', kehadiran: '0'
  });

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openModal = (act: any = null) => {
    if (act) {
      setIsEditing(true);
      setFormData({
        id: act.id, kegiatan: act.kegiatan, tanggal: act.tanggal, status: act.status, 
        mc: act.mc, penceramah: act.penceramah, petugas: act.petugas, konsumsi: act.konsumsi || '',
        budget: String(act.budget), pengeluaran: String(act.pengeluaran), kehadiran: String(act.kehadiran)
      });
    } else {
      setIsEditing(false);
      setFormData({ id: '', kegiatan: 'Pengajian Rutin', tanggal: '', status: 'Upcoming', mc: '', penceramah: '', petugas: '', konsumsi: '', budget: '400000', pengeluaran: '0', kehadiran: '0' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pastikan kalau Hadroh, semua petugas di-set kosong
    const finalData = { ...formData };
    if (finalData.kegiatan === 'Latihan Hadroh') {
      finalData.mc = '-';
      finalData.penceramah = '-';
      finalData.petugas = '-';
      finalData.konsumsi = '-';
    }

    try {
      const res = await fetch('/api/keislaman', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      const result = await res.json();
      if (result.success) { fetchActivities(); closeModal(); } 
      else { alert('Gagal menyimpan data!'); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin mau menghapus jadwal ini?')) return;
    try {
      const res = await fetch(`/api/keislaman?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) fetchActivities();
    } catch (error) { console.error("Gagal hapus data", error); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* NAVBAR */}
      <nav className="bg-white p-4 md:p-6 flex justify-between items-center border-b border-violet-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="text-lg md:text-xl font-black text-violet-700 hover:text-violet-800 transition-colors">
            Keislaman Irmala
          </Link>
          <span className="text-slate-400 font-bold mx-1 md:mx-2">/</span>
          <span className="bg-violet-800 text-white text-[9px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-bold uppercase tracking-widest whitespace-nowrap">
            Manajemen Jadwal
          </span>
        </div>
        <NavbarUser name="Admin Keislaman" role="PENGURUS" initial="K" />
      </nav>
    
      <main className="max-w-6xl mx-auto p-4 md:p-6 mt-4">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Jadwal & Petugas Piket</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Atur roster petugas Pengajian Rutin, Talkshow, dan Latihan Hadroh.</p>
          </div>
          {session && (
            <button onClick={() => openModal()} className="bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-violet-700 shadow-md transition-all whitespace-nowrap text-sm flex items-center gap-2">
              + Tambah Jadwal
            </button>
          )}
        </div>

        {/* DAFTAR JADWAL GRID */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 font-bold">Memuat jadwal kegiatan...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 font-bold shadow-sm">Belum ada agenda yang terdaftar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <div key={act.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                  <div>
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg mb-2 ${
                      act.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 
                      act.status === 'Batal' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {act.status}
                    </span>
                    <h3 className="font-black text-violet-700 text-lg leading-tight">{act.kegiatan}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">📅 {act.tanggal}</p>
                  </div>
                  {session && (
                    <div className="flex gap-2">
                      <button onClick={() => openModal(act)} className="text-slate-400 hover:text-amber-500 transition-colors" title="Edit">✎</button>
                      <button onClick={() => handleDelete(act.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Hapus">✕</button>
                    </div>
                  )}
                </div>
                
                {/* TAMPILAN DINAMIS BERDASARKAN KEGIATAN */}
                {act.kegiatan !== 'Latihan Hadroh' ? (
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Petugas MC</span>
                      <span className="text-sm font-black text-slate-700">{act.mc !== '-' ? act.mc : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {act.kegiatan === 'Talkshow' ? 'Moderator' : 'Pemimpin Ratib'}
                      </span>
                      <span className="text-sm font-black text-slate-700">{act.penceramah !== '-' ? act.penceramah : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {act.kegiatan === 'Talkshow' ? 'Pemimpin Tahlil' : 'Pembaca Rawi'}
                      </span>
                      <span className="text-sm font-black text-slate-700">{act.petugas !== '-' ? act.petugas : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-violet-50 p-2.5 rounded-xl border border-violet-100 mt-1">
                      <span className="text-[10px] font-bold text-violet-600 uppercase">Piket Konsumsi</span>
                      <span className="text-sm font-black text-violet-800">{(act.konsumsi && act.konsumsi !== '-') ? act.konsumsi : '-'}</span>
                    </div>
                  </div>
                ) : (
                  // TAMPILAN KHUSUS LATIHAN HADROH
                  <div className="p-5 flex flex-col justify-center items-center flex-1 bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-400 text-center">Tidak memerlukan alokasi petugas piket.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-black text-lg text-slate-800">{isEditing ? 'Edit Jadwal' : 'Buat Jadwal Baru'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jenis Kegiatan</label>
                  <select value={formData.kegiatan} onChange={(e) => setFormData({...formData, kegiatan: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 bg-slate-50 outline-none focus:border-violet-500">
                    <option value="Pengajian Rutin">Pengajian Rutin</option>
                    <option value="Latihan Hadroh">Latihan Hadroh</option>
                    <option value="Talkshow">Talkshow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 bg-slate-50 outline-none focus:border-violet-500">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>
              </div>

              {/* NAH INI DIA TAMBAHANNYA: GRID TANGGAL & BUDGET BIAR RAPI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Pelaksanaan</label>
                  <input type="text" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-violet-500 bg-slate-50" placeholder="Contoh: 09 Juni 2026" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Budget Kas (Rp)</label>
                  <input type="number" required value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-violet-500 bg-slate-50" placeholder="Contoh: 400000" />
                </div>
              </div>

              {/* RESPONSIVE GRID PETUGAS */}
              {formData.kegiatan !== 'Latihan Hadroh' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="md:col-span-2"><p className="text-xs font-black text-slate-700 mb-1">Daftar Petugas Piket</p></div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Petugas MC</label>
                    <input type="text" value={formData.mc} onChange={(e) => setFormData({...formData, mc: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-violet-500" placeholder="Nama MC" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {formData.kegiatan === 'Talkshow' ? 'Moderator' : 'Pemimpin Ratib'}
                    </label>
                    <input type="text" value={formData.penceramah} onChange={(e) => setFormData({...formData, penceramah: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-violet-500" placeholder="Nama Petugas" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {formData.kegiatan === 'Talkshow' ? 'Pemimpin Tahlil' : 'Pembaca Rawi'}
                    </label>
                    <input type="text" value={formData.petugas} onChange={(e) => setFormData({...formData, petugas: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-violet-500" placeholder="Nama Petugas" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Piket Konsumsi</label>
                    <input type="text" value={formData.konsumsi} onChange={(e) => setFormData({...formData, konsumsi: e.target.value})} required={formData.kegiatan !== 'Latihan Hadroh'} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-violet-500" placeholder="Petugas Konsumsi" />
                  </div>
                </div>
              )}

              {/* RESPONSIVE GRID LAPORAN PENGELUARAN */}
              {formData.status === 'Selesai' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-violet-50 p-4 rounded-xl border border-violet-100">
                  <div className="md:col-span-2">
                    <p className="text-xs font-black text-violet-800 mb-1">Laporan Pasca Kegiatan</p>
                    <p className="text-[9px] text-violet-600 mb-2">Data ini akan otomatis disinkronisasi ke Kas Keuangan Bendahara.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">Pengeluaran (Rp)</label>
                    <input type="number" value={formData.pengeluaran} onChange={(e) => setFormData({...formData, pengeluaran: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-violet-200 text-sm outline-none focus:border-violet-500 bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">Kehadiran (Anak)</label>
                    <input type="number" value={formData.kehadiran} onChange={(e) => setFormData({...formData, kehadiran: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-violet-200 text-sm outline-none focus:border-violet-500 bg-white" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 shadow-md shadow-violet-100 transition-all">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}