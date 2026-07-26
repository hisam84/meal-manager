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
  settings: any,
  managerTerms: any[] = []
): Buffer {
  const wb = XLSX.utils.book_new();

  const year = parseInt(month.split('-')[0]);
  const monthIndex = parseInt(month.split('-')[1]) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Filter days: only include days that fall within an elected manager term
  // If no terms exist for the month, fall back to all days in month
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((day) => {
    if (!managerTerms || managerTerms.length === 0) return true;
    const dayFormatted = day < 10 ? `0${day}` : `${day}`;
    const targetDate = `${month}-${dayFormatted}`;
    return managerTerms.some((term) => targetDate >= term.startDate && targetDate <= term.endDate);
  });

  // Create header rows
  const row2: string[] = ['সদস্যের নাম'];
  const row3: string[] = [''];

  daysArray.forEach((day) => {
    row2.push(`${day}`, '', '');
    row3.push('সকাল', 'দুপুর', 'রাত');
  });
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

    daysArray.forEach((day) => {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${month}-${dayStr}`;
      const entry = mealMap[`${m.id}_${dateStr}`];

      const b = entry ? entry.breakfast : 0;
      const l = entry ? entry.lunch : 0;
      const d = entry ? entry.dinner : 0;

      const bVal = b * bw;
      const lVal = l * lw;
      const dVal = d * dw;

      memberRow.push(bVal > 0 ? bVal : 0);
      memberRow.push(lVal > 0 ? lVal : 0);
      memberRow.push(dVal > 0 ? dVal : 0);

      const dayTotal = bVal + lVal + dVal;
      memberTotalMeals += dayTotal;
    });

    memberRow.push(Number(memberTotalMeals.toFixed(2)));
    rows.push(memberRow);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Meal Chart');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}
