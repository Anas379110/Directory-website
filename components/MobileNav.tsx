'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-white focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative bg-brand w-3/4 max-w-xs p-6 flex flex-col space-y-5 z-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-white">Directory</Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-white focus:outline-none"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-4">
              <Link href="/register" className="block text-white bg-white/10 px-3 py-1.5 rounded">سجّل شركتك</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
