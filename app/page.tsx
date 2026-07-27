'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import {
  Users,
  UtensilsCrossed,
  Receipt,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Plus,
  ChefHat,
  Phone,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else if (data.user.role === 'SUPERADMIN') {
          router.push('/superadmin');
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
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">
        মেস মিল ট্র্যাকার লোড হচ্ছে...
      </div>
    );
  }

  const isAdminOrManager = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const mySummary = summary?.memberSummaries?.find((m: any) => m.userId === user?.id);
  const displayMemberSummaries = isAdminOrManager
    ? summary?.memberSummaries
    : summary?.memberSummaries?.filter((m: any) => m.userId === user?.id);

  return (
    <PageShell user={user} onLogout={handleLogout} title="ড্যাশবোর্ড">
          {/* Top Bar Filter & Quick Welcome */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                স্বাগতম, {user?.name}! 👋
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                রোলে: <span className="font-semibold text-sky-600 dark:text-sky-400">{user?.role}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">মাস নির্বাচন:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  loadSummary(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Active Manager Card Banner */}
          {summary?.currentManager && (
            <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 dark:border-sky-500/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 font-bold shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-full">
                      দায়িত্বপ্রাপ্ত মিল ম্যানেজার
                    </span>
                    {summary.currentManager.title && (
                      <span className="text-xs text-slate-500 font-medium">({summary.currentManager.title})</span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {summary.currentManager.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোবাইল:</span>
                <a
                  href={`tel:${summary.currentManager.phone}`}
                  className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {summary.currentManager.phone}
                </a>
              </div>
            </div>
          )}

          {/* Admin / Manager KPI Grid */}
          {isAdminOrManager ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold uppercase">মোট মেম্বার</span>
                  <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summary?.totalMembers || 0} জন
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold uppercase">মোট মিল</span>
                  <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summary?.totalMeals || 0} টি
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold uppercase">মোট বাজার খরচ</span>
                  <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ৳{summary?.totalExpenses?.toLocaleString('bn-BD') || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold uppercase">মোট খালা বিল</span>
                  <ChefHat className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  ৳{summary?.totalCookBill?.toLocaleString('bn-BD') || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold uppercase">মিল রেট</span>
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ৳{summary?.mealRate || 0}
                </div>
              </div>
            </div>
          ) : (
            /* Member KPI Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">আমার মোট মিল</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {mySummary?.totalMeals || 0} টি
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">আমার মিল বিল</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ৳{mySummary?.mealCost || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">আমার খালা বিল</span>
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  ৳{mySummary?.cookBill || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">আমার জমা</span>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳{mySummary?.paid || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">আমার ব্যালেন্স</span>
                <div className={`text-2xl font-bold ${
                  (mySummary?.balance || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  ৳{mySummary?.balance || 0}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Shortcuts */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">দ্রুত অ্যাকশন</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/meals"
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-sm shadow-sky-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>মিল এন্ট্রি দিন</span>
              </Link>

              {isAdminOrManager && (
                <>
                  <Link
                    href="/expenses"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>খরচ যোগ করুন</span>
                  </Link>

                  <Link
                    href="/payments"
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-sm shadow-purple-600/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>পেমেন্ট এন্ট্রি দিন</span>
                  </Link>
                </>
              )}

              <Link
                href="/summary"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-semibold transition-all"
              >
                <span>মাসিক সামারি দেখুন</span>
              </Link>
            </div>
          </div>

          {/* Member Balance Overview Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">মেম্বার সামারি ও ব্যালেন্স</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">মিল রেট: ৳{summary?.mealRate || 0}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">মেম্বার</th>
                    <th className="px-4 py-3">সকাল</th>
                    <th className="px-4 py-3">দুপুর</th>
                    <th className="px-4 py-3">রাত</th>
                    <th className="px-4 py-3 font-semibold">মোট মিল</th>
                    <th className="px-4 py-3">মিল খরচ</th>
                    <th className="px-4 py-3">জমা (৳)</th>
                    <th className="px-4 py-3">ব্যালেন্স</th>
                    <th className="px-4 py-3 rounded-r-lg">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayMemberSummaries?.map((m: any) => (
                    <tr key={m.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {m.name}
                        {m.userId === user?.id && <span className="ml-1 text-xs text-sky-600 font-bold">(আমি)</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.breakfast}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.lunch}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.dinner}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{m.totalMeals}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">৳{m.mealCost}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">৳{m.paid}</td>
                      <td className={`px-4 py-3 font-bold ${m.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ৳{m.balance}
                      </td>
                      <td className="px-4 py-3">
                        {m.status === 'Receivable' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <ArrowDownRight className="w-3.5 h-3.5" /> পাওনা (Receivable)
                          </span>
                        )}
                        {m.status === 'Payable' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            <ArrowUpRight className="w-3.5 h-3.5" /> দেনা (Payable)
                          </span>
                        )}
                        {m.status === 'Settled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> পরিশোধিত
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
