'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import {
  FileSpreadsheet,
  Mail,
  Printer,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Receipt,
  UserCheck,
  Calendar,
  Shield,
  Download,
  Filter,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Meal Chart & Data States
  const [members, setMembers] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [managerTerms, setManagerTerms] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Selected Manager Term State
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  // Selective Printing State
  const [activePrintSection, setActivePrintSection] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          if (data.user.email) setRecipientEmail(data.user.email);
          fetchInitialData();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchInitialData = async () => {
    try {
      const [membersData, settingsData, termsData] = await Promise.all([
        fetch('/api/members').then((res) => res.json()),
        fetch('/api/settings').then((res) => res.json()),
        fetch('/api/manager-terms').then((res) => res.json()),
      ]);

      if (Array.isArray(membersData)) setMembers(membersData);
      if (settingsData && !settingsData.error) setSettings(settingsData);

      if (Array.isArray(termsData)) {
        setManagerTerms(termsData);
        if (termsData.length > 0) {
          // Find currently active term or default to first term
          const currentActive = termsData.find(
            (t) => todayStr >= t.startDate && todayStr <= t.endDate
          );
          const defaultTerm = currentActive || termsData[0];
          setSelectedTermId(defaultTerm.id);
          loadReportsForTerm(defaultTerm);
        } else {
          setSelectedTermId('MONTH_VIEW');
          loadReportsForMonth(month);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadReportsForTerm = (term: any) => {
    Promise.all([
      fetch(`/api/summary?termId=${term.id}`).then((res) => res.json()),
      fetch(`/api/meals?startDate=${term.startDate}&endDate=${term.endDate}`).then((res) => res.json()),
      fetch(`/api/payments?startDate=${term.startDate}&endDate=${term.endDate}`).then((res) => res.json()),
      fetch(`/api/expenses?startDate=${term.startDate}&endDate=${term.endDate}`).then((res) => res.json()),
    ]).then(([summaryData, mealsData, paymentsData, expensesData]) => {
      if (summaryData && !summaryData.error) setSummary(summaryData);
      if (Array.isArray(mealsData)) setMeals(mealsData);
      if (Array.isArray(paymentsData)) setPayments(paymentsData);
      if (Array.isArray(expensesData)) setExpenses(expensesData);
    });
  };

  const loadReportsForMonth = (m: string) => {
    Promise.all([
      fetch(`/api/summary?month=${m}`).then((res) => res.json()),
      fetch(`/api/meals?month=${m}`).then((res) => res.json()),
      fetch(`/api/payments?month=${m}`).then((res) => res.json()),
      fetch(`/api/expenses?month=${m}`).then((res) => res.json()),
    ]).then(([summaryData, mealsData, paymentsData, expensesData]) => {
      if (summaryData && !summaryData.error) setSummary(summaryData);
      if (Array.isArray(mealsData)) setMeals(mealsData);
      if (Array.isArray(paymentsData)) setPayments(paymentsData);
      if (Array.isArray(expensesData)) setExpenses(expensesData);
    });
  };

  const handleTermChange = (termId: string) => {
    setSelectedTermId(termId);
    if (termId === 'MONTH_VIEW') {
      loadReportsForMonth(month);
    } else {
      const term = managerTerms.find((t) => t.id === termId);
      if (term) {
        loadReportsForTerm(term);
      }
    }
  };

  const handleMonthChange = (m: string) => {
    setMonth(m);
    if (selectedTermId === 'MONTH_VIEW') {
      loadReportsForMonth(m);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleDownloadExcel = () => {
    if (activeTerm) {
      window.open(`/api/reports/export?termId=${activeTerm.id}`, '_blank');
    } else {
      window.open(`/api/reports/export?month=${month}`, '_blank');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSendingEmail(true);

    try {
      const res = await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, month, termId: selectedTermId !== 'MONTH_VIEW' ? selectedTermId : undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      setMessage({ type: 'success', text: `রিপোর্ট সফলভাবে ইমেইলে (${recipientEmail}) পাঠানো হয়েছে!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrintSection = (sectionId: string) => {
    setActivePrintSection(sectionId);
    setTimeout(() => {
      window.print();
      setActivePrintSection(null);
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        লোড হচ্ছে...
      </div>
    );
  }

  // Active term object
  const activeTerm = managerTerms.find((t) => t.id === selectedTermId);
  const activeManagerName = activeTerm?.user?.name || activeTerm?.title || 'ম্যানেজার';

  // Build grid dates array
  interface ReportGridDate {
    fullDate: string;
    dayNum: string;
    displayLabel: string;
    monthName: string;
  }

  const monthNamesBn = [
    'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
  ];

  let gridDates: ReportGridDate[] = [];

  if (activeTerm) {
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

      gridDates.push({
        fullDate,
        dayNum: dStr,
        displayLabel: `${dNum}`,
        monthName: monthNamesBn[mNum],
      });

      cur.setDate(cur.getDate() + 1);
    }
  } else {
    const [yearStr, monthStr] = month.split('-');
    const yNum = Number(yearStr);
    const mNum = Number(monthStr) - 1;
    const totalDays = new Date(yNum, mNum + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const dStr = String(day).padStart(2, '0');
      const mStr = String(mNum + 1).padStart(2, '0');
      const fullDate = `${yNum}-${mStr}-${dStr}`;

      gridDates.push({
        fullDate,
        dayNum: dStr,
        displayLabel: `${day}`,
        monthName: monthNamesBn[mNum],
      });
    }
  }

  const mealMap: Record<string, any> = {};
  meals.forEach((m) => {
    mealMap[`${m.userId}_${m.date}`] = m;
  });

  const bw = settings?.breakfastWeight ?? 1.0;
  const lw = settings?.lunchWeight ?? 1.0;
  const dw = settings?.dinnerWeight ?? 1.0;

  const isAdminOrManager = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const displayMembers = isAdminOrManager
    ? members
    : members.filter((m) => m.id === user?.id);

  const displayMemberSummaries = isAdminOrManager
    ? summary?.memberSummaries
    : summary?.memberSummaries?.filter((m: any) => m.userId === user?.id);

  // Total Payment & Expense calculations for reports
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Expense Category breakdown
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || 'অন্যান্য';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
  });

  // Descriptive subtitle for reports
  const reportSubtitle = activeTerm
    ? `ম্যানেজার: ${activeManagerName} | মেয়াদ: ${activeTerm.startDate} থেকে ${activeTerm.endDate} (মোট ${gridDates.length} দিন)`
    : `ক্যালেন্ডার মাস: ${month}`;

  return (
    <PageShell user={user} onLogout={handleLogout} title="ম্যানেজার-ভিত্তিক পূর্ণাঙ্গ রিপোর্ট">
      {/* Header Controls: Primary Manager Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>মেস রিপোর্ট ও হিসাব নিকাশ</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ম্যানেজার ও তাদের দায়িত্বের মেয়াদ অনুযায়ী ফিল্টারকৃত মিল চার্ট, মেম্বার হিসাব, পেমেন্ট ও খরচের পূর্ণাঙ্গ রিপোর্ট
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Manager Term Selector */}
          <div className="flex-1 sm:flex-initial">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              ম্যানেজার নির্বাচন:
            </label>
            <select
              value={selectedTermId}
              onChange={(e) => handleTermChange(e.target.value)}
              className="w-full bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm pr-8"
            >
              {managerTerms.length === 0 ? (
                <option value="MONTH_VIEW">কোনো ম্যানেজার টার্ম নেই (ক্যালেন্ডার মাস ভিউ)</option>
              ) : (
                managerTerms.map((t) => {
                  const isCurrent = todayStr >= t.startDate && todayStr <= t.endDate;
                  const name = t.user?.name || t.title || 'ম্যানেজার';
                  return (
                    <option key={t.id} value={t.id}>
                      👤 {name} ({t.startDate} ➔ {t.endDate}) {isCurrent ? '⚡ [চলমান]' : ''}
                    </option>
                  );
                })
              )}
              {managerTerms.length > 0 && (
                <option value="MONTH_VIEW">📅 ক্যালেন্ডার মাস অনুযায়ী দেখুন</option>
              )}
            </select>
          </div>

          {/* Month input (only when month view is active) */}
          {selectedTermId === 'MONTH_VIEW' && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                মাস:
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>
          )}

          {/* Excel Export Button */}
          <button
            onClick={handleDownloadExcel}
            className="self-end px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            title="এক্সেল শিট ডাউনলোড করুন"
          >
            <Download className="w-4 h-4" />
            <span>এক্সেল এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Active Manager Term Information Banner */}
      {activeTerm ? (
        <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-purple-500/10 dark:from-emerald-950/40 dark:via-sky-950/30 dark:to-purple-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  রিপোর্ট প্রদর্শন: {activeManagerName}
                </span>
                {todayStr >= activeTerm.startDate && todayStr <= activeTerm.endDate ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-sm">
                    চলমান দায়িত্ব
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    মেয়াদ সমাপ্ত
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
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
            <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
              মিল রেট: ৳{summary?.mealRate || 0}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-emerald-600 font-bold">
              মোট জমা: ৳{totalPaymentsAmount.toLocaleString('bn-BD')}
            </span>
          </div>
        </div>
      ) : (
        managerTerms.length === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300 no-print">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                বর্তমানে মেসে কোনো <strong>ম্যানেজার মেয়াদ (Manager Term)</strong> তৈরি করা নেই। মেম্বার পেজ বা সেটিংস থেকে ম্যানেজার নির্বাচন করলে সকল রিপোর্ট ম্যানেজার অনুযায়ী প্রস্তুত হবে।
              </span>
            </div>
            {isAdminOrManager && (
              <Link
                href="/members"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ম্যানেজার তৈরি করুন</span>
              </Link>
            )}
          </div>
        )
      )}

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 no-print ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Printable Reports Container */}
      <div className="print-container space-y-6">
        {/* 1. Live Daily Meal Chart Matrix Table */}
        <div
          className={`print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 ${
            activePrintSection && activePrintSection !== 'meal-chart' ? 'no-print' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-600 no-print" />
                <span>দৈনিক বেলাভিত্তিক মেস মিল চার্ট রিপোর্ট</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{reportSubtitle}</p>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => handlePrintSection('meal-chart')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>চার্ট প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-2 text-left sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 min-w-[130px]">
                    সদস্যের নাম
                  </th>
                  {gridDates.map((item) => (
                    <th key={item.fullDate} colSpan={3} className="px-1.5 py-1.5 border-r border-slate-200 dark:border-slate-700 min-w-[54px]">
                      <span className="block font-bold text-[11px]">{item.displayLabel}</span>
                      <span className="block text-[9px] font-normal text-slate-400">{item.monthName}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2 sticky right-0 bg-slate-100 dark:bg-slate-800 z-10 border-l border-slate-200 dark:border-slate-700 min-w-[70px]">
                    মোট মিল
                  </th>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-1.5 text-left sticky left-0 bg-slate-50 dark:bg-slate-800/90 z-10 border-r border-slate-200 dark:border-slate-700">
                    বেলা ➔
                  </th>
                  {gridDates.map((item) => (
                    <Fragment key={item.fullDate}>
                      <th className="px-1 py-1 bg-sky-50/50 dark:bg-sky-950/20 text-sky-600">স</th>
                      <th className="px-1 py-1 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600">দু</th>
                      <th className="px-1 py-1 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 border-r border-slate-200 dark:border-slate-700">রা</th>
                    </Fragment>
                  ))}
                  <th className="px-3 py-1.5 sticky right-0 bg-slate-50 dark:bg-slate-800/90 z-10 border-l border-slate-200 dark:border-slate-700">
                    মোট
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayMembers.map((m) => {
                  let memberTotalMeals = 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 truncate">
                        {m.name}
                      </td>
                      {gridDates.map((item) => {
                        const entry = mealMap[`${m.id}_${item.fullDate}`];

                        const b = entry ? entry.breakfast : 0;
                        const l = entry ? entry.lunch : 0;
                        const d = entry ? entry.dinner : 0;

                        const bVal = b * bw;
                        const lVal = l * lw;
                        const dVal = d * dw;

                        const dayTotal = bVal + lVal + dVal;
                        memberTotalMeals += dayTotal;

                        return (
                          <Fragment key={item.fullDate}>
                            <td className="px-1 py-2 font-medium text-slate-600 dark:text-slate-400">
                              {bVal > 0 ? bVal : '-'}
                            </td>
                            <td className="px-1 py-2 font-medium text-slate-600 dark:text-slate-400">
                              {lVal > 0 ? lVal : '-'}
                            </td>
                            <td className="px-1 py-2 font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                              {dVal > 0 ? dVal : '-'}
                            </td>
                          </Fragment>
                        );
                      })}
                      <td className="px-3 py-2 font-extrabold text-sky-600 dark:text-sky-400 sticky right-0 bg-white dark:bg-slate-900 z-10 border-l border-slate-200 dark:border-slate-800">
                        {Number(memberTotalMeals.toFixed(2))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Member Detailed Summary Breakdown Table */}
        <div
          className={`print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 ${
            activePrintSection && activePrintSection !== 'member-summary' ? 'no-print' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">মেম্বার ভিত্তিক বিস্তারিত হিসাব তালিকা</h3>
              <p className="text-xs text-slate-500 mt-0.5">{reportSubtitle}</p>
            </div>
            <button
              onClick={() => handlePrintSection('member-summary')}
              className="no-print px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>হিসাব প্রিন্ট করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">মেম্বার নাম</th>
                  <th className="px-4 py-3">ফোন</th>
                  <th className="px-4 py-3">সকাল</th>
                  <th className="px-4 py-3">দুপুর</th>
                  <th className="px-4 py-3">রাত</th>
                  <th className="px-4 py-3 font-semibold">মোট মিল</th>
                  <th className="px-4 py-3">বিলযোগ্য মিল</th>
                  <th className="px-4 py-3">মিল খরচ (৳)</th>
                  <th className="px-4 py-3">খালা বিল (৳)</th>
                  <th className="px-4 py-3">মোট জমা (৳)</th>
                  <th className="px-4 py-3 font-bold">ব্যালেন্স (৳)</th>
                  <th className="px-4 py-3 rounded-r-lg">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayMemberSummaries?.map((m: any) => (
                  <tr key={m.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{m.phone}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.breakfast}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.lunch}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.dinner}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{m.totalMeals}</td>
                    <td className="px-4 py-3">
                      {m.billableMeals !== undefined && m.billableMeals !== m.totalMeals ? (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {m.billableMeals}
                          <span className="text-[10px] ml-1 text-slate-400">({m.totalMeals - m.billableMeals} মাইনাস)</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{m.billableMeals ?? m.totalMeals}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">৳{m.mealCost}</td>
                    <td className="px-4 py-3 text-sky-600 dark:text-sky-400">৳{m.cookBill || 0}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">৳{m.paid}</td>
                    <td className={`px-4 py-3 font-extrabold ${m.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ৳{m.balance}
                    </td>
                    <td className="px-4 py-3">
                      {m.status === 'Receivable' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          পাওনা
                        </span>
                      )}
                      {m.status === 'Payable' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          দেনা
                        </span>
                      )}
                      {m.status === 'Settled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          পরিশোধিত
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Manager Meal Deduction Notice */}
          {summary?.managerMealDeduction > 0 && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <span className="font-bold">⚠ ম্যানেজার মিল মাইনাস:</span>
              <span>এই টার্মে ম্যানেজারের <strong>{summary.managerMealDeduction}</strong> মিল মোট মিল থেকে বাদ দিয়ে মিলরেট ও ম্যানেজারের বিল হিসাব করা হয়েছে। মিলের রেকর্ড অপরিবর্তিত।</span>
            </div>
          )}
        </div>

        {/* 3. Member-wise Payment Report Section */}
        <div
          className={`print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 ${
            activePrintSection && activePrintSection !== 'payment-report' ? 'no-print' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600 no-print" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মেম্বার-ওয়াইজ পেমেন্ট ও জমা রিপোর্ট</h3>
                <p className="text-xs text-slate-500 mt-0.5">{reportSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                টার্মে সংগৃহীত মোট জমা: ৳{totalPaymentsAmount.toLocaleString('bn-BD')}
              </span>
              <button
                onClick={() => handlePrintSection('payment-report')}
                className="no-print px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>পেমেন্ট প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">মেম্বার নাম</th>
                  <th className="px-4 py-3">ফোন</th>
                  <th className="px-4 py-3">জমার তারিখ ও বিস্তারিত টাকা</th>
                  <th className="px-4 py-3">লেনদেন সংখ্যা</th>
                  <th className="px-4 py-3 rounded-r-lg font-bold">মোট জমা (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayMembers.map((m) => {
                  const userPayments = payments.filter((p) => p.userId === m.id);
                  const userTotal = userPayments.reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{m.phone}</td>
                      <td className="px-4 py-3 text-xs">
                        {userPayments.length === 0 ? (
                          <span className="text-slate-400 italic">এই মেয়াদে কোনো জমা নেই</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {userPayments.map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                <span>{p.date}:</span>
                                <strong className="text-emerald-600 dark:text-emerald-400">৳{p.amount.toLocaleString('bn-BD')}</strong>
                                {p.note && <span className="text-slate-400">({p.note})</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                        {userPayments.length} টি
                      </td>
                      <td className="px-4 py-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        ৳{userTotal.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Mess Expense Report Section */}
        <div
          className={`print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4 ${
            activePrintSection && activePrintSection !== 'expense-report' ? 'no-print' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-600 no-print" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মেস বাজার ও খরচ সংক্রান্ত রিপোর্ট</h3>
                <p className="text-xs text-slate-500 mt-0.5">{reportSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800">
                টার্মে মোট মেস খরচ: ৳{totalExpensesAmount.toLocaleString('bn-BD')}
              </span>
              <button
                onClick={() => handlePrintSection('expense-report')}
                className="no-print px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>খরচ প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Category Breakdown Table */}
          {Object.keys(expensesByCategory).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">ক্যাটাগরিভিত্তিক খরচের সামারি</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(expensesByCategory).map(([cat, amt]) => (
                  <div key={cat} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 block font-medium">{cat}</span>
                    <strong className="text-slate-900 dark:text-white text-sm">৳{amt.toLocaleString('bn-BD')}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">তারিখ</th>
                  <th className="px-4 py-3">ক্যাটাগরি</th>
                  <th className="px-4 py-3">বিবরণ / আইটেম</th>
                  <th className="px-4 py-3 font-semibold">পরিমাণ (৳)</th>
                  <th className="px-4 py-3 rounded-r-lg">এন্ট্রি দাতা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
                      এই মেয়াদে কোনো খরচের এন্ট্রি পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white text-xs">{e.date}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{e.category}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{e.description || '-'}</td>
                      <td className="px-4 py-3 font-extrabold text-sky-600 dark:text-sky-400">
                        ৳{e.amount.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{e.addedBy?.name || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
