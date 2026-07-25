'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Settings, Download, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [confirmInput, setConfirmInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || (data.user.role !== 'SUPERADMIN' && data.user.role !== 'ADMIN')) {
          router.push('/');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleDownloadBackup = () => {
    window.open('/api/backup', '_blank');
  };

  const handleResetData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput !== 'RESET') {
      alert('রিসেট করতে কনফার্মেশন বক্সে "RESET" লিখুন');
      return;
    }

    setResetting(true);
    setResetMessage(null);

    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset data');

      setResetMessage('সকল লেনদেন ও মিলের ডেটা সফলভাবে রিসেট করা হয়েছে!');
      setConfirmInput('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} title="সেটিংস ও ব্যাকআপ (Admin)" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <span>সিস্টেম ব্যাকআপ ও ডেটা ম্যানেজমেন্ট</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PostgreSQL (Neon) ডাটাবেজ ব্যাকআপ ও রিসেট সেটিংস
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup JSON */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">JSON ব্যাকআপ ডাউনলোড</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  মেসের সকল মেম্বার, মিল, খরচ এবং পেমেন্টের ব্যাকআপ ফাইল ডাউনলোড করুন
                </p>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>JSON ব্যাকআপ ফাইল নামান</span>
              </button>
            </div>

            {/* Reset Data Danger Zone */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">ডেটা রিসেট (Danger Zone)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  সকল মিল, খরচ ও লেনদেনের ইতিহাস মুছে ফেলতে নিচের বক্সে RESET টাইপ করুন
                </p>
              </div>

              {resetMessage && (
                <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetData} className="space-y-3">
                <input
                  type="text"
                  placeholder='টাইপ করুন "RESET"'
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold tracking-widest text-center"
                />

                <button
                  type="submit"
                  disabled={resetting || confirmInput !== 'RESET'}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{resetting ? 'রিসেট হচ্ছে...' : 'ডেটা রিসেট করুন'}</span>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
