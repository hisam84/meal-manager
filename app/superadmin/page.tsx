'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Plus, Building2, Users, UtensilsCrossed, Receipt, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [messes, setMesses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user.role !== 'SUPERADMIN') {
          router.push('/');
        } else {
          setUser(data.user);
          fetchMesses();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchMesses = () => {
    fetch('/api/messes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMesses(data);
      });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleCreateMess = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setCreating(true);

    try {
      const res = await fetch('/api/messes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mess');

      setMessage({ type: 'success', text: `নতুন মেস "${data.mess.name}" সফলভাবে তৈরি হয়েছে!` });
      setName('');
      setCode('');
      fetchMesses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">
        সুপার এডমিন কন্সোল লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} title="সুপার এডমিন মেস কন্সোল" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-sky-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-2">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
              <span>সুপার এডমিন মেস ম্যানেজমেন্ট কন্ট্রোল</span>
            </h1>
            <p className="text-xs text-slate-300">
              এখান থেকে নতুন মেস তৈরি করতে পারবেন এবং সকল মেসের ডাটা মনিটর করতে পারবেন
            </p>
          </div>

          {/* Create Mess Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>নতুন মেস তৈরি করুন (Create New Mess)</span>
            </h2>

            {message && (
              <div
                className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateMess} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মেসের নাম (Mess Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ শাপলা মেস / ধানমন্ডি মেস-০২"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ইউনিক মেস কোড (Mess Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ SHAPLA-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>{creating ? 'তৈরি হচ্ছে...' : 'নতুন মেস তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Messes List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">তৈরিকৃত মেস সমূহের তালিকা ({messes.length} টি)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {messes.map((m) => (
                <div key={m.id} className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white">{m.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                      {m.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      <span>মেম্বার: {m._count?.users || 0} জন</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                      <span>মিল: {m._count?.meals || 0} টি</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>খরচ রেকর্ড: {m._count?.expenses || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-purple-600" />
                      <span>পেমেন্ট: {m._count?.payments || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
