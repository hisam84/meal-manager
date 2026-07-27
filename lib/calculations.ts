import { prisma } from './prisma';

export interface MonthlySummaryResult {
  month: string;
  totalMembers: number;
  totalMeals: number;
  totalExpenses: number;
  totalCookBill: number;
  mealRate: number;
  totalPayments: number;
  totalReceivable: number;
  totalPayable: number;
  managerMealDeduction: number; // meals deducted from total for rate calculation
  todayMealSummary?: {
    date: string;
    totalBreakfast: number;
    totalLunch: number;
    totalDinner: number;
    totalMealToday: number;
  };
  currentManager?: {
    name: string;
    phone: string;
    title?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  memberSummaries: {
    userId: string;
    name: string;
    phone: string;
    role: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    totalMeals: number;
    billableMeals: number; // after deduction for manager
    mealCost: number;
    cookBill: number;
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

export async function calculateMonthlySummary(messId: string, month: string, termId?: string): Promise<MonthlySummaryResult> {
  const todayStr = new Date().toISOString().slice(0, 10);

  let termStartDate: string | undefined;
  let termEndDate: string | undefined;
  let termManagerUserId: string | null = null;
  let termMealDeductionType: string = 'NONE';
  let termMealDeductionAmount: number = 0;

  // Fetch MessSetting for default deduction settings
  const messSettings: any = await prisma.messSetting.findUnique({ where: { messId } });
  let globalDeductionType = messSettings?.managerDeductionType || 'NONE';
  let globalDeductionAmount = messSettings?.managerDeductionAmount || 0;

  if (termId) {
    const termObj = await prisma.managerTerm.findUnique({ where: { id: termId } });
    if (termObj) {
      termStartDate = termObj.startDate;
      termEndDate = termObj.endDate;
      termManagerUserId = termObj.userId ?? null;
      termMealDeductionType = termObj.mealDeductionType && termObj.mealDeductionType !== 'NONE' 
        ? termObj.mealDeductionType 
        : globalDeductionType;
      termMealDeductionAmount = termObj.mealDeductionType && termObj.mealDeductionType !== 'NONE'
        ? (termObj.mealDeductionAmount ?? 0)
        : globalDeductionAmount;
    }
  } else {
    termMealDeductionType = globalDeductionType;
    termMealDeductionAmount = globalDeductionAmount;
    // Find active manager user if no term specified
    const activeTerm = await prisma.managerTerm.findFirst({
      where: { messId, status: 'ACTIVE' },
      orderBy: { startDate: 'desc' }
    });
    if (activeTerm) {
      termManagerUserId = activeTerm.userId;
    }
  }

  // Get all members of the mess
  const users = await prisma.user.findMany({
    where: { messId, role: { not: 'SUPERADMIN' } },
    select: { id: true, name: true, phone: true, role: true, active: true },
    orderBy: { name: 'asc' },
  });

  // Date condition for meals, expenses, payments
  const dateFilter: any = { startsWith: month, lte: todayStr };
  if (termStartDate && termEndDate) {
    dateFilter.gte = termStartDate;
    dateFilter.lte = termEndDate < todayStr ? termEndDate : todayStr;
  }

  // Get meals
  const meals = await prisma.meal.findMany({
    where: {
      messId,
      date: dateFilter,
    },
  });

  // Get expenses
  const expenses = await prisma.expense.findMany({
    where: {
      messId,
      date: dateFilter,
    },
  });

  // Get payments
  const payments = await prisma.payment.findMany({
    where: {
      messId,
      date: dateFilter,
    },
  });

  // Get cook bill for the month if exists
  const cookBill = await prisma.cookBill.findFirst({
    where: { messId, month },
  });

  const totalCookBill = cookBill ? cookBill.totalAmount : 0;
  let parsedMemberCookBills: Record<string, number> = {};
  if (cookBill && cookBill.memberBills) {
    try {
      parsedMemberCookBills = JSON.parse(cookBill.memberBills);
    } catch (e) {
      parsedMemberCookBills = {};
    }
  }

  // Aggregations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMeals = meals.reduce((sum, m) => sum + m.total, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  // --- Manager Meal Deduction ---
  // Find manager's actual meal total within term
  let managerMealDeduction = 0;
  if (termManagerUserId && termMealDeductionType !== 'NONE') {
    const managerMeals = meals.filter((m) => m.userId === termManagerUserId);
    const managerTotalMeals = managerMeals.reduce((sum, m) => sum + m.total, 0);

    if (termMealDeductionType === 'ALL') {
      managerMealDeduction = managerTotalMeals;
    } else if (termMealDeductionType === 'FIXED') {
      // Deduct the specified fixed amount, but not more than the manager's actual meals
      managerMealDeduction = Math.min(termMealDeductionAmount, managerTotalMeals);
    }
  }

  // Meal rate is calculated on net meals (total minus deducted)
  const netTotalMeals = Math.max(0, totalMeals - managerMealDeduction);
  const mealRate = netTotalMeals > 0 ? totalExpenses / netTotalMeals : 0;

  let totalReceivable = 0;
  let totalPayable = 0;

  const memberSummaries = users.map((user) => {
    const userMeals = meals.filter((m) => m.userId === user.id);
    const bCount = userMeals.reduce((sum, m) => sum + m.breakfast, 0);
    const lCount = userMeals.reduce((sum, m) => sum + m.lunch, 0);
    const dCount = userMeals.reduce((sum, m) => sum + m.dinner, 0);
    const userTotalMeals = userMeals.reduce((sum, m) => sum + m.total, 0);

    // For the manager, subtract their meal deduction from billable meals
    let billableMeals = userTotalMeals;
    if (termManagerUserId && user.id === termManagerUserId && termMealDeductionType !== 'NONE') {
      if (termMealDeductionType === 'ALL') {
        billableMeals = 0;
      } else if (termMealDeductionType === 'FIXED') {
        billableMeals = Math.max(0, userTotalMeals - termMealDeductionAmount);
      }
    }

    const mealCost = billableMeals * mealRate;
    const cookBillAmount = parsedMemberCookBills[user.id] || (users.length > 0 ? Number((totalCookBill / users.length).toFixed(2)) : 0);
    const userPayments = payments.filter((p) => p.userId === user.id);
    const paid = userPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = paid - (mealCost + cookBillAmount);

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
      billableMeals: Number(billableMeals.toFixed(2)),
      mealCost: Number(mealCost.toFixed(2)),
      cookBill: Number(cookBillAmount.toFixed(2)),
      paid: Number(paid.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      status,
    };
  });

  // Find current active manager details for dashboard display
  let currentManager: { name: string; phone: string; title?: string; startDate?: string; endDate?: string } | null = null;
  
  let activeTermObj = null;
  if (termId) {
    activeTermObj = await prisma.managerTerm.findUnique({
      where: { id: termId },
      include: { user: { select: { name: true, phone: true } } },
    });
  } else {
    activeTermObj = await prisma.managerTerm.findFirst({
      where: {
        messId,
        startDate: { lte: todayStr },
        endDate: { gte: todayStr },
      },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { startDate: 'desc' },
    });

    if (!activeTermObj) {
      activeTermObj = await prisma.managerTerm.findFirst({
        where: { messId },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { startDate: 'desc' },
      });
    }
  }

  if (activeTermObj && activeTermObj.user) {
    currentManager = {
      name: activeTermObj.user.name,
      phone: activeTermObj.user.phone,
      title: activeTermObj.title || undefined,
      startDate: activeTermObj.startDate,
      endDate: activeTermObj.endDate,
    };
  } else {
    const managerRoleUser = users.find((u) => u.role === 'MANAGER');
    if (managerRoleUser) {
      currentManager = {
        name: managerRoleUser.name,
        phone: managerRoleUser.phone,
      };
    }
  }

  // Today's per-meal breakdown for Dashboard display
  const todayMeals = await prisma.meal.findMany({
    where: {
      messId,
      date: todayStr,
    },
  });

  let todayB = 0;
  let todayL = 0;
  let todayD = 0;

  todayMeals.forEach((m: any) => {
    todayB += (m.breakfast || 0);
    todayL += (m.lunch || 0);
    todayD += (m.dinner || 0);
  });

  const todayMealSummary = {
    date: todayStr,
    totalBreakfast: Number(todayB.toFixed(2)),
    totalLunch: Number(todayL.toFixed(2)),
    totalDinner: Number(todayD.toFixed(2)),
    totalMealToday: Number((todayB + todayL + todayD).toFixed(2)),
  };

  return {
    month,
    totalMembers: users.length,
    totalMeals: Number(totalMeals.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalCookBill: Number(totalCookBill.toFixed(2)),
    mealRate: Number(mealRate.toFixed(2)),
    totalPayments: Number(totalPayments.toFixed(2)),
    totalReceivable: Number(totalReceivable.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    managerMealDeduction: Number(managerMealDeduction.toFixed(2)),
    todayMealSummary,
    currentManager,
    memberSummaries,
  };
}
