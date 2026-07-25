'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { PieChart, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          loadSummary(month);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadSummary = (m: string) => {
    fetch(`/api/summary?month=${m}`)
      .then((res) => res.json())
      .then((data) => setSummary(data));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <PageShell user={user} onLogout={handleLogout} title="মাসিক হিসাব সামারি">
          {/* Month Filter Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span>মাসিক সামগ্রিক প্রতিবেদন ({month})</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                সকল মিল, খরচ এবং মেম্বার ব্যালেন্সের নির্ভুল হিসাব
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">মাস পরিবর্তন:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  loadSummary(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">মোট মিল</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary?.totalMeals || 0} টি
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">মোট মেস খরচ</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                ৳{summary?.totalExpenses?.toLocaleString('bn-BD') || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">চূড়ান্ত মিল রেট</span>
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                ৳{summary?.mealRate || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">মোট সংগৃহীত জমা</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ৳{summary?.totalPayments?.toLocaleString('bn-BD') || 0}
              </div>
            </div>
          </div>

          {/* Settlement Overview Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">মোট পাওনা (Total Receivable)</span>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                  ৳{summary?.totalReceivable?.toLocaleString('bn-BD') || 0}
                </div>
              </div>
              <ArrowDownRight className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase">মোট দেনা (Total Payable)</span>
                <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                  ৳{summary?.totalPayable?.toLocaleString('bn-BD') || 0}
                </div>
              </div>
              <ArrowUpRight className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
          </div>

          {/* Member Summary Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">মেম্বার ভিত্তিক বিস্তারিত হিসাব তালিকা</h3>

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
                    <th className="px-4 py-3">মিল খরচ (৳)</th>
                    <th className="px-4 py-3">বুয়ার বিল (৳)</th>
                    <th className="px-4 py-3">মোট জমা (৳)</th>
                    <th className="px-4 py-3 font-bold">ব্যালেন্স (৳)</th>
                    <th className="px-4 py-3 rounded-r-lg">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {summary?.memberSummaries?.map((m: any) => (
                    <tr key={m.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{m.phone}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.breakfast}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.lunch}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.dinner}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{m.totalMeals}</td>
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
          </div>
    </PageShell>
  );
}
