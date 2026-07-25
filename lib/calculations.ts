import { prisma } from './prisma';

export interface MonthlySummaryResult {
  month: string;
  totalMembers: number;
  totalMeals: number;
  totalExpenses: number;
  mealRate: number;
  totalPayments: number;
  totalReceivable: number;
  totalPayable: number;
  memberSummaries: {
    userId: string;
    name: string;
    phone: string;
    role: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    totalMeals: number;
    mealCost: number;
    paid: number;
    balance: number;
    status: 'Receivable' | 'Payable' | 'Settled';
  }[];
}

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('bn-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}৳${formatted}`;
}

export async function calculateMonthlySummary(messId: string, month: string): Promise<MonthlySummaryResult> {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Get all members of the mess
  const users = await prisma.user.findMany({
    where: { messId, role: { not: 'SUPERADMIN' } },
    select: { id: true, name: true, phone: true, role: true, active: true },
    orderBy: { name: 'asc' },
  });

  // Get all meals for the month up to today (future dates not counted until they arrive)
  const meals = await prisma.meal.findMany({
    where: {
      messId,
      date: {
        startsWith: month,
        lte: todayStr,
      },
    },
  });

  // Get all expenses for the month up to today
  const expenses = await prisma.expense.findMany({
    where: {
      messId,
      date: {
        startsWith: month,
        lte: todayStr,
      },
    },
  });

  // Get all payments for the month up to today
  const payments = await prisma.payment.findMany({
    where: {
      messId,
      date: {
        startsWith: month,
        lte: todayStr,
      },
    },
  });

  // Aggregations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMeals = meals.reduce((sum, m) => sum + m.total, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

  let totalReceivable = 0;
  let totalPayable = 0;

  const memberSummaries = users.map((user) => {
    const userMeals = meals.filter((m) => m.userId === user.id);
    const bCount = userMeals.reduce((sum, m) => sum + m.breakfast, 0);
    const lCount = userMeals.reduce((sum, m) => sum + m.lunch, 0);
    const dCount = userMeals.reduce((sum, m) => sum + m.dinner, 0);
    const userTotalMeals = userMeals.reduce((sum, m) => sum + m.total, 0);

    const mealCost = userTotalMeals * mealRate;
    const userPayments = payments.filter((p) => p.userId === user.id);
    const paid = userPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = paid - mealCost;

    let status: 'Receivable' | 'Payable' | 'Settled' = 'Settled';
    if (balance > 0.01) {
      status = 'Receivable';
      totalReceivable += balance;
    } else if (balance < -0.01) {
      status = 'Payable';
      totalPayable += Math.abs(balance);
    }

    return {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      breakfast: bCount,
      lunch: lCount,
      dinner: dCount,
      totalMeals: userTotalMeals,
      mealCost: Number(mealCost.toFixed(2)),
      paid: Number(paid.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      status,
    };
  });

  return {
    month,
    totalMembers: users.length,
    totalMeals: Number(totalMeals.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    mealRate: Number(mealRate.toFixed(2)),
    totalPayments: Number(totalPayments.toFixed(2)),
    totalReceivable: Number(totalReceivable.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    memberSummaries,
  };
}
