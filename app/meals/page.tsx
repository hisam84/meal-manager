'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Utensils, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MealsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedUserId, setSelectedUserId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);

  // Meal weights from Settings
  const [bw, setBw] = useState(1.0);
  const [lw, setLw] = useState(1.0);
  const [dw, setDw] = useState(1.0);

  // Form states
  const [breakfast, setBreakfast] = useState(1);
  const [lunch, setLunch] = useState(1);
  const [dinner, setDinner] = useState(1);
  const [note, setNote] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          setSelectedUserId(data.user.id);
          fetchMembers();
          fetchSettings();
          fetchMeals(date.slice(0, 7));
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
          setBw(data.breakfastWeight ?? 1.0);
          setLw(data.lunchWeight ?? 1.0);
          setDw(data.dinnerWeight ?? 1.0);
        }
      });
  };

  const fetchMembers = () => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      });
  };

  const fetchMeals = (m: string) => {
    fetch(`/api/meals?month=${m}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMeals(data);
      });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const setFullDay = () => {
    setBreakfast(1);
    setLunch(1);
    setDinner(1);
  };

  const clearAll = () => {
    setBreakfast(0);
    setLunch(0);
    setDinner(0);
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId || user.id,
          date,
          breakfast,
          lunch,
          dinner,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save meal');

      setMessage({ type: 'success', text: 'মিল এন্ট্রি সফলভাবে সংরক্ষিত হয়েছে' });
      fetchMeals(date.slice(0, 7));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('আপনি কি এই মিল রেকর্ডটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/meals?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete meal');
      fetchMeals(date.slice(0, 7));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        লোড হচ্ছে...
      </div>
    );
  }

  const isAdminOrManager = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const totalCalculated = (breakfast * bw) + (lunch * lw) + (dinner * dw);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} title="মিল হিসাব ব্যবস্থাপনা" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Meal Entry Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <span>দৈনিক মিল এন্ট্রি</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  সেটিংসের বর্তমান মিল রেট মান: সকাল ({bw}), দুপুর ({lw}), রাত ({dw})
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={setFullDay}
                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  ফুল ডে (১+১+১)
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  ক্লিয়ার (০)
                </button>
              </div>
            </div>

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

            <form onSubmit={handleSaveMeal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isAdminOrManager && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      মেম্বার নির্বাচন করুন
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value={user?.id}>আমার নিজের (আমি)</option>
                      {members
                        .filter((m) => m.id !== user?.id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.phone})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      fetchMeals(e.target.value.slice(0, 7));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    নোট / মন্তব্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ অতিথি মিল"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Breakfast, Lunch, Dinner selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">সকালের নাস্তা</span>
                    <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">মান: {bw}</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 0.5, 1].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBreakfast(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                          breakfast === val
                            ? 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">দুপুরের খাবার</span>
                    <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">মান: {lw}</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 0.5, 1].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLunch(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                          lunch === val
                            ? 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">রাতের খাবার</span>
                    <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">মান: {dw}</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 0.5, 1].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDinner(val)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                          dinner === val
                            ? 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  সেটিংস অনুযায়ী হিসাবকৃত মোট মিল: <span className="text-sky-600 dark:text-sky-400 font-bold text-base">{totalCalculated}</span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'মিল সেভ করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Meal Logs History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">মিল হিস্ট্রি লগ ({date.slice(0, 7)})</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">তারিখ</th>
                    <th className="px-4 py-3">মেম্বার</th>
                    <th className="px-4 py-3">সকাল</th>
                    <th className="px-4 py-3">দুপুর</th>
                    <th className="px-4 py-3">রাত</th>
                    <th className="px-4 py-3 font-semibold">মোট মিল (Weighted)</th>
                    <th className="px-4 py-3">নোট</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {meals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        এই মাসে কোনো মিলের তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    meals.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.date}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{m.user?.name}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.breakfast}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.lunch}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.dinner}</td>
                        <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{m.total}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{m.note || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteMeal(m.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
