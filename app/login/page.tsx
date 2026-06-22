"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State buat icon mata
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Panggil fungsi signIn bawaan NextAuth
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Email atau password tidak sesuai. Coba lagi!");
      setIsLoading(false);
    } else {
      // Kalau berhasil, lempar balik ke halaman Dashboard Keislaman
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
      
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-violet-100/50 border border-violet-50">
        {/* HEADER LOGIN */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Portal Keislaman</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Silakan masuk untuk mengelola jadwal kegiatan dan kas operasional.
          </p>
        </div>

        {/* PESAN ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all bg-slate-50 focus:bg-white"
              placeholder="Masukkan email..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Dinamis tergantung state
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all bg-slate-50 focus:bg-white pr-12"
                placeholder="••••••••"
              />
              {/* TOMBOL MATA */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  // Mata Coret (Tutup)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  // Mata Kebuka
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-2 w-full py-3.5 rounded-xl font-black text-white shadow-md transition-all ${
              isLoading 
                ? "bg-violet-400 cursor-not-allowed" 
                : "bg-violet-600 hover:bg-violet-700 hover:shadow-violet-200"
            }`}
          >
            {isLoading ? "Memverifikasi Data..." : "Masuk ke Sistem"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}