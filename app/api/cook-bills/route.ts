import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isUserMealManagerForDate } from '@/lib/manager-duty';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    const where: any = { messId: currentUser.messId };
    if (month) {
      where.month = month;
    }

    const cookBills = await prisma.cookBill.findMany({
      where,
      orderBy: { month: 'desc' },
    });

    return NextResponse.json(cookBills);
  } catch (error: any) {
    console.error('Fetch cook bills error:', error);
    return NextResponse.json({ error: 'Failed to fetch cook bills' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, totalAmount, memberBills } = await req.json();

    if (!month || !totalAmount) {
      return NextResponse.json({ error: 'Month and total amount are required' }, { status: 400 });
    }

    // Manager term authorization for the selected month (check 1st day of month)
    const checkDate = `${month}-01`;
    const isAuthorized = await isUserMealManagerForDate(currentUser, checkDate);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You are only authorized to manage cook bills for months within your manager term.' },
        { status: 403 }
      );
    }

    const numericTotal = Number(totalAmount);
    if (isNaN(numericTotal) || numericTotal <= 0) {
      return NextResponse.json({ error: 'Invalid total cook bill amount' }, { status: 400 });
    }

    const existingBill = await prisma.cookBill.findFirst({
      where: {
        messId: currentUser.messId,
        month,
      },
    });

    let cookBill;
    const memberBillsJson = typeof memberBills === 'string' ? memberBills : JSON.stringify(memberBills || {});

    if (existingBill) {
      cookBill = await prisma.cookBill.update({
        where: { id: existingBill.id },
        data: {
          totalAmount: numericTotal,
          memberBills: memberBillsJson,
        },
      });
    } else {
      cookBill = await prisma.cookBill.create({
        data: {
          messId: currentUser.messId,
          month,
          totalAmount: numericTotal,
          memberBills: memberBillsJson,
        },
      });
    }

    return NextResponse.json({ success: true, cookBill });
  } catch (error: any) {
    console.error('Save cook bill error:', error);
    return NextResponse.json({ error: 'Failed to save cook bill' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Cook Bill ID is required' }, { status: 400 });
    }

    const bill = await prisma.cookBill.findUnique({ where: { id } });
    if (!bill) {
      return NextResponse.json({ error: 'Cook Bill not found' }, { status: 404 });
    }

    const checkDate = `${bill.month}-01`;
    const isAuthorized = await isUserMealManagerForDate(currentUser, checkDate);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You are only authorized to delete cook bills for months within your manager term.' },
        { status: 403 }
      );
    }

    await prisma.cookBill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete cook bill error:', error);
    return NextResponse.json({ error: 'Failed to delete cook bill' }, { status: 500 });
  }
}
