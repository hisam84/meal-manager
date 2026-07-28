'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { Wallet, Plus, Trash2, CheckCircle2, AlertCircle, History, Coins, UserCheck, Eye, X, Filter } from 'lucide-react';

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // Form states
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // History Filter & Modal States
  const [filterUserId, setFilterUserId] = useState<string>('ALL');
  const [historyModalUser, setHistoryModalUser] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          fetchMembers();
          fetchPayments(month);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchMembers = () => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
          if (data.length > 0) setTargetUserId(data[0].id);
        }
      });
  };

  const fetchPayments = (m: string) => {
    fetch(`/api/payments?month=${m}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPayments(data);
      });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          amount,
          date,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setMessage({ type: 'success', text: 'পেমেন্ট সফলভাবে এন্ট্রি হয়েছে এবং মোট জমার সাথে যোগ করা হয়েছে!' });
      setAmount('');
      setNote('');
      fetchPayments(month);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('আপনি কি এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete payment');
      fetchPayments(month);
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
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  // Filtered members depending on user role
  const displayMembers = isAdminOrManager ? members : members.filter((m) => m.id === user?.id);

  // Current selected target member's existing payments & live combined sum
  const targetMemberPayments = payments.filter((p) => p.userId === targetUserId);
  const targetMemberPreviousTotal = targetMemberPayments.reduce((sum, p) => sum + p.amount, 0);
  const inputAmountNum = Number(amount) || 0;
  const targetMemberCombinedTotal = targetMemberPreviousTotal + inputAmountNum;

  // Filter payments for transaction table
  const filteredPayments = filterUserId === 'ALL'
    ? payments
    : payments.filter((p) => p.userId === filterUserId);

  return (
    <PageShell user={user} onLogout={handleLogout} title="পেমেন্ট ও জমা ব্যবস্থাপনা">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>পেমেন্ট ও জমা ব্যবস্থাপনা</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মেম্বারদের জমার হিসাব, নতুন জমা যোগ এবং পেমেন্ট ইতিহাস
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">মাস পরিবর্তন:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              fetchPayments(e.target.value);
            }}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold"
          />
        </div>
      </div>

      {/* Add Payment Form (Admin & Manager Only) */}
      {isAdminOrManager && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>মেম্বার পেমেন্ট এন্ট্রি দিন (নয় জমা যোগ করুন)</span>
          </h2>

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

          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মেম্বার নির্বাচন
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  নতুন জমার পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  তারিখ
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  নোট / ক্যাশ / বিকাশ
                </label>
                <input
                  type="text"
                  placeholder="উদাঃ বিকাশ / ক্যাশ জমা"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Live Balance Summary Calculation */}
            {targetUserId && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <Coins className="w-4 h-4 text-purple-600" />
                  <span>
                    সিলেক্টকৃত মেম্বারের আগের মোট জমা: <strong className="text-slate-900 dark:text-white">৳{targetMemberPreviousTotal.toLocaleString('bn-BD')}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-purple-700 dark:text-purple-300 font-bold">
                    নতুন এন্ট্রি সহ মোট জমা দাঁড়াবে: <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">৳{targetMemberCombinedTotal.toLocaleString('bn-BD')}</span>
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>{saving ? 'এন্ট্রি হচ্ছে...' : 'পেমেন্ট রেকর্ড ও মোট জমা আপডেট করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member Cumulative Balances Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>মেম্বারদের মোট ব্যালেন্স ও জমা সামারি ({month})</span>
            </h3>
            <p className="text-xs text-slate-500">প্রতিটি মেম্বারের মোট জমা টাকার হিসাব এবং পৃথক পেমেন্ট হিস্ট্রি</p>
          </div>

          <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
            সর্বমোট সংগৃহীত জমা: ৳{totalPaymentsAmount.toLocaleString('bn-BD')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayMembers.map((m) => {
            const memberPaymentsList = payments.filter((p) => p.userId === m.id);
            const memberTotalPaid = memberPaymentsList.reduce((sum, p) => sum + p.amount, 0);

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{m.phone}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    ৳{memberTotalPaid.toLocaleString('bn-BD')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>লেনদেন সংখ্যা: <strong className="text-slate-700 dark:text-slate-300">{memberPaymentsList.length} টি</strong></span>
                  <button
                    onClick={() => setHistoryModalUser(m)}
                    className="px-2.5 py-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors flex items-center gap-1 font-bold"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>ইতিহাস দেখুন</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Transactions Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">পেমেন্ট লেনদেন ইতিহাস</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>মেম্বার ফিল্টার:</span>
            </div>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1 text-xs font-semibold"
            >
              <option value="ALL">সকল মেম্বার</option>
              {displayMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">তারিখ</th>
                <th className="px-4 py-3">মেম্বার</th>
                <th className="px-4 py-3 font-semibold">জমার পরিমাণ (৳)</th>
                <th className="px-4 py-3">নোট / মাধ্যম</th>
                <th className="px-4 py-3">এন্ট্রি দাতা</th>
                {isAdminOrManager && <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    কোনো পেমেন্টের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.date}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{p.user?.name}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{p.amount.toLocaleString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.note || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.addedBy?.name}</td>
                    {isAdminOrManager && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="পেমেন্ট হিস্ট্রি মোছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Payment History Modal */}
      {historyModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <span>পেমেন্ট ইতিহাস: {historyModalUser.name}</span>
                </h3>
                <span className="text-xs text-slate-500">ফোন: {historyModalUser.phone} | মাস: {month}</span>
              </div>

              <button
                onClick={() => setHistoryModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const userTransactions = payments.filter((p) => p.userId === historyModalUser.id);
              const userSum = userTransactions.reduce((s, p) => s + p.amount, 0);

              return (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl flex items-center justify-between border border-purple-200 dark:border-purple-800/60 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">উক্ত মাসের মোট সংগৃহীত জমা:</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">৳{userSum.toLocaleString('bn-BD')}</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {userTransactions.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        উক্ত মাসে এই মেম্বারের কোনো জমা নেই।
                      </div>
                    ) : (
                      userTransactions.map((t) => (
                        <div key={t.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{t.date}</span>
                            <span className="text-slate-500">{t.note || 'নোট নেই'} (এন্ট্রি: {t.addedBy?.name})</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-emerald-600 text-sm">৳{t.amount.toLocaleString('bn-BD')}</span>
                            {isAdminOrManager && (
                              <button
                                onClick={() => handleDeletePayment(t.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setHistoryModalUser(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </PageShell>
  );
}
