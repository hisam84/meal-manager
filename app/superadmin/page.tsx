'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { ShieldCheck, Plus, Building2, Users, UtensilsCrossed, Receipt, Wallet, UserCheck, KeyRound, CheckCircle2, AlertCircle, Pencil, RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [messes, setMesses] = useState<any[]>([]);

  // Mess Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit Mess Admin state
  const [editMess, setEditMess] = useState<any>(null);
  const [editMessName, setEditMessName] = useState('');
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminPhone, setEditAdminPhone] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Reset Mess Data state
  const [resetMess, setResetMess] = useState<any>(null);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetting, setResetting] = useState(false);

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
        body: JSON.stringify({
          name,
          code,
          adminName,
          adminPhone,
          adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mess');

      setMessage({
        type: 'success',
        text: `মেস "${data.mess.name}" এবং মেস এডমিন অ্যাকাউন্ট (${data.admin.name} - ${data.admin.phone}) সফলভাবে তৈরি হয়েছে!`,
      });

      setName('');
      setCode('');
      setAdminName('');
      setAdminPhone('');
      setAdminPassword('');
      fetchMesses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateMessAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMess) return;

    setUpdating(true);
    try {
      const adminUser = editMess.users?.[0];
      const res = await fetch('/api/messes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messId: editMess.id,
          messName: editMessName,
          adminId: adminUser?.id,
          adminName: editAdminName,
          adminPhone: editAdminPhone,
          adminPassword: editAdminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update mess & admin');

      setMessage({ type: 'success', text: `মেস "${editMessName}" ও এডমিনের তথ্য আপডেট করা হয়েছে!` });
      setEditMess(null);
      setEditAdminPassword('');
      fetchMesses();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetMess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetMess) return;
    if (resetConfirmInput !== 'RESET') {
      alert('রিসেট করতে কনফার্মেশন বক্সে "RESET" লিখুন');
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET', messId: resetMess.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset mess data');

      setMessage({ type: 'success', text: `মেস "${resetMess.name}"-এর সকল লেনদেন ও মিলের ডেটা সফলভাবে রিসেট করা হয়েছে!` });
      setResetMess(null);
      setResetConfirmInput('');
      fetchMesses();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
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
    <PageShell user={user} onLogout={handleLogout} title="সুপার এডমিন মেস কন্সোল">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-sky-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-2">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
              <span>সুপার এডমিন কন্সোল — মেস ও মেস এডমিন তৈরি</span>
            </h1>
            <p className="text-xs text-slate-300">
              নতুন মেস তৈরি করার সময় স্বয়ংক্রিয়ভাবে উক্ত মেসের আলাদা এডমিন অ্যাকাউন্ট তৈরি হবে
            </p>
          </div>

          {/* Create Mess & Mess Admin Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>নতুন মেস ও মেস এডমিন অ্যাকাউন্ট তৈরি করুন</span>
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

            <form onSubmit={handleCreateMess} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Mess Admin Account Section */}
              <div className="pt-2">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-3">
                  মেস এডমিনের অ্যাকাউন্ট তথ্য (Mess Admin Credentials)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      এডমিনের নাম
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ কামাল হোসেন"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      এডমিনের ফোন নম্বর (Username)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01711002233"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      এডমিনের পাসওয়ার্ড
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>{creating ? 'তৈরি হচ্ছে...' : 'মেস ও এডমিন অ্যাকাউন্ট তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Messes List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">তৈরিকৃত মেস ও এডমিনদের তালিকা ({messes.length} টি)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {messes.map((m) => {
                const messAdmin = m.users?.[0];
                return (
                  <div key={m.id} className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white">{m.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                        {m.code}
                      </span>
                    </div>

                    {messAdmin && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                            <span>মেস এডমিন: {messAdmin.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditMess(m);
                              setEditMessName(m.name);
                              setEditAdminName(messAdmin.name);
                              setEditAdminPhone(messAdmin.phone);
                              setEditAdminPassword('');
                            }}
                            className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                            title="মেস ও এডমিন তথ্য এডিট"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono pl-5">
                          ফোন: {messAdmin.phone}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          <span>{m._count?.users || 0} জন</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{m._count?.meals || 0} টি</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setResetMess(m);
                          setResetConfirmInput('');
                        }}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border border-rose-200/60 dark:border-rose-900/60"
                        title="মেসের সকল ডেটা রিসেট করুন"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ডেটা রিসেট</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      {/* Edit Mess Admin Modal */}
      {editMess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-500" />
              <span>মেস ও এডমিন তথ্য এডিট করুন</span>
            </h3>
            <form onSubmit={handleUpdateMessAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মেসের নাম
                </label>
                <input
                  type="text"
                  required
                  value={editMessName}
                  onChange={(e) => setEditMessName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মেস এডমিনের নাম
                </label>
                <input
                  type="text"
                  required
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  এডমিনের ফোন নম্বর (Username)
                </label>
                <input
                  type="text"
                  required
                  value={editAdminPhone}
                  onChange={(e) => setEditAdminPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  নতুন পাসওয়ার্ড (ঐচ্ছিক — পরিবর্তন করতে চাইলে দিন)
                </label>
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড পরিবর্তন না করতে চাইলে ফাঁকা রাখুন"
                  value={editAdminPassword}
                  onChange={(e) => setEditAdminPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMess(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 disabled:opacity-50"
                >
                  {updating ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Mess Data Modal (SuperAdmin Only) */}
      {resetMess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মেস ডেটা রিসেট (Danger Zone)</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">মেস: {resetMess.name} ({resetMess.code})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              এই মেসের সকল মিল, খরচ, পেমেন্ট, রাঁধুনীর বিল এবং ম্যানেজার পদের হিস্ট্রি মুছে ফেলা হবে। নিশ্চিত করতে নিচে <strong className="text-rose-600 font-bold">"RESET"</strong> টাইপ করুন:
            </p>

            <form onSubmit={handleResetMess} className="space-y-3">
              <input
                type="text"
                placeholder='টাইপ করুন "RESET"'
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold tracking-widest text-center"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetMess(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={resetting || resetConfirmInput !== 'RESET'}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/30 text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{resetting ? 'রিসেট হচ্ছে...' : 'মেস ডেটা রিসেট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
