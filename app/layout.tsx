import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'মেস মিল ট্র্যাকার — Mess Meal Tracker',
  description: 'স্মার্ট মেস মিল ট্র্যাকিং ও হিসাব বিবরণী ওয়েব অ্যাপ',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  other: {
    'google-adsense-account': 'ca-pub-5843180435468615',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5843180435468615" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5843180435468615"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
