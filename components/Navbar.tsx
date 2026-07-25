'use client';

import { Calendar } from 'lucide-react';

interface NavbarProps {
  user: any;
  title: string;
}

export default function Navbar({ user, title }: NavbarProps) {
  const today = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>{today}</span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
