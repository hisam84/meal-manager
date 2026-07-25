'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Settings, Download, RefreshCw, AlertTriangle, CheckCircle2, Utensils, Save, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Meal Settings states
  const [breakfastWeight, setBreakfastWeight] = useState(1.0);
  const [lunchWeight, setLunchWeight] = useState(1.0);
  const [dinnerWeight, setDinnerWeight] = useState(1.0);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Data reset states
  const [confirmInput, setConfirmInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || (data.user.role !== 'SUPERADMIN' && data.user.role !== 'ADMIN' && data.user.role !== 'MANAGER')) {
          router.push('/');
        } else {
          setUser(data.user);
          fetchSettings();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchSettings = () => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setBreakfastWeight(data.breakfastWeight ?? 1.0);
          setLunchWeight(data.lunchWeight ?? 1.0);
          setDinnerWeight(data.dinnerWeight ?? 1.0);
        }
      });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSaveMealSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);
    setSavingSettings(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakfastWeight,
          lunchWeight,
          dinnerWeight,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save meal settings');

      setSettingsMessage({ type: 'success', text: 'মিলের হার/ওয়েট সেটিংস সফলভাবে সংরক্ষিত এবং সকল মিলের হিসাব আপডেট হয়েছে!' });
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.message });
    } finally {
      setSavingSettings(false);
    }
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
              <span>মেস সেটিংস ও ডেটা ম্যানেজমেন্ট</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              প্রতি বেলার মিলের কাউন্টিং ওয়েট (০.৫ বা ১) এবং ব্যাকআপ সেটিংস
            </p>
          </div>

          {/* Meal Weighting Settings Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>বেলা অনুযায়ী মিলের মান / কাউন্ট সেটিংস (Meal Weighting Settings)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              এখান থেকে প্রতি বেলার মিলের মান (যেমন সকাল: ০.৫, দুপুর: ১.০, রাত: ১.০) নির্ধারণ করুন। সদস্যের মিল নির্বাচন অনুযায়ী এই মান দিয়ে গুণ করে মোট মিল হিসাব হবে।
            </p>

            {settingsMessage && (
              <div
                className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                  settingsMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {settingsMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{settingsMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveMealSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                  সকালের মিলের মান (Breakfast Weight)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  value={breakfastWeight}
                  onChange={(e) => setBreakfastWeight(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-sky-600 dark:text-sky-400"
                />
                <p className="text-[11px] text-slate-400">উদাঃ ১টি সকালের নাস্তা = {breakfastWeight} টি মিল</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                  দুপুরের মিলের মান (Lunch Weight)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  value={lunchWeight}
                  onChange={(e) => setLunchWeight(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-sky-600 dark:text-sky-400"
                />
                <p className="text-[11px] text-slate-400">উদাঃ ১টি দুপুরের খাবার = {lunchWeight} টি মিল</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                  রাতের মিলের মান (Dinner Weight)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  value={dinnerWeight}
                  onChange={(e) => setDinnerWeight(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-sky-600 dark:text-sky-400"
                />
                <p className="text-[11px] text-slate-400">উদাঃ ১টি রাতের খাবার = {dinnerWeight} টি মিল</p>
              </div>

              <div className="sm:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'সংরক্ষণ হচ্ছে...' : 'মিল সেটিংস সেভ করুন'}</span>
                </button>
              </div>
            </form>
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
