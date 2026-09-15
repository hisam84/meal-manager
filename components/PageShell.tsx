'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

interface PageShellProps {
  user: any;
  onLogout: () => void;
  title: string;
  children: React.ReactNode;
}

export default function PageShell({ user, onLogout, title, children }: PageShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        user={user}
        onLogout={onLogout}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          title={title}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full flex-1">
          {children}
        </main>

        <footer className="no-print mt-auto py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <span>Developed by:</span>
            <a
              href="https://hisam-omega.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors underline decoration-sky-500/30 underline-offset-4"
            >
              Hisam Uddin
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
