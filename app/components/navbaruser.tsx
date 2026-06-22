"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

interface NavbarUserProps {
  name?: string | null;
  role?: string | null;
  initial?: string | null;
}

export default function NavbarUser({ name, role, initial }: NavbarUserProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const displayName = name || "Admin Keislaman";
  const displayRole = role || "PENGURUS";
  const displayInitial = initial || displayName.charAt(0).toUpperCase();

  return (
    <div className="relative flex items-center gap-2 md:gap-5">
      
      {/* NAVIGASI DESKTOP KHUSUS KEISLAMAN */}
      <Link href="/jadwal" className="hidden md:block text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
        Manajemen Jadwal
      </Link>
      
      {!session && (
        <Link href="/login" className="hidden md:block text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors">
          Login Admin
        </Link>
      )}

      {/* ICON HAMBURGER MOBILE */}
      <button 
        className="md:hidden p-2 text-slate-500 hover:text-violet-600 hover:bg-slate-100 rounded-lg transition-all"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* SIDEBAR MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black text-slate-800 text-lg">Menu Portal</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-red-500 font-black text-xl">&times;</button>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link href="/jadwal" className="text-sm font-bold text-slate-600 px-4 py-3 rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Manajemen Jadwal</Link>
          </div>

          <div className="mt-auto border-t pt-6 border-slate-100">
            {!session ? (
              <Link href="/login" className="flex justify-center w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 shadow-md shadow-violet-100" onClick={() => setIsMobileMenuOpen(false)}>Login Admin</Link>
            ) : (
              <button onClick={() => signOut()} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">Logout dari Sistem</button>
            )}
          </div>
        </div>
      </div>

      {/* PROFIL USER DESKTOP */}
      {session ? (
        <div className="hidden md:flex relative items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{displayName}</p>
            <p className="text-[10px] font-black text-violet-600 uppercase tracking-wider">{displayRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-violet-100">
            {displayInitial}
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-36 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : null}
      
    </div>
  );
}