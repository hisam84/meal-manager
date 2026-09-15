'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import {
  Utensils,
  CheckCircle2,
  AlertCircle,
  Calendar,
  RefreshCw,
  X,
  Clock,
  Lock,
  Info,
  UserCheck,
  ChevronDown,
  Shield,
  Sparkles,
  ArrowRight,
  Filter,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function MealsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [managerTerms, setManagerTerms] = useState<any[]>([]);

  // Selection mode: 'TERM' (default - manager based) or 'MONTH' (calendar month)
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM fallback

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
          fetchManagerTermsAndInit();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchManagerTermsAndInit = async () => {
    try {
      const res = await fetch('/api/manager-terms');
      const data = await res.json();
      if (Array.isArray(data)) {
        setManagerTerms(data);
        if (data.length > 0) {
          // Find currently active term or latest term
          const currentActive = data.find(
            (t) => todayStr >= t.startDate && todayStr <= t.endDate
          );
          const defaultTerm = currentActive || data[0];
          setSelectedTermId(defaultTerm.id);
          fetchMealsByDateRange(defaultTerm.startDate, defaultTerm.endDate);
        } else {
          // Fallback to current month if no manager terms exist
          setSelectedTermId('MONTH_VIEW');
          fetchMealsByMonth(month);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const fetchMealsByDateRange = (startDate: string, endDate: string) => {
    fetch(`/api/meals?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMeals(data);
      });
  };

  const fetchMealsByMonth = (m: string) => {
    fetch(`/api/meals?month=${m}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMeals(data);
      });
  };

  const handleTermChange = (termId: string) => {
    setSelectedTermId(termId);
    if (termId === 'MONTH_VIEW') {
      fetchMealsByMonth(month);
    } else {
      const term = managerTerms.find((t) => t.id === termId);
      if (term) {
        fetchMealsByDateRange(term.startDate, term.endDate);
      }
    }
  };

  const handleMonthChange = (m: string) => {
    setMonth(m);
    if (selectedTermId === 'MONTH_VIEW') {
      fetchMealsByMonth(m);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isNonAdminManager = user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN';
  const userTerms = (user?.managerTerms || []) as any[];

  const isDateWithinUserTerm = (targetDate: string) => {
    if (!user) return false;
    if (!isNonAdminManager) return true;
    if (userTerms.length > 0) {
      return userTerms.some(
        (term: any) => targetDate >= term.startDate && targetDate <= term.endDate
      );
    }
    return false;
  };

  const isAdminOrManager = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Determine active term & date array
  const activeTerm = managerTerms.find((t) => t.id === selectedTermId);

  // Generate date list depending on mode
  interface GridDateItem {
    fullDate: string; // YYYY-MM-DD
    dayNum: string; // '01', '15'
    displayLabel: string; // '০১ সেপ্ট' or '০১'
    weekday: string; // 'শনি', 'রবি'
    isToday: boolean;
    isFuture: boolean;
  }

  const weekDayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const monthNamesBn = [
    'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
  ];

  let gridDates: GridDateItem[] = [];

  if (activeTerm) {
    // Generate dates between activeTerm.startDate and activeTerm.endDate
    const start = new Date(activeTerm.startDate + 'T00:00:00');
    const end = new Date(activeTerm.endDate + 'T00:00:00');

    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const mNum = cur.getMonth();
      const dNum = cur.getDate();
      const mStr = String(mNum + 1).padStart(2, '0');
      const dStr = String(dNum).padStart(2, '0');
      const fullDate = `${y}-${mStr}-${dStr}`;

      const weekday = weekDayNamesBn[cur.getDay()];
      const displayLabel = `${dNum} ${monthNamesBn[mNum]}`;

      gridDates.push({
        fullDate,
        dayNum: dStr,
        displayLabel,
        weekday,
        isToday: fullDate === todayStr,
        isFuture: fullDate > todayStr,
      });

      cur.setDate(cur.getDate() + 1);
    }
  } else {
    // Month view fallback
    const [yearStr, monthStr] = month.split('-');
    const yNum = Number(yearStr);
    const mNum = Number(monthStr) - 1;
    const totalDaysInMonth = new Date(yNum, mNum + 1, 0).getDate();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dStr = String(day).padStart(2, '0');
      const mStr = String(mNum + 1).padStart(2, '0');
      const fullDate = `${yNum}-${mStr}-${dStr}`;
      const curDate = new Date(yNum, mNum, day);
      const weekday = weekDayNamesBn[curDate.getDay()];
      const displayLabel = `${day}`;

      gridDates.push({
        fullDate,
        dayNum: dStr,
        displayLabel,
        weekday,
        isToday: fullDate === todayStr,
        isFuture: fullDate > todayStr,
      });
    }
  }

  // Cell click handler
  const handleOpenCellModal = (member: any, targetDate: string) => {
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

    if (isNonAdminManager && !isDateWithinUserTerm(selectedCell.date)) {
      setMessage({
        type: 'error',
        text: 'এই তারিখটি আপনার নির্বাচিত ম্যানেজার মেয়াদের বাইরে। আপনি শুধুমাত্র আপনার মেয়াদের তারিখে মিল পরিবর্তন করতে পারবেন।',
      });
      return;
    }

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

      setMessage({ type: 'success', text: `মিল এন্ট্রি (${selectedCell.date}) সফলভাবে সংরক্ষিত হয়েছে!` });
      setSelectedCell(null);

      if (activeTerm) {
        fetchMealsByDateRange(activeTerm.startDate, activeTerm.endDate);
      } else {
        fetchMealsByMonth(month);
      }
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

  const isCellEditable = Boolean(
    isAdminOrManager &&
    (!isNonAdminManager || (selectedCell && isDateWithinUserTerm(selectedCell.date)))
  );

  return (
    <>
      <PageShell user={user} onLogout={handleLogout} title="ম্যানেজার-ভিত্তিক দৈনিক মিল চার্ট">
        {/* Header Controls: Manager-Centric Selector */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <span>দৈনিক মিল চার্ট (ম্যানেজার অনুযায়ী)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              নির্বাচিত ম্যানেজারের দায়িত্বের মেয়াদে প্রতিটি মেম্বারের মিল এন্ট্রি ও মোট হিসাব
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Primary Manager Selector */}
            <div className="flex-1 sm:flex-initial">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                ম্যানেজার ও দায়িত্বের মেয়াদ:
              </label>
              <div className="relative">
                <select
                  value={selectedTermId}
                  onChange={(e) => handleTermChange(e.target.value)}
                  className="w-full bg-sky-50 dark:bg-slate-800 border-2 border-sky-300 dark:border-sky-600/50 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm pr-8"
                >
                  {managerTerms.length === 0 ? (
                    <option value="MONTH_VIEW">কোনো ম্যানেজার টার্ম নেই (ক্যালেন্ডার মাস ভিউ)</option>
                  ) : (
                    managerTerms.map((t) => {
                      const isCurrent = todayStr >= t.startDate && todayStr <= t.endDate;
                      const managerName = t.user?.name || t.title || 'ম্যানেজার';
                      return (
                        <option key={t.id} value={t.id}>
                          👤 {managerName} ({t.startDate} ➔ {t.endDate}) {isCurrent ? '⚡ [চলমান]' : ''}
                        </option>
                      );
                    })
                  )}
                  {managerTerms.length > 0 && (
                    <option value="MONTH_VIEW">📅 ক্যালেন্ডার মাস অনুযায়ী দেখুন</option>
                  )}
                </select>
              </div>
            </div>

            {/* Calendar Month Selector (Shown only when in month view) */}
            {selectedTermId === 'MONTH_VIEW' && (
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  মাস নির্বাচন:
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Manager Term Info Banner Card */}
        {activeTerm ? (
          <div className="bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-emerald-500/10 dark:from-sky-950/40 dark:via-purple-950/30 dark:to-emerald-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-sky-600/30 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {activeTerm.user?.name || activeTerm.title || 'ম্যানেজার'}
                  </span>
                  {todayStr >= activeTerm.startDate && todayStr <= activeTerm.endDate ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-sm">
                      চলমান দায়িত্ব (Active)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      মেয়াদ সমাপ্ত
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>মেয়াদকাল: <strong>{activeTerm.startDate}</strong> থেকে <strong>{activeTerm.endDate}</strong> (মোট {gridDates.length} দিন)</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>ম্যানেজার মিল ছাড়: <strong>{activeTerm.mealDeductionType === 'ALL' ? 'সকল মিল ফ্রি' : activeTerm.mealDeductionType === 'FIXED' ? `${activeTerm.mealDeductionAmount} টি মিল ফ্রি` : 'ছাড় নেই'}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                সেটিং পয়েন্ট: সকাল ({bw}) | দুপুর ({lw}) | রাত ({dw})
              </span>
            </div>
          </div>
        ) : (
          managerTerms.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  বর্তমানে মেসে কোনো নির্বাচিত <strong>ম্যানেজার মেয়াদ (Manager Term)</strong> তৈরি করা নেই। মেম্বার পেজ বা সেটিংস থেকে ম্যানেজার মেয়াদ যোগ করলে এখানে ম্যানেজার অনুযায়ী মিল চার্ট প্রদর্শিত হবে।
                </span>
              </div>
              {isAdminOrManager && (
                <Link
                  href="/members"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ম্যানেজার নির্বাচন করুন</span>
                </Link>
              )}
            </div>
          )
        )}

        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Excel Sheet Matrix Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 overflow-hidden space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>আজকের তারিখ ({todayStr}) পর্যন্ত মিল মোট হিসেবে যুক্ত হবে। ভবিষ্যৎ তারিখসমূহ নির্ধারিত হিসেবে থাকবে।</span>
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
                  <th className="px-2 py-3 text-center border-r border-b border-slate-200 dark:border-slate-700 w-10 sticky left-0 bg-slate-100 dark:bg-slate-800 z-20">
                    #
                  </th>
                  <th className="px-3 py-3 text-left border-r border-b border-slate-200 dark:border-slate-700 min-w-[140px] sticky left-10 bg-slate-100 dark:bg-slate-800 z-10">
                    মেম্বার নাম
                  </th>
                  {gridDates.map((item) => (
                    <th
                      key={item.fullDate}
                      className={`px-2 py-2 border-r border-b border-slate-200 dark:border-slate-700 min-w-[44px] ${
                        item.isToday
                          ? 'bg-sky-500 text-white dark:bg-sky-600'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      <span className="block text-[11px] font-extrabold">{item.displayLabel}</span>
                      <span className={`block text-[9px] font-medium uppercase ${item.isToday ? 'text-sky-100' : 'text-slate-400'}`}>
                        {item.weekday}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3 border-b border-slate-200 dark:border-slate-700 min-w-[110px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-extrabold">
                    মোট মিল (আজ পর্যন্ত)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {gridDates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      নির্বাচিত মেয়াদে কোনো তারিখ পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  (isAdminOrManager ? members : members.filter((m) => m.id === user?.id)).map((member, index) => {
                    const userMeals = meals.filter((m) => m.userId === member.id);

                    // Count total ONLY for meals up to today within the visible dates
                    const memberTotalMeals = userMeals
                      .filter((m) => m.date <= todayStr && gridDates.some((d) => d.fullDate === m.date))
                      .reduce((sum, m) => sum + m.total, 0);

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        {/* Serial Number */}
                        <td className="px-2 py-2 text-center font-semibold text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-20 shadow-sm text-xs">
                          {index + 1}
                        </td>

                        {/* Member Name */}
                        <td className="px-3 py-2 text-left font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 sticky left-10 bg-white dark:bg-slate-900 z-10 shadow-sm truncate">
                          {member.name}
                        </td>

                        {/* Days Grid Cells */}
                        {gridDates.map((item) => {
                          const mealEntry = userMeals.find((m) => m.date === item.fullDate);

                          const hasEntry = Boolean(mealEntry);
                          const totalVal = mealEntry ? mealEntry.total : 0;

                          return (
                            <td
                              key={item.fullDate}
                              onClick={() => handleOpenCellModal(member, item.fullDate)}
                              className={`px-1 py-2 border-r border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/60 ${
                                item.isToday
                                  ? 'bg-sky-500/10 dark:bg-sky-500/20 font-bold ring-1 ring-sky-400/50'
                                  : item.isFuture
                                  ? 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 italic'
                                  : hasEntry && totalVal > 0
                                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold'
                                  : 'text-slate-400 dark:text-slate-600'
                              }`}
                              title={
                                item.isFuture
                                  ? `${member.name} - ${item.fullDate} (ভবিষ্যৎ তারিখ - এখনও কাউন্ট হয়নি)`
                                  : `${member.name} - ${item.fullDate} (${totalVal} মিল)`
                              }
                            >
                              {hasEntry ? (item.isFuture ? `(${totalVal})` : totalVal) : '-'}
                            </td>
                          );
                        })}

                        {/* Total Meals Column */}
                        <td className="px-3 py-2 font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50/50 dark:bg-sky-950/20 text-sm">
                          {memberTotalMeals}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageShell>

      {/* Excel Sheet Per-Meal Time Config Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>{isAdminOrManager ? 'বেলাভিত্তিক মিল সেটিংস & ইনপুট' : 'দৈনিক মিলের বিস্তারিত স্ট্যাটাস'}</span>
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

            {!isCellEditable ? (
              /* Read-Only View */
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {isNonAdminManager
                      ? `এই তারিখটি (${selectedCell.date}) আপনার নির্বাচিত দায়িত্বের মেয়াদের বাইরে। আপনি শুধুমাত্র আপনার মেয়াদের তারিখে মিল পরিবর্তন করতে পারবেন।`
                      : 'আপনি সাধারণ মেম্বার হিসেবে দেখছেন (Read-Only View)। মিল এডিটের জন্য মেস এডমিন বা ম্যানেজারের সাথে যোগাযোগ করুন।'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-1">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase">সকালের নাস্তা</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {(breakfastMode === 'OFF' || breakfastMode === 'OFF_ONCE') ? 'বন্ধ (০)' : `${bVal} টি মিল (${bVal * bw} পয়েন্ট)`}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium block">মোড: {breakfastMode === 'DAILY' ? 'প্রতিদিন' : breakfastMode === 'ONCE' ? 'একদিন' : 'বন্ধ'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">দুপুরের খাবার</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {(lunchMode === 'OFF' || lunchMode === 'OFF_ONCE') ? 'বন্ধ (০)' : `${lVal} টি মিল (${lVal * lw} পয়েন্ট)`}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium block">মোড: {lunchMode === 'DAILY' ? 'প্রতিদিন' : lunchMode === 'ONCE' ? 'একদিন' : 'বন্ধ'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-1">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">রাতের খাবার</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {(dinnerMode === 'OFF' || dinnerMode === 'OFF_ONCE') ? 'বন্ধ (০)' : `${dVal} টি মিল (${dVal * dw} পয়েন্ট)`}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium block">মোড: {dinnerMode === 'DAILY' ? 'প্রতিদিন' : dinnerMode === 'ONCE' ? 'একদিন' : 'বন্ধ'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">মোট গণনাকৃত পয়েন্ট:</span>
                  <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">{modalCalculatedTotal} টি মিল</span>
                </div>

                {note && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">বিশেষ নোট:</span>
                    <p className="text-slate-600 dark:text-slate-400 italic">{note}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCell(null)}
                    className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold rounded-xl text-xs transition-all"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
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
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
