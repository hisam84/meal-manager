import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can perform backup export' }, { status: 403 });
    }

    const messId = currentUser.messId;

    const [mess, users, meals, expenses, payments, cookBills, settings] = await Promise.all([
      prisma.mess.findUnique({ where: { id: messId } }),
      prisma.user.findMany({ where: { messId } }),
      prisma.meal.findMany({ where: { messId } }),
      prisma.expense.findMany({ where: { messId } }),
      prisma.payment.findMany({ where: { messId } }),
      prisma.cookBill.findMany({ where: { messId } }),
      prisma.messSetting.findUnique({ where: { messId } }),
    ]);

    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      mess,
      users,
      meals,
      expenses,
      payments,
      cookBills,
      settings,
    };

    return new Response(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mess-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
