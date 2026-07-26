import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const terms = await prisma.managerTerm.findMany({
      where: { messId: currentUser.messId },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(terms);
  } catch (error: any) {
    console.error('Fetch manager terms error:', error);
    return NextResponse.json({ error: 'Failed to fetch manager terms' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can elect meal managers' }, { status: 403 });
    }

    const { userId, startDate, endDate, title, mealDeductionType, mealDeductionAmount } = await req.json();

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Member, start date, and end date are required' }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    // Validate deduction
    const deductionType: string = ['NONE', 'ALL', 'FIXED'].includes(mealDeductionType) ? mealDeductionType : 'NONE';
    const deductionAmount: number = deductionType === 'FIXED' ? Math.max(0, Number(mealDeductionAmount) || 0) : 0;

    // Check if there is an overlapping manager term for the same dates in this mess
    const overlappingTerm = await prisma.managerTerm.findFirst({
      where: {
        messId: currentUser.messId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: { user: true },
    });

    if (overlappingTerm) {
      const existingName = overlappingTerm.title || overlappingTerm.user?.name || 'অন্য মেম্বার';
      return NextResponse.json({
        error: `এই তারিখের মধ্যে (${overlappingTerm.startDate} থেকে ${overlappingTerm.endDate}) ইতোমধ্যে "${existingName}" ম্যানেজার হিসেবে দায়িত্বপ্রাপ্ত রয়েছেন। একই তারিখে দ্বিতীয় ম্যানেজার দেওয়া যাবে না। আগে তালিকা থেকে আগের মেয়াদ এডিট বা বাতিল করুন।`,
      }, { status: 400 });
    }

    // Auto-generate title if not provided
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    const autoTitle = title || `${userObj?.name || 'Manager'}-${startDate} to ${endDate}`;

    // Create Manager Term
    const term = await prisma.managerTerm.create({
      data: {
        messId: currentUser.messId,
        userId,
        startDate,
        endDate,
        title: autoTitle,
        status: 'ACTIVE',
        mealDeductionType: deductionType,
        mealDeductionAmount: deductionAmount,
      },
    });

    // Update user role to MANAGER if currently MEMBER
    if (userObj && userObj.role === 'MEMBER') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'MANAGER' },
      });
    }

    return NextResponse.json({ success: true, term });
  } catch (error: any) {
    console.error('Create manager term error:', error);
    return NextResponse.json({ error: error.message || 'Failed to elect manager' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can edit manager terms' }, { status: 403 });
    }

    const { id, startDate, endDate, title, mealDeductionType, mealDeductionAmount } = await req.json();

    if (!id || !startDate || !endDate) {
      return NextResponse.json({ error: 'Term ID, start date, and end date are required' }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    // Validate deduction
    const deductionType: string = ['NONE', 'ALL', 'FIXED'].includes(mealDeductionType) ? mealDeductionType : 'NONE';
    const deductionAmount: number = deductionType === 'FIXED' ? Math.max(0, Number(mealDeductionAmount) || 0) : 0;

    const updated = await prisma.managerTerm.update({
      where: { id },
      data: {
        startDate,
        endDate,
        title: title || undefined,
        mealDeductionType: deductionType,
        mealDeductionAmount: deductionAmount,
      },
    });

    return NextResponse.json({ success: true, term: updated });
  } catch (error: any) {
    console.error('Update manager term error:', error);
    return NextResponse.json({ error: 'Failed to update manager term' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can revoke manager terms' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Manager term ID is required' }, { status: 400 });
    }

    await prisma.managerTerm.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete manager term error:', error);
    return NextResponse.json({ error: 'Failed to revoke manager term' }, { status: 500 });
  }
}
