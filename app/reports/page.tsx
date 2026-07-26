'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { FileSpreadsheet, Mail, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Meal Chart States
  const [members, setMembers] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [managerTerms, setManagerTerms] = useState<any[]>([]);

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

  const loadMealChartData = (m: string) => {
    Promise.all([
      fetch('/api/members').then((res) => res.json()),
      fetch(`/api/meals?month=${m}`).then((res) => res.json()),
      fetch('/api/settings').then((res) => res.json()),
      fetch('/api/manager-terms').then((res) => res.json()),
    ]).then(([membersData, mealsData, settingsData, termsData]) => {
      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(mealsData)) setMeals(mealsData);
      if (settingsData) setSettings(settingsData);
      if (Array.isArray(termsData)) setManagerTerms(termsData);
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

  // Filter daysArray: only include days that fall within an elected manager term
  // If no terms exist for the month, fall back to all days in month
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).filter((day) => {
    if (!managerTerms || managerTerms.length === 0) return true;
    const dayFormatted = day < 10 ? `0${day}` : `${day}`;
    const targetDate = `${month}-${dayFormatted}`;
    return managerTerms.some((term) => targetDate >= term.startDate && targetDate <= term.endDate);
  });

  const mealMap: Record<string, any> = {};
  meals.forEach((m) => {
    mealMap[`${m.userId}_${m.date}`] = m;
  });

  const bw = settings?.breakfastWeight ?? 1.0;
  const lw = settings?.lunchWeight ?? 1.0;
  const dw = settings?.dinnerWeight ?? 1.0;

  return (
    <PageShell user={user} onLogout={handleLogout} title="রিপোর্ট ও ডাউনলোড কেন্দ্র">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>রিপোর্ট ও নোটিফিকেশন</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Excel ডাউনলোড এবং Nodemailer ইমেইল রিপোর্টিং
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">মাস নির্বাচন:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  loadMealChartData(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Meal Chart Excel Download */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মিল চার্ট Excel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  প্রতিদিনের বেলা অনুযায়ী সদস্যভিত্তিক মিল চার্ট এক্সপোর্ট করুন
                </p>
              </div>

              <button
                onClick={() => window.open(`/api/reports/export?month=${month}&type=meal-chart`, '_blank')}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>মিল চার্ট Excel ডাউনলোড</span>
              </button>
            </div>

            {/* Monthly Summary Excel Download */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">সামারি Excel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  মেম্বারদের খরচ, খালা বিল ও জমার সামারি রিপোর্ট এক্সপোর্ট
                </p>
              </div>

              <button
                onClick={handleDownloadExcel}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>সামারি Excel ডাউনলোড</span>
              </button>
            </div>

            {/* Email Dispatch via Nodemailer */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">ইমেইল নোটিফিকেশন</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nodemailer দিয়ে মাসিক সামারি রিপোর্ট ইমেইলে পাঠান
                </p>
              </div>

              {message && (
                <div
                  className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{sendingEmail ? 'পাঠানো হচ্ছে...' : 'ইমেইল পাঠান'}</span>
                </button>
              </form>
            </div>

            {/* PDF / Print */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">প্রিন্ট / PDF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ব্রাউজার দিয়ে দৈনিক মিল চার্ট বা রিপোর্ট PDF হিসেবে সেভ করুন
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট ভার্সন খুলুন</span>
              </button>
            </div>
          </div>

          {/* Live Daily Meal Chart Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                  <span>দৈনিক বেলাভিত্তিক মেস মিল চার্ট রিপোর্ট ({month})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  সদস্যদের নাম (বাম কলাম) ➔ তারিখের সকল বেলা (সকাল/দুপুর/রাত) ➔ মোট মিল (ডান কলাম)
                </p>
              </div>

              <div className="flex items-center gap-2">
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
                  {members.map((m) => {
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
    </PageShell>
  );
}
