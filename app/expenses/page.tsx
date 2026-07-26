'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { Receipt, Plus, Trash2, CheckCircle2, AlertCircle, ChefHat, Users, Settings } from 'lucide-react';

const CATEGORIES = [
  'Grocery',
  'Rice',
  'Fish',
  'Meat',
  'Vegetable',
  'Gas',
  'Electricity',
  'Cook',
  'Rent',
  'Water',
  'Internet',
  'Other',
];

export default function ExpensesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterCategory, setFilterCategory] = useState('all');

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Cook Bill states
  const [cookBillMonth, setCookBillMonth] = useState(new Date().toISOString().slice(0, 7));
  const [perPersonCookBill, setPerPersonCookBill] = useState('');
  const [cookBillMessage, setCookBillMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingCookBill, setSavingCookBill] = useState(false);
  const [currentCookBill, setCurrentCookBill] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [customBillModalOpen, setCustomBillModalOpen] = useState(false);
  const [memberCustomBills, setMemberCustomBills] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          fetchExpenses(month, filterCategory);
          fetchMembers();
          fetchCookBill(cookBillMonth);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchExpenses = (m: string, cat: string) => {
    fetch(`/api/expenses?month=${m}&category=${cat}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setExpenses(data);
      });
  };

  const fetchMembers = () => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      });
  };

  const fetchCookBill = (m: string) => {
    fetch(`/api/cook-bills?month=${m}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const bill = data[0];
          setCurrentCookBill(bill);
          let parsed: Record<string, number> = {};
          try {
            parsed = typeof bill.memberBills === 'string' ? JSON.parse(bill.memberBills) : (bill.memberBills || {});
          } catch (e) {}
          
          const strMap: Record<string, string> = {};
          Object.keys(parsed).forEach((k) => {
            strMap[k] = parsed[k].toString();
          });
          setMemberCustomBills(strMap);

          const firstVal = Object.values(parsed)[0];
          if (firstVal !== undefined) {
            setPerPersonCookBill(firstVal.toString());
          }
        } else {
          setCurrentCookBill(null);
          setPerPersonCookBill('');
          setMemberCustomBills({});
        }
      });
  };

  const handleSaveCookBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setCookBillMessage(null);
    setSavingCookBill(true);

    try {
      const res = await fetch('/api/cook-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: cookBillMonth,
          perPersonAmount: perPersonCookBill,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save cook bill');

      setCookBillMessage({ type: 'success', text: `${cookBillMonth} মাসের খালা বিল (জনপ্রতি ৳${perPersonCookBill}) সফলভাবে সংরক্ষণ করা হয়েছে!` });
      fetchCookBill(cookBillMonth);
    } catch (err: any) {
      setCookBillMessage({ type: 'error', text: err.message });
    } finally {
      setSavingCookBill(false);
    }
  };

  const handleSaveCustomCookBills = async (e: React.FormEvent) => {
    e.preventDefault();
    setCookBillMessage(null);
    setSavingCookBill(true);

    try {
      const numMap: Record<string, number> = {};
      Object.keys(memberCustomBills).forEach((k) => {
        numMap[k] = Number(memberCustomBills[k]) || 0;
      });

      const res = await fetch('/api/cook-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: cookBillMonth,
          memberBills: numMap,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save custom cook bills');

      setCookBillMessage({ type: 'success', text: `${cookBillMonth} মাসের মেম্বার ভিত্তিক নিজস্ব খালা বিল আপডেট করা হয়েছে!` });
      setCustomBillModalOpen(false);
      fetchCookBill(cookBillMonth);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingCookBill(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          category,
          date,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add expense');

      setMessage({ type: 'success', text: 'মেস খরচ সফলভাবে যোগ করা হয়েছে' });
      setAmount('');
      setDescription('');
      fetchExpenses(month, filterCategory);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('আপনি কি এই খরচের এনট্রিটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      fetchExpenses(month, filterCategory);
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
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <PageShell user={user} onLogout={handleLogout} title="মেস খরচ ব্যবস্থাপনা">
          {/* Add Expense Form (Admin & Manager Only) */}
          {isAdminOrManager && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>নতুন খরচ এন্ট্রি করুন</span>
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

              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    খরচের পরিমাণ (৳)
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
                    ক্যাটাগরি
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
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
                    বিবরণ / নোট
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ বাজার খরচ"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'খরচ যোগ করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cook Bill Entry Form (Admin & Manager Only) */}
          {isAdminOrManager && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <span>ম্যানেজারের খালা বিল (Cook Bill) নির্ধারণ</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    জনপ্রতি খালা বিল যোগ করুন (মিলরেটে কোনো প্রভাব ফেলবে না)
                  </p>
                </div>
                {currentCookBill && (
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 self-start sm:self-auto">
                    মোট সদস্য খালা বিল: ৳{currentCookBill.totalAmount.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>

              {cookBillMessage && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                    cookBillMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {cookBillMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{cookBillMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveCookBill} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    মাস নির্বাচন
                  </label>
                  <input
                    type="month"
                    required
                    value={cookBillMonth}
                    onChange={(e) => {
                      setCookBillMonth(e.target.value);
                      fetchCookBill(e.target.value);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    জনপ্রতি খালা বিল (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="উদাঃ 500"
                    value={perPersonCookBill}
                    onChange={(e) => setPerPersonCookBill(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={savingCookBill}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>{savingCookBill ? 'সেভ হচ্ছে...' : 'জনপ্রতি বিল সেভ করুন'}</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      // Pre-fill modal custom map with default or existing
                      const defaultMap: Record<string, string> = {};
                      members.forEach((m) => {
                        defaultMap[m.id] = memberCustomBills[m.id] !== undefined ? memberCustomBills[m.id] : (perPersonCookBill || '0');
                      });
                      setMemberCustomBills(defaultMap);
                      setCustomBillModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>সদস্য অনুযায়ী কাস্টমাইজ</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Expenses Table & Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">মেস খরচ লগ</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  মোট খরচ: ৳{totalExpensesAmount.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    fetchExpenses(e.target.value, filterCategory);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-medium"
                />

                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    fetchExpenses(month, e.target.value);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-medium"
                >
                  <option value="all">সব ক্যাটাগরি</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
                    <th className="px-4 py-3">বিবরণ</th>
                    <th className="px-4 py-3">ক্যাটাগরি</th>
                    <th className="px-4 py-3 font-semibold">পরিমাণ (৳)</th>
                    <th className="px-4 py-3">এন্ট্রি দাতা</th>
                    {isAdminOrManager && <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        কোনো খরচের তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{exp.date}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{exp.description}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          ৳{exp.amount.toLocaleString('bn-BD')}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{exp.addedBy?.name}</td>
                        {isAdminOrManager && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
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

      {/* Custom Member Cook Bill Modal */}
      {customBillModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                <span>সদস্য অনুযায়ী খালা বিল কাস্টমাইজ ({cookBillMonth})</span>
              </h3>
            </div>

            <form onSubmit={handleSaveCustomCookBills} className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="overflow-hidden">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{m.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{m.phone}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs font-medium text-slate-500">৳</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={memberCustomBills[m.id] !== undefined ? memberCustomBills[m.id] : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberCustomBills((prev) => ({
                            ...prev,
                            [m.id]: val,
                          }));
                        }}
                        className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCustomBillModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingCookBill}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 disabled:opacity-50"
                >
                  {savingCookBill ? 'সেভ হচ্ছে...' : 'কাস্টম বিল সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
