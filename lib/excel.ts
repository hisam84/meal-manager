import * as XLSX from 'xlsx';
import { MonthlySummaryResult } from './calculations';

export function generateMonthlySummaryExcel(summary: MonthlySummaryResult): Buffer {
  const wb = XLSX.utils.book_new();

  // Overview Sheet
  const overviewData = [
    ['Mess Meal Tracker - Monthly Summary Report'],
    ['Month', summary.month],
    ['Total Members', summary.totalMembers],
    ['Total Meals', summary.totalMeals],
    ['Total Bazar Expenses (৳)', summary.totalExpenses],
    ['Total Cook Bill (৳)', summary.totalCookBill],
    ['Meal Rate (৳) (Bazar / Total Meals)', summary.mealRate],
    ['Total Payments (৳)', summary.totalPayments],
    ['Total Receivable (৳)', summary.totalReceivable],
    ['Total Payable (৳)', summary.totalPayable],
  ];
  const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview');

  // Member Summary Sheet
  const memberRows = summary.memberSummaries.map((m) => ({
    'Member Name': m.name,
    'Phone': m.phone,
    'Role': m.role,
    'Breakfast': m.breakfast,
    'Lunch': m.lunch,
    'Dinner': m.dinner,
    'Total Meals': m.totalMeals,
    'Meal Cost (৳)': m.mealCost,
    'Cook Bill (৳)': m.cookBill,
    'Paid (৳)': m.paid,
    'Balance (৳)': m.balance,
    'Status': m.status,
  }));
  const memberWs = XLSX.utils.json_to_sheet(memberRows);
  XLSX.utils.book_append_sheet(wb, memberWs, 'Member Breakdown');

  // Buffer output
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

export function generateMealChartExcel(
  month: string,
  members: any[],
  meals: any[],
  settings: any
): Buffer {
  const wb = XLSX.utils.book_new();

  const year = parseInt(month.split('-')[0]);
  const monthIndex = parseInt(month.split('-')[1]) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Create header rows
  // Row 1: Title
  // Row 2: Member Name | 1 | 1 | 1 | 2 | 2 | 2 | ... | Total
  // Row 3:             | স | দু | রা | স | দু | রা | ... | Meals
  const row2: string[] = ['সদস্যের নাম'];
  const row3: string[] = [''];

  for (let day = 1; day <= daysInMonth; day++) {
    row2.push(`${day}`, '', '');
    row3.push('সকাল', 'দুপুর', 'রাত');
  }
  row2.push('মোট মিল');
  row3.push('');

  const rows: any[][] = [
    [`মেস দৈনিক মিল ট্র্যাকার চার্ট - ${month}`],
    row2,
    row3,
  ];

  // Meal map for quick lookup: userId_date
  const mealMap: Record<string, any> = {};
  meals.forEach((m) => {
    mealMap[`${m.userId}_${m.date}`] = m;
  });

  const bw = settings?.breakfastWeight ?? 1.0;
  const lw = settings?.lunchWeight ?? 1.0;
  const dw = settings?.dinnerWeight ?? 1.0;

  members.forEach((m) => {
    const memberRow: any[] = [m.name];
    let memberTotalMeals = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${month}-${dayStr}`;
      const entry = mealMap[`${m.id}_${dateStr}`];

      const b = entry ? entry.breakfast : 0;
      const l = entry ? entry.lunch : 0;
      const d = entry ? entry.dinner : 0;

      memberRow.push(b > 0 ? b : 0);
      memberRow.push(l > 0 ? l : 0);
      memberRow.push(d > 0 ? d : 0);

      const dayTotal = (b * bw) + (l * lw) + (d * dw);
      memberTotalMeals += dayTotal;
    }

    memberRow.push(Number(memberTotalMeals.toFixed(2)));
    rows.push(memberRow);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Meal Chart');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}
