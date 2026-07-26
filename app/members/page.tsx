'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { Users, UserPlus, KeyRound, UserCheck, UserX, Trash2, CheckCircle2, AlertCircle, Calendar, ShieldAlert, Pencil } from 'lucide-react';

export default function MembersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [managerTerms, setManagerTerms] = useState<any[]>([]);

  // Form states for adding member
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');

  // Form states for electing Manager
  const [electUserId, setElectUserId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [termTitle, setTermTitle] = useState('');
  const [electing, setElecting] = useState(false);

  // Edit Term Modal states
  const [editTerm, setEditTerm] = useState<any>(null);
  const [editTermTitle, setEditTermTitle] = useState('');
  const [editTermStartDate, setEditTermStartDate] = useState('');
  const [editTermEndDate, setEditTermEndDate] = useState('');

  // Member edit state
  const [editModalUser, setEditModalUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('MEMBER');

  // Password reset state
  const [resetModalUser, setResetModalUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || (data.user.role !== 'SUPERADMIN' && data.user.role !== 'ADMIN')) {
          router.push('/');
        } else {
          setUser(data.user);
          fetchMembers();
          fetchManagerTerms();
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchMembers = () => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      });
  };

  const fetchManagerTerms = () => {
    fetch('/api/manager-terms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setManagerTerms(data);
      });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');

      setMessage({ type: 'success', text: 'নতুন মেম্বার সফলভাবে যুক্ত হয়েছেন' });
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      fetchMembers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleElectManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setElecting(true);

    try {
      const res = await fetch('/api/manager-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: electUserId,
          startDate,
          endDate,
          title: termTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to elect manager');

      setMessage({ type: 'success', text: 'নির্দিষ্ট মেয়াদের জন্য ম্যানেজার সফলভাবে নির্বাচন করা হয়েছে!' });
      setTermTitle('');
      fetchMembers();
      fetchManagerTerms();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setElecting(false);
    }
  };

  const handleUpdateManagerTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTerm) return;

    try {
      const res = await fetch('/api/manager-terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTerm.id,
          startDate: editTermStartDate,
          endDate: editTermEndDate,
          title: editTermTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update manager term');

      setMessage({ type: 'success', text: 'ম্যানেজারের দায়িত্বের তারিখ ও নাম সফলভাবে আপডেট করা হয়েছে!' });
      setEditTerm(null);
      fetchManagerTerms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeManagerTerm = async (id: string) => {
    if (!confirm('আপনি কি এই ম্যানেজারিয়ালের মেয়াদ বাতিল করতে চান?')) return;

    try {
      const res = await fetch(`/api/manager-terms?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke term');
      fetchMembers();
      fetchManagerTerms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, active: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');
      fetchMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Role change failed');
      fetchMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser || !editName || !editPhone) return;

    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editModalUser.id,
          name: editName,
          phone: editPhone,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update member');

      setMessage({ type: 'success', text: `মেম্বার ${editName}-এর তথ্য আপডেট করা হয়েছে` });
      setEditModalUser(null);
      fetchMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetModalUser.id, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');

      alert('পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
      setResetModalUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মেম্বারকে স্থায়ীভাবে মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/members?id=${memberId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete member');
      fetchMembers();
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

  return (
    <>
      <PageShell user={user} onLogout={handleLogout} title="মেম্বার ও ম্যানেজার নির্বাচন">
          {message && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Elect Meal Manager Section (Date Specific Manager Assignment) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-sky-200 dark:border-sky-900/60 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>নির্দিষ্ট মেয়াদের জন্য ম্যানেজার নির্বাচন করুন (Elect Meal Manager)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              নির্বাচিত ম্যানেজার শুধুমাত্র তার নির্ধারিত শুরুর ও শেষ তারিখের মধ্যে মেস হিসাব, মিল ইনপুট ও খরচ এন্ট্রি করতে পারবেন।
            </p>

            <form onSubmit={handleElectManager} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ম্যানেজার নির্বাচন
                </label>
                <select
                  value={electUserId}
                  onChange={(e) => setElectUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- সদস্য নির্বাচন করুন --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone}) - {m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  পরিচিতি নাম / টাইটেল (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="উদাঃ হিসাম-জুলাই-সেকেন্ড হাফ ২০২৬"
                  value={termTitle}
                  onChange={(e) => setTermTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  দায়িত্ব শুরুর তারিখ (Start Date)
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  দায়িত্ব শেষ তারিখ (End Date)
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={electing}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all text-sm disabled:opacity-50"
                >
                  {electing ? 'সংরক্ষণ হচ্ছে...' : 'ম্যানেজার দায়িত্ব প্রদান করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Manager Terms List */}
          {managerTerms.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>ম্যানেজারদের দায়িত্ব পালনের সময়সীমা তালিকা</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">পরিচিতি নাম / ম্যানেজার</th>
                      <th className="px-4 py-3">শুরুর তারিখ</th>
                      <th className="px-4 py-3">শেষ তারিখ</th>
                      <th className="px-4 py-3">স্ট্যাটাস</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {managerTerms.map((term) => (
                      <tr key={term.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{term.title || term.user?.name}</p>
                          <span className="text-xs text-slate-500">ম্যানেজার: {term.user?.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{term.startDate}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{term.endDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            সক্রিয় মেয়াদ
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditTerm(term);
                              setEditTermTitle(term.title || '');
                              setEditTermStartDate(term.startDate);
                              setEditTermEndDate(term.endDate);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors text-xs font-semibold"
                            title="দায়িত্ব সময়সীমা এডিট"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleRevokeManagerTerm(term.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-xs font-semibold"
                            title="বাতিল করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Member Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>নতুন মেম্বার যুক্ত করুন</span>
            </h2>

            <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  পূর্ণ নাম
                </label>
                <input
                  type="text"
                  required
                  placeholder="মেম্বারের নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ফোন নম্বর
                </label>
                <input
                  type="text"
                  required
                  placeholder="01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ইমেইল (ঐচ্ছিক)
                </label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  রোল / পদবী
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="MEMBER">সাধারণ মেম্বার (Member)</option>
                  <option value="MANAGER">মিল ম্যানেজার (Manager)</option>
                  <option value="ADMIN">মেস এডমিন (Admin)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50 text-sm"
                >
                  {saving ? 'যোগ হচ্ছে...' : 'মেম্বার যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>

          {/* Members List Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              <span>মেস মেম্বার তালিকা</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">নাম</th>
                    <th className="px-4 py-3">ফোন</th>
                    <th className="px-4 py-3">রোল</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {m.name}
                        {m.id === user?.id && <span className="ml-1 text-xs text-sky-600 font-bold">(আমি)</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.phone}</td>
                      <td className="px-4 py-3">
                        <select
                          value={m.role}
                          onChange={(e) => handleChangeRole(m.id, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(m.id, m.active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            m.active
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {m.active ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          <span>{m.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditModalUser(m);
                            setEditName(m.name);
                            setEditPhone(m.phone);
                            setEditRole(m.role);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="মেম্বার তথ্য এডিট"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setResetModalUser(m)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors"
                          title="পাসওয়ার্ড রিসেট"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </PageShell>

      {/* Edit Member Modal */}
      {editModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-500" />
              <span>মেম্বার তথ্য এডিট করুন</span>
            </h3>
            <form onSubmit={handleEditMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মেম্বারের নাম
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  ফোন নম্বর (Login Phone)
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  রোল (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {resetModalUser.name}-এর পাসওয়ার্ড রিসেট
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  নতুন পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-600/30"
                >
                  রিসেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Term Modal */}
      {editTerm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-500" />
              <span>ম্যানেজারের দায়িত্ব ও মেয়াদ সময়সীমা এডিট</span>
            </h3>
            <form onSubmit={handleUpdateManagerTerm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  পরিচিতি নাম / টাইটেল
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ হিসাম-জুলাই-সেকেন্ড হাফ ২০২৬"
                  value={editTermTitle}
                  onChange={(e) => setEditTermTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  দায়িত্ব শুরুর তারিখ (Start Date)
                </label>
                <input
                  type="date"
                  required
                  value={editTermStartDate}
                  onChange={(e) => setEditTermStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  দায়িত্ব শেষ তারিখ (End Date)
                </label>
                <input
                  type="date"
                  required
                  value={editTermEndDate}
                  onChange={(e) => setEditTermEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTerm(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
