'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Wallet,
  PieChart,
  Users,
  FileSpreadsheet,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const superAdminNavItems = [
    { href: '/superadmin', label: 'সুপার এডমিন (নতুন মেস যোগ)', icon: ShieldCheck },
    { href: '/profile', label: 'মাই প্রোফাইল', icon: User },
  ];

  const standardNavItems = [
    { href: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { href: '/meals', label: 'মিল হিসাব', icon: UtensilsCrossed },
    { href: '/expenses', label: 'মেস খরচ', icon: Receipt },
    { href: '/payments', label: 'পেমেন্ট/জমা', icon: Wallet },
    { href: '/summary', label: 'মাসিক সামারি', icon: PieChart },
    { href: '/members', label: 'মেম্বার তালিকা', icon: Users, adminOnly: true },
    { href: '/reports', label: 'রিপোর্ট ও এক্সপোর্ট', icon: FileSpreadsheet },
    { href: '/settings', label: 'সেটিংস ও ব্যাকআপ', icon: Settings, adminOnly: true },
    { href: '/profile', label: 'মাই প্রোফাইল', icon: User },
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : standardNavItems;
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-screen transition-colors">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-sky-500/20">
            ম
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight">মেস মিল ট্র্যাকার</h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isSuperAdmin ? 'Super Admin Console' : 'PostgreSQL & Next.js'}
            </span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold flex items-center justify-center text-sm">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 inline-block">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item: any) => {
            if (item.adminOnly && !isAdminOrManager) return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
            <span>{darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}</span>
          </div>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>লগআউট</span>
        </button>
      </div>
    </aside>
  );
}
