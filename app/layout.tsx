import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Directory — دليل خدمات ومعلومات',
  description: 'دليل شركات وخدمات قانونية وعقارية وتعليمية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic bg-neutral-50 text-neutral-900 min-h-screen flex flex-col">
        <header className="bg-brand text-white">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">Directory</a>
            <a href="/register" className="text-sm bg-white/10 px-3 py-1.5 rounded">
              سجّل شركتك
            </a>
          </nav>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="bg-brand-dark text-white text-sm">
          <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-between">
            <p>© {new Date().getFullYear()} Directory — anasnet.com</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
