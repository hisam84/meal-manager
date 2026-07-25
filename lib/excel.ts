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
