import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateMonthlySummary } from '@/lib/calculations';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let messId = currentUser.messId;
    if (!messId) {
      const defaultMess = await prisma.mess.findFirst();
      messId = defaultMess?.id || null;
    }

    if (!messId) {
      return NextResponse.json({
        month: new Date().toISOString().slice(0, 7),
        totalMembers: 0,
        totalMeals: 0,
        totalExpenses: 0,
        mealRate: 0,
        totalPayments: 0,
        totalReceivable: 0,
        totalPayable: 0,
        memberSummaries: [],
      });
    }

    const { searchParams } = new URL(req.url);
    const todayStr = new Date().toISOString().slice(0, 7);
    const month = searchParams.get('month') || todayStr;

    const summary = await calculateMonthlySummary(messId, month);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Fetch summary error:', error);
    return NextResponse.json({ error: 'Failed to calculate monthly summary' }, { status: 500 });
  }
}
