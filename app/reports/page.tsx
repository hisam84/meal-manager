'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          if (data.user.email) setRecipientEmail(data.user.email);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

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
                onChange={(e) => setMonth(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Excel Download */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Excel এক্সপোর্ট (.xlsx)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  xlsx লাইব্রেরি দিয়ে মেম্বার সামারি ও মিল খরচের রিপোর্ট এক্সপোর্ট করুন
                </p>
              </div>

              <button
                onClick={handleDownloadExcel}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel ডাউনলোড করুন</span>
              </button>
            </div>

            {/* Email Dispatch via Nodemailer */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
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
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white">প্রিন্ট / PDF ডাউনলোড</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ব্রাউজার প্রিন্ট ডায়ালগ দিয়ে রিপোর্ট প্রিন্ট বা PDF হিসেবে সেভ করুন
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
    </PageShell>
  );
}
