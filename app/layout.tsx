import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'মেস মিল ট্র্যাকার — Mess Meal Tracker',
  description: 'Next.js 14, TypeScript & PostgreSQL with Prisma ORM powered Mess Meal Tracking Web App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
