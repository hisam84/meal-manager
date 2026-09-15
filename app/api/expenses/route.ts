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
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { messId: currentUser.messId };

    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    } else if (month) {
      where.date = { startsWith: month };
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        addedBy: { select: { id: true, name: true } },
        spentBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, amount, description, category, date, spentById } = await req.json();

    if (!amount || !description || !category || !date) {
      return NextResponse.json({ error: 'Amount, description, category, and date are required' }, { status: 400 });
    }

    // Duty date check for target date
    const isAuthorized = await isUserMealManagerForDate(currentUser, date);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'আপনি শুধুমাত্র আপনার নির্বাচিত ম্যানেজার মেয়াদের তারিখগুলোতে খরচ এন্ট্রি বা এডিট করতে পারবেন।' },
        { status: 403 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'খরচের পরিমাণ সঠিক নয়' }, { status: 400 });
    }

    let expense;
    if (id) {
      const existingExpense = await prisma.expense.findUnique({ where: { id } });
      if (!existingExpense) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }

      if (existingExpense.date !== date) {
        const isAuthorizedForOldDate = await isUserMealManagerForDate(currentUser, existingExpense.date);
        if (!isAuthorizedForOldDate) {
          return NextResponse.json(
            { error: 'পূর্বের খরচের তারিখটি আপনার নির্বাচিত ম্যানেজার মেয়াদের বাইরে থাকায় এটি পরিবর্তন করতে পারবেন না।' },
            { status: 403 }
          );
        }
      }

      expense = await prisma.expense.update({
        where: { id },
        data: {
          amount: numericAmount,
          description: description.trim(),
          category,
          date,
          spentById: spentById || null,
        },
      });
    } else {
      expense = await prisma.expense.create({
        data: {
          messId: currentUser.messId,
          amount: numericAmount,
          description: description.trim(),
          category,
          date,
          spentById: spentById || null,
          addedById: currentUser.id,
        },
      });
    }

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error('Save expense error:', error);
    return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
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
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Duty date check
    const isAuthorized = await isUserMealManagerForDate(currentUser, expense.date);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'এই খরচের তারিখটি আপনার নির্বাচিত ম্যানেজার মেয়াদের বাইরে থাকায় এটি ডিলিট করতে পারবেন না।' },
        { status: 403 }
      );
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
