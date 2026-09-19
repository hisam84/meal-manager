'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import {
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  History,
  Coins,
  UserCheck,
  Eye,
  X,
  Filter,
  Edit2,
  Clock,
  ArrowRight,
  FileText,
  Check,
  Calendar,
  User as UserIcon,
  Tag,
  AlertTriangle
} from 'lucide-react';

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // Add Form states
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // History Filter & Modal States
  const [filterUserId, setFilterUserId] = useState<string>('ALL');
  const [historyModalUser, setHistoryModalUser] = useState<any | null>(null);

  // Edit Payment Modal States
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [editUserId, setEditUserId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Audit History Modal State
  const [auditModalPayment, setAuditModalPayment] = useState<any | null>(null);

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
          fetchSummary(month);

          // If user is manager with terms, auto-default form date to within their active term if today is outside
          if (data.user && data.user.role !== 'SUPERADMIN' && data.user.role !== 'ADMIN' && data.user.managerTerms?.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            const terms = data.user.managerTerms;
            const isTodayInTerm = terms.some((t: any) => today >= t.startDate && today <= t.endDate);
            if (!isTodayInTerm && terms[0]) {
              // Default to the latest term's end or start date
              setDate(terms[0].endDate >= today ? terms[0].startDate : terms[0].endDate);
            }
          }
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

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
        if (Array.isArray(data)) {
          setPayments(data);
          // If audit modal is currently open, update its reference
          if (auditModalPayment) {
            const updated = data.find((p) => p.id === auditModalPayment.id);
            if (updated) setAuditModalPayment(updated);
          }
        }
      });
  };

  const fetchSummary = (m: string) => {
    fetch(`/api/summary?month=${m}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSummary(data);
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (isNonAdminManager && !isDateWithinUserTerm(date)) {
      setMessage({
        type: 'error',
        text: 'নির্বাচিত তারিখটি আপনার ম্যানেজার মেয়াদের বাইরে। আপনি শুধুমাত্র আপনার মেয়াদের তারিখে পেমেন্ট এন্ট্রি করতে পারবেন।',
      });
      return;
    }

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

  const openEditModal = (payment: any) => {
    setEditingPayment(payment);
    setEditUserId(payment.userId);
    setEditAmount(payment.amount.toString());
    setEditDate(payment.date);
    setEditNote(payment.note || '');
    setEditReason('');
    setEditError(null);
  };

  const handleSaveEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setEditError(null);

    if (isNonAdminManager && !isDateWithinUserTerm(editDate)) {
      setEditError('নির্বাচিত নতুন তারিখটি আপনার ম্যানেজার মেয়াদের বাইরে।');
      return;
    }

    if (isNonAdminManager && !isDateWithinUserTerm(editingPayment.date)) {
      setEditError('পূর্বের পেমেন্টের তারিখটি আপনার মেয়াদের বাইরে থাকায় এটি এডিট করা যাবে না।');
      return;
    }

    setEditSaving(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPayment.id,
          userId: editUserId,
          amount: editAmount,
          date: editDate,
          note: editNote,
          reason: editReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payment');

      setEditingPayment(null);
      setMessage({ type: 'success', text: 'পেমেন্ট রেকর্ড সফলভাবে এডিট করা হয়েছে এবং এডিট হিস্ট্রিতে সংরক্ষিত হয়েছে।' });
      fetchPayments(month);
      fetchSummary(month);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('আপনি কি এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete payment');
      fetchPayments(month);
      fetchSummary(month);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">
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
            মেম্বারদের জমার হিসাব, এডিট ও পরিবর্তন ইতিহাস (Audit Trail)
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
              fetchSummary(e.target.value);
            }}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold"
          />
        </div>
      </div>

      {/* Add Payment Form (Admin & Manager Only) */}
      {isAdminOrManager && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>মেম্বার পেমেন্ট এন্ট্রি দিন (নতুন জমা যোগ করুন)</span>
            </h2>

            {isNonAdminManager && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  মেয়াদ:{' '}
                  {userTerms.length > 0
                    ? userTerms.map((t) => `${t.startDate} হতে ${t.endDate}`).join(', ')
                    : 'দায়িত্বপ্রাপ্ত মেয়াদ নেই'}
                </span>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
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
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isNonAdminManager && !isDateWithinUserTerm(date)
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {isNonAdminManager && !isDateWithinUserTerm(date) && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>তারিখটি আপনার ম্যানেজার মেয়াদের বাইরে</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  নোট / মাধ্যম (উদাঃ বিকাশ / ক্যাশ)
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
            {targetUserId && (() => {
              const targetMemberSummary = summary?.memberSummaries?.find((s: any) => s.userId === targetUserId);
              return (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300">
                    <Coins className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span>
                        সিলেক্টকৃত মেম্বারের আগের মোট জমা: <strong className="text-slate-900 dark:text-white">৳{targetMemberPreviousTotal.toLocaleString('bn-BD')}</strong>
                      </span>
                      {targetMemberSummary && (
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          ৫০৳ রেটে বাকি ব্যালেন্স: <strong className={targetMemberSummary.isLowBalance ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>৳{targetMemberSummary.estimatedRemainingBalance}</strong> (প্রায় {targetMemberSummary.estimatedRemainingMeals} টি মিল বাকি)
                          {targetMemberSummary.isLowBalance && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              (লো ব্যালেন্স)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-purple-700 dark:text-purple-300 font-bold">
                      নতুন এন্ট্রি সহ মোট জমা দাঁড়াবে: <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">৳{targetMemberCombinedTotal.toLocaleString('bn-BD')}</span>
                    </span>
                  </div>
                </div>
              );
            })()}

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
            <p className="text-xs text-slate-500">প্রতিটি মেম্বারের মোট জমা টাকার হিসাব এবং ৫০৳ মিলরেট অনুমিত লো ব্যালেন্স স্ট্যাটাস</p>
          </div>

          <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
            সর্বমোট সংগৃহীত জমা: ৳{totalPaymentsAmount.toLocaleString('bn-BD')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayMembers.map((m, index) => {
            const memberPaymentsList = payments.filter((p) => p.userId === m.id);
            const memberTotalPaid = memberPaymentsList.reduce((sum, p) => sum + p.amount, 0);
            const memberSummary = summary?.memberSummaries?.find((s: any) => s.userId === m.id);

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</h4>
                        {memberSummary?.isLowBalance && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shrink-0"
                            title={`৫০৳ মিলরেট হিসেবে অবশিষ্ট ব্যালেন্স: ৳${memberSummary.estimatedRemainingBalance} (প্রায় ${memberSummary.estimatedRemainingMeals} মিল বাকি)`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            লো ব্যালেন্স ({memberSummary.estimatedRemainingMeals} মিল)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{m.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-block">
                      ৳{memberTotalPaid.toLocaleString('bn-BD')}
                    </span>
                    {memberSummary && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        ৫০৳ রেটে বাকি: <strong className={memberSummary.isLowBalance ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>৳{memberSummary.estimatedRemainingBalance}</strong>
                      </span>
                    )}
                  </div>
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
              {displayMembers.map((m, index) => (
                <option key={m.id} value={m.id}>
                  {index + 1}. {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-l-lg w-12 text-center">#</th>
                <th className="px-4 py-3">তারিখ</th>
                <th className="px-4 py-3">মেম্বার</th>
                <th className="px-4 py-3 font-semibold">জমার পরিমাণ (৳)</th>
                <th className="px-4 py-3">নোট / মাধ্যম</th>
                <th className="px-4 py-3">এন্ট্রি দাতা</th>
                <th className="px-4 py-3">স্ট্যাটাস / হিস্ট্রি</th>
                {isAdminOrManager && <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrManager ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                    কোনো পেমেন্টের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, index) => {
                  const hasEdits = p.editHistory && p.editHistory.length > 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-400 dark:text-slate-500 text-xs text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.date}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{p.user?.name}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{p.amount.toLocaleString('bn-BD')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.note || '-'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.addedBy?.name || '-'}</td>
                      <td className="px-4 py-3">
                        {hasEdits ? (
                          <button
                            onClick={() => setAuditModalPayment(p)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors"
                            title="এডিট হিস্ট্রি / পরিবর্তন বিবরণী দেখুন"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>সংশোধিত ({p.editHistory.length})</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">মূল এন্ট্রি</span>
                        )}
                      </td>
                      {isAdminOrManager && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                              title="পেমেন্ট এডিট করুন"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="পেমেন্ট মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Payment History Modal */}
      {historyModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
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

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {userTransactions.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        উক্ত মাসে এই মেম্বারের কোনো জমা নেই।
                      </div>
                    ) : (
                      userTransactions.map((t) => {
                        const hasEdits = t.editHistory && t.editHistory.length > 0;
                        return (
                          <div key={t.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">{t.date}</span>
                                {hasEdits && (
                                  <button
                                    onClick={() => setAuditModalPayment(t)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                  >
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>সংশোধিত ({t.editHistory.length})</span>
                                  </button>
                                )}
                              </div>
                              <span className="text-slate-500 block">{t.note || 'নোট নেই'} (এন্ট্রি: {t.addedBy?.name})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-emerald-600 text-sm">৳{t.amount.toLocaleString('bn-BD')}</span>
                              {isAdminOrManager && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditModal(t)}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                    title="এডিট করুন"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePayment(t.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setHistoryModalUser(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-purple-600" />
                  <span>পেমেন্ট রেকর্ড এডিট করুন</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  রেকর্ড পরিবর্তন করলে স্বয়ংক্রিয়ভাবে এডিট হিস্ট্রি সংরক্ষিত হবে।
                </p>
              </div>

              <button
                onClick={() => setEditingPayment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    মেম্বার
                  </label>
                  <select
                    value={editUserId}
                    onChange={(e) => setEditUserId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    সংশোধিত জমার পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isNonAdminManager && !isDateWithinUserTerm(editDate)
                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {isNonAdminManager && !isDateWithinUserTerm(editDate) && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>তারিখটি আপনার ম্যানেজার মেয়াদের বাইরে</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    নোট / মাধ্যম (উদাঃ বিকাশ / নগদ / ব্যাংক)
                  </label>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="নোট বা বিবরণ"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    এডিটের কারণ / মন্তব্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="উদাঃ টাকার পরিমাণ ভুল হয়েছিল, তারিখ সংশোধন"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Difference Preview */}
              {editingPayment && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>পূর্বের পরিমাণ:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">৳{editingPayment.amount.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>নতুন পরিমাণ:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      ৳{(Number(editAmount) || 0).toLocaleString('bn-BD')}
                    </span>
                  </div>
                  {Number(editAmount) !== editingPayment.amount && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                      <span>পার্থক্য:</span>
                      <span className={Number(editAmount) > editingPayment.amount ? 'text-emerald-600' : 'text-rose-500'}>
                        {Number(editAmount) > editingPayment.amount ? '+' : ''}
                        ৳{(Number(editAmount) - editingPayment.amount).toLocaleString('bn-BD')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-md shadow-purple-600/20 text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History / Edit Log Modal */}
      {auditModalPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" />
                  <span>পেমেন্ট এডিট হিস্ট্রি ও অডিট ট্রেইল</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  মেম্বার: <strong className="text-slate-700 dark:text-slate-300">{auditModalPayment.user?.name}</strong> | বর্তমান জমা: <strong className="text-emerald-600">৳{auditModalPayment.amount.toLocaleString('bn-BD')}</strong>
                </p>
              </div>

              <button
                onClick={() => setAuditModalPayment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Entry Metadata */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">মূল এন্ট্রি তারিখ: {auditModalPayment.date}</span>
                <span>এন্ট্রি করেছেন: {auditModalPayment.addedBy?.name || 'অজানা'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                মোট সংশোধন: {auditModalPayment.editHistory?.length || 0} বার
              </span>
            </div>

            {/* Timeline of Revisions */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {!auditModalPayment.editHistory || auditModalPayment.editHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  এই পেমেন্টের জন্য কোনো এডিট ইতিহাস পাওয়া যায়নি।
                </div>
              ) : (
                auditModalPayment.editHistory.map((item: any, index: number) => {
                  const editDateFormatted = new Date(item.createdAt).toLocaleString('bn-BD', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  const amountDiff = item.newAmount - item.prevAmount;

                  return (
                    <div
                      key={item.id || index}
                      className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] space-y-2.5 text-xs"
                    >
                      {/* Revision Header */}
                      <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center">
                            #{auditModalPayment.editHistory.length - index}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.editedBy?.name || 'সিস্টেম'} ({item.editedBy?.role || 'ম্যানেজার'})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{editDateFormatted}</span>
                        </span>
                      </div>

                      {/* Reason Tag */}
                      {item.reason && (
                        <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>এডিটের কারণ:</strong> {item.reason}
                          </span>
                        </div>
                      )}

                      {/* Before vs After Diff Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Amount Diff */}
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">জমার পরিমাণ পরিবর্তন</span>
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <span className="text-slate-500 line-through">৳{item.prevAmount.toLocaleString('bn-BD')}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">৳{item.newAmount.toLocaleString('bn-BD')}</span>
                            {amountDiff !== 0 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${amountDiff > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'}`}>
                                {amountDiff > 0 ? '+' : ''}৳{amountDiff.toLocaleString('bn-BD')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Date Diff */}
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">তারিখ পরিবর্তন</span>
                          <div className="flex items-center gap-2 font-medium text-xs">
                            {item.prevDate !== item.newDate ? (
                              <>
                                <span className="text-slate-500 line-through">{item.prevDate}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-bold text-purple-600 dark:text-purple-400">{item.newDate}</span>
                              </>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400">{item.newDate} (অপরিবর্তিত)</span>
                            )}
                          </div>
                        </div>

                        {/* Note Diff */}
                        {(item.prevNote || item.newNote) && (
                          <div className="sm:col-span-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">নোট / মাধ্যম বিবরণ</span>
                            <div className="flex items-center gap-2 text-xs">
                              {item.prevNote !== item.newNote ? (
                                <>
                                  <span className="text-slate-400 line-through">{item.prevNote || 'নোট ছিল না'}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.newNote || 'নোট মুছে ফেলা হয়েছে'}</span>
                                </>
                              ) : (
                                <span className="text-slate-600 dark:text-slate-400">{item.newNote || 'নোট নেই'} (অপরিবর্তিত)</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAuditModalPayment(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
