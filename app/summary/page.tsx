'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { PieChart, ArrowUpRight, ArrowDownRight, CheckCircle2, Printer, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

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
    setDataLoading(true);
    fetch(`/api/summary?month=${m}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSummary(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setDataLoading(false));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatMonthNameBn = (mStr: string) => {
    try {
      const [y, m] = mStr.split('-');
      const monthNamesBn = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const mIdx = parseInt(m, 10) - 1;
      return `${monthNamesBn[mIdx] || mStr} ${y}`;
    } catch {
      return mStr;
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
  const displayMemberSummaries = isAdminOrManager
    ? summary?.memberSummaries
    : summary?.memberSummaries?.filter((m: any) => m.userId === user?.id);

  // Column sums for table footer
  const totalMealsSum = displayMemberSummaries?.reduce((acc: number, m: any) => acc + (m.totalMeals || 0), 0) || 0;
  const totalMealCostSum = displayMemberSummaries?.reduce((acc: number, m: any) => acc + (m.mealCost || 0), 0) || 0;
  const totalCookBillSum = displayMemberSummaries?.reduce((acc: number, m: any) => acc + (m.cookBill || 0), 0) || 0;
  const totalPaidSum = displayMemberSummaries?.reduce((acc: number, m: any) => acc + (m.paid || 0), 0) || 0;
  const totalBalanceSum = displayMemberSummaries?.reduce((acc: number, m: any) => acc + (m.balance || 0), 0) || 0;

  const availableBalance = (summary?.totalPayments || 0) - (summary?.totalExpenses || 0);

  return (
    <PageShell user={user} onLogout={handleLogout} title="মাসিক সামগ্রিক প্রতিবেদন">
      {/* Interactive Controls Bar (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>মাসিক সামগ্রিক প্রতিবেদন ({formatMonthNameBn(month)})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            সকল মিল, খরচ এবং মেম্বার ব্যালেন্সের নির্ভুল হিসাব
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
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

          <button
            onClick={() => loadSummary(month)}
            disabled={dataLoading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-sky-500' : ''}`} />
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Main Printable Container - Starts at page top when printing */}
      <div className="print-container space-y-6">
        {/* Printable Official Header Banner (Hidden on Screen, Appears on Print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                🍽️ মেস মিল ট্র্যাকার - মাসিক সামগ্রিক প্রতিবেদন ও হিসাব বিবরণী
              </h1>
              <p className="text-xs font-bold text-slate-700 mt-1">
                হিসাবের মাস: {formatMonthNameBn(month)} ({month}) | নির্ভুল চূড়ান্ত অডিট কপি
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-700">
              <p>প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>রিপোর্ট প্রস্তুতকারী: {user?.name || 'অ্যাডমিন'} ({user?.role})</p>
            </div>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 print:grid-cols-5 print:gap-2">
          <div className="bg-white dark:bg-slate-900 print:bg-slate-50 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg border border-slate-200/80 dark:border-slate-800 print:border-slate-400 shadow-sm print:shadow-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">মোট মিল</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white print:text-black mt-1">
              {summary?.totalMeals || 0} টি
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 print:bg-slate-50 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg border border-slate-200/80 dark:border-slate-800 print:border-slate-400 shadow-sm print:shadow-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">মোট মেস খরচ</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 print:text-black mt-1">
              ৳{summary?.totalExpenses?.toLocaleString('bn-BD') || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 print:bg-slate-50 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg border border-slate-200/80 dark:border-slate-800 print:border-slate-400 shadow-sm print:shadow-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">চূড়ান্ত মিল রেট</span>
            <div className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 print:text-black mt-1">
              ৳{summary?.mealRate || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 print:bg-slate-50 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg border border-slate-200/80 dark:border-slate-800 print:border-slate-400 shadow-sm print:shadow-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">মোট সংগৃহীত জমা</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 print:text-black mt-1">
              ৳{summary?.totalPayments?.toLocaleString('bn-BD') || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 print:bg-slate-50 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg border border-slate-200/80 dark:border-slate-800 print:border-slate-400 shadow-sm print:shadow-none col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">অবশিষ্ট ব্যালেন্স</span>
            <div className={`text-xl sm:text-2xl font-bold print:text-black mt-1 ${
              availableBalance >= 0
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {availableBalance < 0 ? '-' : ''}৳{Math.abs(availableBalance).toLocaleString('bn-BD')}
            </div>
          </div>
        </div>

        {/* Settlement Overview Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/30 print:border-slate-400 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 print:text-black uppercase">
                মোট পাওনা (Total Receivable)
              </span>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 print:text-black mt-1">
                ৳{summary?.totalReceivable?.toLocaleString('bn-BD') || 0}
              </div>
            </div>
            <ArrowDownRight className="w-8 h-8 text-emerald-600 dark:text-emerald-400 print:hidden" />
          </div>

          <div className="bg-rose-500/10 border border-rose-500/30 print:border-slate-400 p-4 sm:p-5 print:p-2.5 rounded-2xl print:rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 print:text-black uppercase">
                মোট দেনা (Total Payable)
              </span>
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 print:text-black mt-1">
                ৳{summary?.totalPayable?.toLocaleString('bn-BD') || 0}
              </div>
            </div>
            <ArrowUpRight className="w-8 h-8 text-rose-600 dark:text-rose-400 print:hidden" />
          </div>
        </div>

        {/* Member Summary Breakdown Table */}
        <div className="print-section bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white print:text-black">
              মেম্বার ভিত্তিক বিস্তারিত হিসাব তালিকা ({formatMonthNameBn(month)})
            </h3>
            <button
              onClick={handlePrint}
              className="no-print px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm print:text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 print:bg-slate-100 text-slate-700 dark:text-slate-300 print:text-black uppercase text-xs">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg w-10 text-center">#</th>
                  <th className="px-3 py-2.5">মেম্বার নাম</th>
                  <th className="px-3 py-2.5">ফোন</th>
                  <th className="px-2 py-2.5 text-center">সকাল</th>
                  <th className="px-2 py-2.5 text-center">দুপুর</th>
                  <th className="px-2 py-2.5 text-center">রাত</th>
                  <th className="px-3 py-2.5 font-bold text-center">মোট মিল</th>
                  <th className="px-3 py-2.5 text-right">মিল খরচ (৳)</th>
                  <th className="px-3 py-2.5 text-right">খালা বিল (৳)</th>
                  <th className="px-3 py-2.5 text-right">মোট জমা (৳)</th>
                  <th className="px-3 py-2.5 font-bold text-right">ব্যালেন্স (৳)</th>
                  <th className="px-3 py-2.5 rounded-r-lg text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataLoading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                      তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                    </td>
                  </tr>
                ) : !displayMemberSummaries || displayMemberSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                      এই মাসের জন্য কোনো মেম্বার হিসাব রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  displayMemberSummaries.map((m: any, index: number) => (
                    <tr key={m.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2.5 font-semibold text-slate-400 dark:text-slate-500 print:text-black text-xs text-center">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white print:text-black">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{m.name}</span>
                          {m.isLowBalance && (
                            <span
                              className="no-print inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800 shrink-0"
                              title={`৫০৳ মিলরেট হিসেবে অবশিষ্ট ব্যালেন্স: ৳${m.estimatedRemainingBalance} (প্রায় ${m.estimatedRemainingMeals} মিল বাকি)`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              লো ব্যালেন্স ({m.estimatedRemainingMeals} মিল)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 print:text-black text-xs">{m.phone}</td>
                      <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 print:text-black text-center">{m.breakfast}</td>
                      <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 print:text-black text-center">{m.lunch}</td>
                      <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 print:text-black text-center">{m.dinner}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white print:text-black text-center">{m.totalMeals}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 print:text-black text-right">৳{m.mealCost}</td>
                      <td className="px-3 py-2.5 text-sky-600 dark:text-sky-400 print:text-black text-right">৳{m.cookBill || 0}</td>
                      <td className="px-3 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 print:text-black text-right">৳{m.paid}</td>
                      <td className={`px-3 py-2.5 font-extrabold print:text-black text-right ${m.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.balance < 0 ? '-' : ''}৳{Math.abs(m.balance)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {m.status === 'Receivable' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 print:bg-transparent print:border print:border-black text-emerald-700 dark:text-emerald-300 print:text-black">
                            পাওনা
                          </span>
                        )}
                        {m.status === 'Payable' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 print:bg-transparent print:border print:border-black text-rose-700 dark:text-rose-300 print:text-black">
                            দেনা
                          </span>
                        )}
                        {m.status === 'Settled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 print:bg-transparent print:border print:border-black text-slate-600 dark:text-slate-400 print:text-black">
                            পরিশোধিত
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Table Footer with Column Totals */}
              {displayMemberSummaries && displayMemberSummaries.length > 0 && (
                <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t-2 border-slate-300 dark:border-slate-700 print:border-black text-slate-900 dark:text-white print:text-black text-xs">
                  <tr>
                    <td colSpan={3} className="px-3 py-2.5 text-right font-extrabold uppercase">
                      সর্বমোট (Total):
                    </td>
                    <td colSpan={3} className="px-2 py-2.5 text-center text-slate-500 print:text-black text-[11px]">
                      -
                    </td>
                    <td className="px-3 py-2.5 text-center font-black">
                      {Number(totalMealsSum.toFixed(2))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-black">
                      ৳{Number(totalMealCostSum.toFixed(2)).toLocaleString('bn-BD')}
                    </td>
                    <td className="px-3 py-2.5 text-right font-black">
                      ৳{Number(totalCookBillSum.toFixed(2)).toLocaleString('bn-BD')}
                    </td>
                    <td className="px-3 py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400 print:text-black">
                      ৳{Number(totalPaidSum.toFixed(2)).toLocaleString('bn-BD')}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-black print:text-black ${totalBalanceSum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {totalBalanceSum < 0 ? '-' : ''}৳{Math.abs(Number(totalBalanceSum.toFixed(2))).toLocaleString('bn-BD')}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[10px] text-slate-500 print:text-black">
                      {displayMemberSummaries.length} জন মেম্বার
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Print-only Signatures Section */}
        <div className="hidden print:grid grid-cols-3 gap-8 pt-12 mt-6 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-900">ম্যানেজারের স্বাক্ষর</div>
            <div className="text-[10px] text-slate-500 mt-0.5">তারিখ: ______________</div>
          </div>
          <div>
            <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-900">হিসাব নিরীক্ষক / অডিটর</div>
            <div className="text-[10px] text-slate-500 mt-0.5">তারিখ: ______________</div>
          </div>
          <div>
            <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-900">মেম্বার প্রতিনিধির স্বাক্ষর</div>
            <div className="text-[10px] text-slate-500 mt-0.5">তারিখ: ______________</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
