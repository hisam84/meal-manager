import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Only Superadmin can perform data reset' }, { status: 403 });
    }

    const { confirm, messId: targetMessId } = await req.json();
    if (confirm !== 'RESET') {
      return NextResponse.json({ error: 'Confirmation string "RESET" required' }, { status: 400 });
    }

    const messId = targetMessId || currentUser.messId;
    if (!messId) {
      return NextResponse.json({ error: 'Mess ID is required' }, { status: 400 });
    }

    // Delete meals, expenses, payments, cookbills, managerTerms in mess
    await prisma.meal.deleteMany({ where: { messId } });
    await prisma.expense.deleteMany({ where: { messId } });
    await prisma.payment.deleteMany({ where: { messId } });
    await prisma.cookBill.deleteMany({ where: { messId } });
    await prisma.managerTerm.deleteMany({ where: { messId } });

    return NextResponse.json({ success: true, message: 'All transactional data reset successfully for the mess' });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}
