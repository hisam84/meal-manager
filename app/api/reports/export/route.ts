import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateMonthlySummary } from '@/lib/calculations';
import { generateMonthlySummaryExcel, generateMealChartExcel } from '@/lib/excel';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const type = searchParams.get('type');

    if (type === 'meal-chart') {
      const members = await prisma.user.findMany({
        where: { messId: currentUser.messId, role: { not: 'SUPERADMIN' } },
        select: { id: true, name: true, phone: true, role: true },
        orderBy: { name: 'asc' },
      });

      const meals = await prisma.meal.findMany({
        where: {
          messId: currentUser.messId,
          date: { startsWith: month },
        },
      });

      const settings = await prisma.messSetting.findUnique({
        where: { messId: currentUser.messId },
      });

      const managerTerms = await prisma.managerTerm.findMany({
        where: { messId: currentUser.messId },
      });

      const excelBuffer = generateMealChartExcel(month, members, meals, settings, managerTerms);
      const uint8Array = new Uint8Array(excelBuffer);

      return new Response(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Meal-Chart-${month}.xlsx"`,
        },
      });
    }

    const summary = await calculateMonthlySummary(currentUser.messId, month);
    const excelBuffer = generateMonthlySummaryExcel(summary);
    const uint8Array = new Uint8Array(excelBuffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Mess-Summary-${month}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Excel export error:', error);
    return NextResponse.json({ error: 'Failed to generate Excel report' }, { status: 500 });
  }
}
