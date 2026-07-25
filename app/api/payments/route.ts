import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const userId = searchParams.get('userId');

    const where: any = { messId: currentUser.messId };

    if (month) {
      where.date = { startsWith: month };
    }

    if (userId) {
      where.userId = userId;
    } else if (currentUser.role === 'MEMBER') {
      // Standard members can only see their own payments
      where.userId = currentUser.id;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        addedBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can record member payments' }, { status: 403 });
    }

    const { id, userId, amount, date, note } = await req.json();

    if (!userId || !amount || !date) {
      return NextResponse.json({ error: 'Member, amount, and date are required' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    let payment;
    if (id) {
      payment = await prisma.payment.update({
        where: { id },
        data: {
          userId,
          amount: numericAmount,
          date,
          note: note ? note.trim() : null,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          messId: currentUser.messId,
          userId,
          amount: numericAmount,
          date,
          note: note ? note.trim() : null,
          addedById: currentUser.id,
        },
      });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Save payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can delete payments' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete payment error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
