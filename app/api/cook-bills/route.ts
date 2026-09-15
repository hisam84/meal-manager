import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isUserMealManagerForMonth } from '@/lib/manager-duty';

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

    const { month, perPersonAmount, totalAmount, memberBills } = await req.json();

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    // Manager term authorization for the selected month
    const isAuthorized = await isUserMealManagerForMonth(currentUser, month);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'আপনি শুধুমাত্র আপনার নির্বাচিত ম্যানেজার মেয়াদের মাসের বাবুর্চি বিল পরিচালনা করতে পারবেন।' },
        { status: 403 }
      );
    }

    // Get all mess members
    const members = await prisma.user.findMany({
      where: { messId: currentUser.messId, role: { not: 'SUPERADMIN' } },
      select: { id: true },
    });

    let finalMemberBills: Record<string, number> = {};
    let calculatedTotal = 0;

    if (memberBills && typeof memberBills === 'object') {
      // Direct member bills map provided (custom adjustments)
      finalMemberBills = memberBills;
      calculatedTotal = Object.values(finalMemberBills).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    } else {
      // Per person amount specified
      const pAmount = Number(perPersonAmount) || 0;
      members.forEach((m) => {
        finalMemberBills[m.id] = pAmount;
      });
      calculatedTotal = pAmount * members.length;
    }

    // Allow explicit totalAmount override if provided, else use calculatedTotal
    const finalTotal = totalAmount !== undefined && Number(totalAmount) > 0 ? Number(totalAmount) : calculatedTotal;

    const existingBill = await prisma.cookBill.findFirst({
      where: {
        messId: currentUser.messId,
        month,
      },
    });

    let cookBill;
    const memberBillsJson = JSON.stringify(finalMemberBills);

    if (existingBill) {
      cookBill = await prisma.cookBill.update({
        where: { id: existingBill.id },
        data: {
          totalAmount: finalTotal,
          memberBills: memberBillsJson,
        },
      });
    } else {
      cookBill = await prisma.cookBill.create({
        data: {
          messId: currentUser.messId,
          month,
          totalAmount: finalTotal,
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

    const isAuthorized = await isUserMealManagerForMonth(currentUser, bill.month);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'এই বাবুর্চি বিলটি আপনার নির্বাচিত ম্যানেজার মেয়াদের বাইরে থাকায় এটি ডিলিট করতে পারবেন না।' },
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
