const fs = require('fs');
const path = require('path');

const pages = [
  'expenses', 'members', 'payments', 'profile', 'reports', 'settings', 'summary', 'superadmin'
];

const basePath = path.join(__dirname, '..', 'app');

pages.forEach(pageName => {
  const filePath = path.join(basePath, pageName, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filePath} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Replace imports
  content = content.replace(
    /import Sidebar from '@\/components\/Sidebar';\r?\nimport Navbar from '@\/components\/Navbar';/,
    "import PageShell from '@/components/PageShell';"
  );

  // 2. Replace opening layout structure
  content = content.replace(
    /<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">\r?\n\s*<Sidebar user=\{user\} onLogout=\{handleLogout\} \/>\r?\n\s*\r?\n\s*<div className="flex-1 flex flex-col min-w-0">\r?\n\s*<Navbar user=\{user\} title="([^"]*)" \/>\r?\n\s*\r?\n\s*<main className="p-6 space-y-6[^"]*">/,
    '<PageShell user={user} onLogout={handleLogout} title="$1">'
  );

  // 3. Replace closing layout structure
  content = content.replace(
    /\s*<\/main>\r?\n\s*<\/div>\r?\n\s*<\/div>/,
    '\n    </PageShell>'
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`UPDATED: ${filePath}`);
});
