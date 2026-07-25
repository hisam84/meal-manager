'use client';

import { Calendar, Menu } from 'lucide-react';

interface NavbarProps {
  user: any;
  title: string;
  onMenuToggle: () => void;
}

export default function Navbar({ user, title, onMenuToggle }: NavbarProps) {
  const today = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-14 sm:h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger button for mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>{today}</span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
            <div className="sm:hidden w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
