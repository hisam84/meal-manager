'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Utensils, CheckCircle2, AlertCircle, Calendar, RefreshCw, X, Clock, Lock } from 'lucide-react';

export default function MealsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [members, setMembers] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);

  // Meal weights from Mess Settings
  const [bw, setBw] = useState(1.0);
  const [lw, setLw] = useState(1.0);
  const [dw, setDw] = useState(1.0);

  // Modal / Cell Selection states
  const [selectedCell, setSelectedCell] = useState<{ member: any; date: string } | null>(null);
  const [mode, setMode] = useState<'ON_DAILY' | 'ON_ONCE' | 'OFF_DAILY' | 'OFF_ONCE'>('ON_ONCE');
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
          fetchMembers();
          fetchSettings();
          fetchMeals(month);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router, month]);

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

  const isAdminOrManager = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Calculate days in month
  const [yearStr, monthStr] = month.split('-');
  const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Cell click handler
  const handleOpenCellModal = (member: any, day: number) => {
    if (!isAdminOrManager) {
      setMessage({
        type: 'error',
        text: 'সাধারণ মেম্বারগণ মিল পরিবর্তন করতে পারবেন না। মিল এডিটের জন্য মেস এডমিন বা ম্যানেজারের সাথে যোগাযোগ করুন।',
      });
      return;
    }

    const dayFormatted = day < 10 ? `0${day}` : `${day}`;
    const targetDate = `${month}-${dayFormatted}`;

    const existingMeal = meals.find((m) => m.userId === member.id && m.date === targetDate);

    setSelectedCell({ member, date: targetDate });
    setMode('ON_ONCE');
    if (existingMeal) {
      setBreakfast(existingMeal.breakfast);
      setLunch(existingMeal.lunch);
      setDinner(existingMeal.dinner);
      setNote(existingMeal.note || '');
    } else {
      setBreakfast(1);
      setLunch(1);
      setDinner(1);
      setNote('');
    }
  };

  const handleSaveMealEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !isAdminOrManager) return;

    setMessage(null);
    setSaving(true);

    let bVal = breakfast;
    let lVal = lunch;
    let dVal = dinner;

    if (mode === 'OFF_DAILY' || mode === 'OFF_ONCE') {
      bVal = 0;
      lVal = 0;
      dVal = 0;
    }

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedCell.member.id,
          date: selectedCell.date,
          breakfast: bVal,
          lunch: lVal,
          dinner: dVal,
          note,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save meal entry');

      setMessage({ type: 'success', text: 'মিল সেটিংস ও এন্ট্রি সফলভাবে সংরক্ষিত হয়েছে' });
      setSelectedCell(null);
      fetchMeals(month);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">
        লোড হচ্ছে...
      </div>
    );
  }

  const calculatedTotal = (breakfast * bw) + (lunch * lw) + (dinner * dw);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} title="এক্সেল স্টাইল মিল চার্ট" />

        <main className="p-6 space-y-6 max-w-full mx-auto w-full">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span>দৈনিক মিল চার্ট (Excel Sheet Grid)</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAdminOrManager ? (
                  `ঘরের তারিখের উপরে ক্লিক করে চালনা সেটিংস সেট করুন। সেটিং মান: সকাল (${bw}), দুপুর (${lw}), রাত (${dw})`
                ) : (
                  `সাধারণ মেম্বার মোড (Read-Only): মিল এডিটের জন্য মেস এডমিন বা ম্যানেজারের সাথে যোগাযোগ করুন।`
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">মাস পরিবর্তন:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold"
              />
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
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Excel Sheet Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 overflow-hidden space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                মাস: {month} | মোট দিন: {daysInMonth}
              </span>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
                {isAdminOrManager ? (
                  '💡 ঘরের উপর ক্লিক করে মিল এডিটর খুলুন'
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> শুধুমাত্র দেখার অনুমতি (Read-Only)
                  </span>
                )}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="px-3 py-2.5 text-left border-r border-b border-slate-200 dark:border-slate-700 min-w-[140px] sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">
                      মেম্বার নাম
                    </th>
                    {daysArray.map((day) => (
                      <th
                        key={day}
                        className="px-2 py-2.5 border-r border-b border-slate-200 dark:border-slate-700 min-w-[36px]"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-700 min-w-[80px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-extrabold">
                      মোট মিল
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {members.map((member) => {
                    const userMeals = meals.filter((m) => m.userId === member.id);
                    const memberTotalMeals = userMeals.reduce((sum, m) => sum + m.total, 0);

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        {/* Member Name */}
                        <td className="px-3 py-2 text-left font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-sm truncate">
                          {member.name}
                        </td>

                        {/* Days Grid Cells */}
                        {daysArray.map((day) => {
                          const dayFormatted = day < 10 ? `0${day}` : `${day}`;
                          const targetDate = `${month}-${dayFormatted}`;
                          const mealEntry = userMeals.find((m) => m.date === targetDate);

                          const hasEntry = Boolean(mealEntry);
                          const totalVal = mealEntry ? mealEntry.total : 0;

                          return (
                            <td
                              key={day}
                              onClick={() => handleOpenCellModal(member, day)}
                              className={`px-1 py-2 border-r border-slate-200 dark:border-slate-800 transition-all ${
                                isAdminOrManager
                                  ? 'cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/60'
                                  : 'cursor-default'
                              } ${
                                hasEntry && totalVal > 0
                                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold'
                                  : 'text-slate-400 dark:text-slate-600'
                              }`}
                              title={
                                isAdminOrManager
                                  ? `${member.name} - ${targetDate} (ক্লিক করুন এডিট করতে)`
                                  : `${member.name} - ${targetDate}`
                              }
                            >
                              {hasEntry ? totalVal : '-'}
                            </td>
                          );
                        })}

                        {/* Total Meals Column */}
                        <td className="px-3 py-2 font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50/50 dark:bg-sky-950/20 text-sm">
                          {memberTotalMeals}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Excel Sheet Cell Config Modal (Admin & Manager Only) */}
      {selectedCell && isAdminOrManager && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>মিল সেটিংস & এন্ট্রি</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  মেম্বার: <span className="font-bold text-slate-900 dark:text-white">{selectedCell.member.name}</span> | তারিখ: <span className="font-bold text-sky-600">{selectedCell.date}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMealEntry} className="space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">
                  মিল মোড নির্বাচন (Mode Options)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('ON_DAILY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      mode === 'ON_DAILY'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>চালু প্রতিদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('ON_ONCE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      mode === 'ON_ONCE'
                        ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-600/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>চালু একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('OFF_DAILY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      mode === 'OFF_DAILY'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>বন্ধ প্রতিদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('OFF_ONCE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      mode === 'OFF_ONCE'
                        ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>বন্ধ একদিন</span>
                  </button>
                </div>
              </div>

              {/* Meal Weight Count Options (Visible for ON modes) */}
              {(mode === 'ON_DAILY' || mode === 'ON_ONCE') && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-center">
                      <span className="text-[11px] font-bold uppercase text-slate-500">সকাল (মান: {bw})</span>
                      <div className="flex gap-1 pt-1">
                        {[0, 0.5, 1].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setBreakfast(val)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              breakfast === val
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-center">
                      <span className="text-[11px] font-bold uppercase text-slate-500">দুপুর (মান: {lw})</span>
                      <div className="flex gap-1 pt-1">
                        {[0, 0.5, 1].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setLunch(val)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              lunch === val
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-center">
                      <span className="text-[11px] font-bold uppercase text-slate-500">রাত (মান: {dw})</span>
                      <div className="flex gap-1 pt-1">
                        {[0, 0.5, 1].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDinner(val)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              dinner === val
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Calculation Summary */}
              <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 flex items-center justify-between text-xs font-semibold text-sky-900 dark:text-sky-200">
                <span>সেটিংস অনুযায়ী পয়েন্ট মান:</span>
                <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                  {mode === 'OFF_DAILY' || mode === 'OFF_ONCE' ? 0 : calculatedTotal} টি মিল
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
