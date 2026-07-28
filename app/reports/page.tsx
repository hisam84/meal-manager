'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { FileSpreadsheet, Mail, Printer, CheckCircle2, AlertCircle, Wallet, Receipt } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const [selectedTermId, setSelectedTermId] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          if (data.user.email) setRecipientEmail(data.user.email);
          loadMealChartData(month);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadMealChartData = (m: string, termId?: string) => {
    const tId = termId !== undefined ? termId : selectedTermId;
    const summaryUrl = tId && tId !== 'ALL' ? `/api/summary?month=${m}&termId=${tId}` : `/api/summary?month=${m}`;

    Promise.all([
      fetch('/api/members').then((res) => res.json()),
      fetch(`/api/meals?month=${m}`).then((res) => res.json()),
      fetch('/api/settings').then((res) => res.json()),
      fetch('/api/manager-terms').then((res) => res.json()),
      fetch(summaryUrl).then((res) => res.json()),
      fetch(`/api/payments?month=${m}`).then((res) => res.json()),
      fetch(`/api/expenses?month=${m}`).then((res) => res.json()),
    ]).then(([membersData, mealsData, settingsData, termsData, summaryData, paymentsData, expensesData]) => {
      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(mealsData)) setMeals(mealsData);
      if (settingsData) setSettings(settingsData);
      if (Array.isArray(termsData)) {
        setManagerTerms(termsData);
        if (termsData.length > 0) {
          const exists = termsData.some((t) => t.id === tId);
          if (!exists || tId === 'ALL') {
            setSelectedTermId(termsData[0].id);
          }
        }
      }
      if (summaryData && !summaryData.error) setSummary(summaryData);
      if (Array.isArray(paymentsData)) setPayments(paymentsData);
      if (Array.isArray(expensesData)) setExpenses(expensesData);
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleDownloadExcel = () => {
    window.open(`/api/reports/export?month=${month}`, '_blank');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSendingEmail(true);

    try {
      const res = await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, month }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      setMessage({ type: 'success', text: `মাসিক রিপোর্ট ইমেইলে (${recipientEmail}) পাঠানো হয়েছে!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        লোড হচ্ছে...
      </div>
    );
  }

  const year = parseInt(month.split('-')[0]) || new Date().getFullYear();
  const monthIndex = parseInt(month.split('-')[1]) - 1 || new Date().getMonth();
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Active term object
  const activeTerm = managerTerms.find((t) => t.id === selectedTermId);

  // Filter daysArray: only include days that fall within selected manager term
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).filter((day) => {
    if (!activeTerm) {
      if (!managerTerms || managerTerms.length === 0) return true;
      const dayFormatted = day < 10 ? `0${day}` : `${day}`;
      const targetDate = `${month}-${dayFormatted}`;
      return managerTerms.some((term) => targetDate >= term.startDate && targetDate <= term.endDate);
    }
    const dayFormatted = day < 10 ? `0${day}` : `${day}`;
    const targetDate = `${month}-${dayFormatted}`;
    return targetDate >= activeTerm.startDate && targetDate <= activeTerm.endDate;
  });

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
    const cat = e.category || 'Other';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
  });

  return (
    <PageShell user={user} onLogout={handleLogout} title="রিপোর্ট ও ডাউনলোড কেন্দ্র">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>রিপোর্ট ও ডাউনলোড কেন্দ্র</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            মাসিক মিল, পেমেন্ট ও বাজার খরচের প্রিন্টেবল রিপোর্ট ও এক্সপোর্ট
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-2">ম্যানেজার নির্বাচন:</label>
            <select
              value={selectedTermId}
              onChange={(e) => {
                setSelectedTermId(e.target.value);
                loadMealChartData(month, e.target.value);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">সকল ম্যানেজার মেম্বারশিপ</option>
              {managerTerms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title || `${t.user?.name || 'প্রাক্তন ম্যানেজার'} (${t.startDate} ➔ ${t.endDate})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-2">মাস:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                loadMealChartData(e.target.value);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Printable Reports Container */}
      <div className="print-container space-y-6">
        {/* Live Daily Meal Chart Matrix Table */}
        <div className="print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-600 no-print" />
                <span>দৈনিক বেলাভিত্তিক মেস মিল চার্ট রিপোর্ট ({month})</span>
              </h3>
              <p className="text-xs text-slate-500">
                সদস্যদের নাম (বাম কলাম) ➔ তারিখের সকল বেলা (সকাল/দুপুর/রাত) ➔ মোট মিল (ডান কলাম)
              </p>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handlePrint}
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
                  <th className="px-3 py-2 text-left sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                    সদস্যের নাম
                  </th>
                  {daysArray.map((day) => (
                    <th key={day} colSpan={3} className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700">
                      {day}
                    </th>
                  ))}
                  <th className="px-3 py-2 sticky right-0 bg-slate-100 dark:bg-slate-800 z-10 border-l border-slate-200 dark:border-slate-700">
                    মোট মিল
                  </th>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-1.5 text-left sticky left-0 bg-slate-50 dark:bg-slate-800/90 z-10 border-r border-slate-200 dark:border-slate-700">
                    বেলা ➔
                  </th>
                  {daysArray.map((day) => (
                    <Fragment key={day}>
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
                      <td className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                        {m.name}
                      </td>
                      {daysArray.map((day) => {
                        const dayStr = day < 10 ? `0${day}` : `${day}`;
                        const dateStr = `${month}-${dayStr}`;
                        const entry = mealMap[`${m.id}_${dateStr}`];

                        const b = entry ? entry.breakfast : 0;
                        const l = entry ? entry.lunch : 0;
                        const d = entry ? entry.dinner : 0;

                        const bVal = b * bw;
                        const lVal = l * lw;
                        const dVal = d * dw;

                        const dayTotal = bVal + lVal + dVal;
                        memberTotalMeals += dayTotal;

                        return (
                          <Fragment key={day}>
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

        {/* Member Detailed Summary Breakdown Table */}
        <div className="print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">মেম্বার ভিত্তিক বিস্তারিত হিসাব তালিকা ({month})</h3>
            <button
              onClick={handlePrint}
              className="no-print px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
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

        {/* Printable Payment Report Section */}
        <div className="print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600 no-print" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মাসিক পেমেন্ট ও জমা সংক্রান্ত রিপোর্ট ({month})</h3>
                <p className="text-xs text-slate-500">মেম্বারদের নিকট থেকে সংগৃহীত জমার তালিকা ও বিস্তারিত লেনদেন</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                মোট সংগৃহীত জমা: ৳{totalPaymentsAmount.toLocaleString('bn-BD')}
              </span>
              <button
                onClick={handlePrint}
                className="no-print px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>পেমেন্ট রিপোর্ট প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">তারিখ</th>
                  <th className="px-4 py-3">মেম্বার নাম</th>
                  <th className="px-4 py-3 font-semibold">জমার পরিমাণ (৳)</th>
                  <th className="px-4 py-3">নোট / পেমেন্ট মাধ্যম</th>
                  <th className="px-4 py-3 rounded-r-lg">এন্ট্রি দাতা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
                      উক্ত মাসে কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white text-xs">{p.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.user?.name}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                        ৳{p.amount.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.note || '-'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.addedBy?.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Expense Report Section */}
        <div className="print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-600 no-print" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মাসিক মেস বাজার ও খরচ সংক্রান্ত রিপোর্ট ({month})</h3>
                <p className="text-xs text-slate-500">ক্যাটাগরিভিত্তিক বাজার খরচের সামারি ও বিস্তারিত এন্ট্রি</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800">
                মোট মেস খরচ: ৳{totalExpensesAmount.toLocaleString('bn-BD')}
              </span>
              <button
                onClick={handlePrint}
                className="no-print px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>এক্সপেন্স রিপোর্ট প্রিন্ট করুন</span>
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
                      উক্ত মাসে কোনো খরচের এন্ট্রি পাওয়া যায়নি।
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
                      <td className="px-4 py-3 text-slate-500 text-xs">{e.user?.name}</td>
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
