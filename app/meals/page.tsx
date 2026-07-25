'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { Utensils, CheckCircle2, AlertCircle, Calendar, RefreshCw, X, Clock, Lock, Info } from 'lucide-react';

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

  // Cell modal states
  const [selectedCell, setSelectedCell] = useState<{ member: any; date: string } | null>(null);

  // Per-meal time settings: Breakfast, Lunch, Dinner
  const [breakfastCount, setBreakfastCount] = useState(1);
  const [breakfastMode, setBreakfastMode] = useState<'DAILY' | 'ONCE' | 'OFF' | 'OFF_ONCE'>('ONCE');

  const [lunchCount, setLunchCount] = useState(1);
  const [lunchMode, setLunchMode] = useState<'DAILY' | 'ONCE' | 'OFF' | 'OFF_ONCE'>('ONCE');

  const [dinnerCount, setDinnerCount] = useState(1);
  const [dinnerMode, setDinnerMode] = useState<'DAILY' | 'ONCE' | 'OFF' | 'OFF_ONCE'>('ONCE');

  const [note, setNote] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

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

    if (existingMeal) {
      setBreakfastCount(existingMeal.breakfast || 1);
      setBreakfastMode(existingMeal.breakfast > 0 ? 'ONCE' : 'OFF');

      setLunchCount(existingMeal.lunch || 1);
      setLunchMode(existingMeal.lunch > 0 ? 'ONCE' : 'OFF');

      setDinnerCount(existingMeal.dinner || 1);
      setDinnerMode(existingMeal.dinner > 0 ? 'ONCE' : 'OFF');

      setNote(existingMeal.note || '');
    } else {
      setBreakfastCount(1);
      setBreakfastMode('ONCE');

      setLunchCount(1);
      setLunchMode('ONCE');

      setDinnerCount(1);
      setDinnerMode('ONCE');

      setNote('');
    }
  };

  const handleSaveMealEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !isAdminOrManager) return;

    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedCell.member.id,
          date: selectedCell.date,

          breakfastCount: Math.max(0, Math.floor(Number(breakfastCount) || 0)),
          breakfastMode,

          lunchCount: Math.max(0, Math.floor(Number(lunchCount) || 0)),
          lunchMode,

          dinnerCount: Math.max(0, Math.floor(Number(dinnerCount) || 0)),
          dinnerMode,

          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save meal entry');

      setMessage({ type: 'success', text: `মিল সেটিংস (${selectedCell.date} থেকে পরবর্তী তারিখসমূহে) সংরক্ষিত হয়েছে` });
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

  // Calculate live preview count for modal
  const bVal = (breakfastMode === 'OFF' || breakfastMode === 'OFF_ONCE') ? 0 : Math.max(0, Math.floor(Number(breakfastCount) || 0));
  const lVal = (lunchMode === 'OFF' || lunchMode === 'OFF_ONCE') ? 0 : Math.max(0, Math.floor(Number(lunchCount) || 0));
  const dVal = (dinnerMode === 'OFF' || dinnerMode === 'OFF_ONCE') ? 0 : Math.max(0, Math.floor(Number(dinnerCount) || 0));
  const modalCalculatedTotal = (bVal * bw) + (lVal * lw) + (dVal * dw);

  return (
    <>
    <PageShell user={user} onLogout={handleLogout} title="দৈনিক মিল চার্ট ও বেলা-ভিত্তিক সেটিংস">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span>দৈনিক মিল চার্ট (Excel Sheet Grid)</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ঘরের উপর ক্লিক করে বেলা-ভিত্তিক মিল সংখ্যা ও মোড (প্রতিদিন/একদিন/বন্ধ) কনফিগার করুন। বর্তমান সেটিং মান: সকাল ({bw}), দুপুর ({lw}), রাত ({dw})
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
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>আজকের তারিখ ({todayStr}) পর্যন্ত মিল মোট পয়েন্টে গণনাকৃত হবে। ভবিষ্যৎ তারিখসমূহ কেবল নির্ধারিত থাকবে।</span>
              </span>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
                {isAdminOrManager ? (
                  '💡 ঘরের উপর ক্লিক করে বেলার মিল এডিটর খুলুন'
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
                    <th className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-700 min-w-[90px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-extrabold">
                      মোট মিল (আজ পর্যন্ত)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {members.map((member) => {
                    const userMeals = meals.filter((m) => m.userId === member.id);

                    // Count total ONLY for meals up to today
                    const memberTotalMeals = userMeals
                      .filter((m) => m.date <= todayStr)
                      .reduce((sum, m) => sum + m.total, 0);

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

                          const isFutureDate = targetDate > todayStr;
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
                                isFutureDate
                                  ? 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 italic'
                                  : hasEntry && totalVal > 0
                                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold'
                                  : 'text-slate-400 dark:text-slate-600'
                              }`}
                              title={
                                isFutureDate
                                  ? `${member.name} - ${targetDate} (ভবিষ্যৎ তারিখ - এখনও কাউন্ট হয়নি)`
                                  : `${member.name} - ${targetDate}`
                              }
                            >
                              {hasEntry ? (isFutureDate ? `(${totalVal})` : totalVal) : '-'}
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
    </PageShell>

      {/* Excel Sheet Per-Meal Time Config Modal (Admin & Manager Only) */}
      {selectedCell && isAdminOrManager && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>বেলাভিত্তিক মিল সেটিংস & ইনপুট</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  মেম্বার: <span className="font-bold text-slate-900 dark:text-white">{selectedCell.member.name}</span> | নির্বাচন তারিখ: <span className="font-bold text-sky-600">{selectedCell.date}</span>
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
              {/* Breakfast Config */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    সকালের নাস্তা (Breakfast Weight: {bw})
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 font-medium">ইনপুট সংখ্যা:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      required
                      value={breakfastCount}
                      onChange={(e) => setBreakfastCount(Number(e.target.value))}
                      className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setBreakfastMode('DAILY')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      breakfastMode === 'DAILY'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>প্রতিদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBreakfastMode('ONCE')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      breakfastMode === 'ONCE'
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBreakfastMode('OFF_ONCE')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      breakfastMode === 'OFF_ONCE'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>বন্ধ একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBreakfastMode('OFF')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      breakfastMode === 'OFF'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>বন্ধ প্রতিদিন</span>
                  </button>
                </div>
              </div>

              {/* Lunch Config */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    দুপুরের খাবার (Lunch Weight: {lw})
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 font-medium">ইনপুট সংখ্যা:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      required
                      value={lunchCount}
                      onChange={(e) => setLunchCount(Number(e.target.value))}
                      className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setLunchMode('DAILY')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      lunchMode === 'DAILY'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>প্রতিদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLunchMode('ONCE')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      lunchMode === 'ONCE'
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLunchMode('OFF_ONCE')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      lunchMode === 'OFF_ONCE'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>বন্ধ একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLunchMode('OFF')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      lunchMode === 'OFF'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>বন্ধ প্রতিদিন</span>
                  </button>
                </div>
              </div>

              {/* Dinner Config */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    রাতের খাবার (Dinner Weight: {dw})
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 font-medium">ইনপুট সংখ্যা:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      required
                      value={dinnerCount}
                      onChange={(e) => setDinnerCount(Number(e.target.value))}
                      className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDinnerMode('DAILY')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      dinnerMode === 'DAILY'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>প্রতিদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDinnerMode('ONCE')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      dinnerMode === 'ONCE'
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDinnerMode('OFF_ONCE')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      dinnerMode === 'OFF_ONCE'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>বন্ধ একদিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDinnerMode('OFF')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      dinnerMode === 'OFF'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>বন্ধ প্রতিদিন</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Calculation Summary */}
              <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 flex items-center justify-between text-xs font-semibold text-sky-900 dark:text-sky-200">
                <span>মিল সেটিং মান অনুয়ায়ী পয়েন্ট হিসাব:</span>
                <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                  {modalCalculatedTotal} টি মিল
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
    </>
  );
}
