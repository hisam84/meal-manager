import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { calculateMonthlySummary, formatCurrency } from '@/lib/calculations';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, month } = await req.json();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const summary = await calculateMonthlySummary(currentUser.messId, targetMonth);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0284c7;">Mess Meal Tracker - Summary Report (${summary.month})</h2>
        <p>Hello,</p>
        <p>Here is the monthly summary breakdown for <strong>${summary.month}</strong>:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Metric</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount / Count</th>
          </tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Total Members</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${summary.totalMembers}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Total Meals</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${summary.totalMeals}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Total Expenses</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(summary.totalExpenses)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #0284c7;">Meal Rate</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #0284c7;">${formatCurrency(summary.mealRate)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Total Payments Recorded</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(summary.totalPayments)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; color: #16a34a;">Total Receivable</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #16a34a;">${formatCurrency(summary.totalReceivable)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626;">Total Payable</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #dc2626;">${formatCurrency(summary.totalPayable)}</td></tr>
        </table>
        <p style="font-size: 12px; color: #666;">Sent automatically via Mess Meal Tracker.</p>
      </div>
    `;

    const result = await sendEmail({
      to: recipientEmail,
      subject: `[Mess Meal Tracker] Summary Report - ${targetMonth}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Email dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch email' }, { status: 500 });
  }
}
