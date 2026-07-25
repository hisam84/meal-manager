'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { Wallet, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

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

      setMessage({ type: 'success', text: 'পেমেন্ট সফলভাবে এন্ট্রি হয়েছে' });
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

  return (
    <PageShell user={user} onLogout={handleLogout} title="পেমেন্ট ও জমা ব্যবস্থাপনা">
          {/* Add Payment Form (Admin & Manager Only) */}
          {isAdminOrManager && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>মেম্বার পেমেন্ট এন্ট্রি দিন</span>
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

              <form onSubmit={handleAddPayment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    মেম্বার নির্বাচন
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    জমার পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    নোট / ক্যাশ / বিকাশ
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ বিকাশ পেমেন্ট"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{saving ? 'এন্ট্রি হচ্ছে...' : 'পেমেন্ট রেকর্ড করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">পেমেন্ট ইতিহাস</h3>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                  মোট জমা: ৳{totalPaymentsAmount.toLocaleString('bn-BD')}
                </span>
              </div>

              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  fetchPayments(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-medium"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">তারিখ</th>
                    <th className="px-4 py-3">মেম্বার</th>
                    <th className="px-4 py-3 font-semibold">জমার পরিমাণ (৳)</th>
                    <th className="px-4 py-3">নোট</th>
                    <th className="px-4 py-3">এন্ট্রি দাতা</th>
                    {isAdminOrManager && <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        কোনো পেমেন্টের তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.date}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.user?.name}</td>
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
    </PageShell>
  );
}
