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
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    const where: any = { messId: currentUser.messId };

    if (month) {
      where.date = { startsWith: month };
    } else if (date) {
      where.date = date;
    }

    if (userId) {
      where.userId = userId;
    }

    const meals = await prisma.meal.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, role: true } },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(meals);
  } catch (error: any) {
    console.error('Fetch meals error:', error);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      userId,
      date,
      breakfastCount = 1,
      breakfastMode = 'ONCE', // 'DAILY' | 'ONCE' | 'OFF'
      lunchCount = 1,
      lunchMode = 'ONCE',
      dinnerCount = 1,
      dinnerMode = 'ONCE',
      note = '',
    } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Manager term duty authorization check
    const isAuthorized = await isUserMealManagerForDate(currentUser, date);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You are only authorized to manage meals for dates within your elected manager term.' },
        { status: 403 }
      );
    }

    const targetUserId = userId || currentUser.id;

    // Get mess weights
    const settings = await prisma.messSetting.findUnique({
      where: { messId: currentUser.messId },
    });

    const bw = settings?.breakfastWeight ?? 1.0;
    const lw = settings?.lunchWeight ?? 1.0;
    const dw = settings?.dinnerWeight ?? 1.0;

    const b = breakfastMode === 'OFF' ? 0 : Math.max(0, Math.floor(Number(breakfastCount) || 0));
    const l = lunchMode === 'OFF' ? 0 : Math.max(0, Math.floor(Number(lunchCount) || 0));
    const d = dinnerMode === 'OFF' ? 0 : Math.max(0, Math.floor(Number(dinnerCount) || 0));

    const totalD = (b * bw) + (l * lw) + (d * dw);

    // 1. Save meal entry for target date D
    await prisma.meal.upsert({
      where: {
        userId_date: {
          userId: targetUserId,
          date,
        },
      },
      update: {
        breakfast: b,
        lunch: l,
        dinner: d,
        total: totalD,
        note,
      },
      create: {
        userId: targetUserId,
        messId: currentUser.messId,
        date,
        breakfast: b,
        lunch: l,
        dinner: d,
        total: totalD,
        note,
      },
    });

    // 2. Apply DAILY or OFF settings to FUTURE dates (> D) within the month
    const hasDailyOrOffScope =
      breakfastMode === 'DAILY' || breakfastMode === 'OFF' ||
      lunchMode === 'DAILY' || lunchMode === 'OFF' ||
      dinnerMode === 'DAILY' || dinnerMode === 'OFF';

    if (hasDailyOrOffScope) {
      const startDate = new Date(date);
      const year = startDate.getFullYear();
      const monthIndex = startDate.getMonth();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const currentDay = startDate.getDate();

      for (let day = currentDay + 1; day <= daysInMonth; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const monthStr = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
        const futureDateStr = `${year}-${monthStr}-${dayStr}`;

        const existingMeal = await prisma.meal.findUnique({
          where: {
            userId_date: {
              userId: targetUserId,
              date: futureDateStr,
            },
          },
        });

        let nextB = existingMeal ? existingMeal.breakfast : 1;
        let nextL = existingMeal ? existingMeal.lunch : 1;
        let nextD = existingMeal ? existingMeal.dinner : 1;

        if (breakfastMode === 'DAILY') nextB = b;
        if (breakfastMode === 'OFF') nextB = 0;

        if (lunchMode === 'DAILY') nextL = l;
        if (lunchMode === 'OFF') nextL = 0;

        if (dinnerMode === 'DAILY') nextD = d;
        if (dinnerMode === 'OFF') nextD = 0;

        const nextTotal = (nextB * bw) + (nextL * lw) + (nextD * dw);

        await prisma.meal.upsert({
          where: {
            userId_date: {
              userId: targetUserId,
              date: futureDateStr,
            },
          },
          update: {
            breakfast: nextB,
            lunch: nextL,
            dinner: nextD,
            total: nextTotal,
          },
          create: {
            userId: targetUserId,
            messId: currentUser.messId,
            date: futureDateStr,
            breakfast: nextB,
            lunch: nextL,
            dinner: nextD,
            total: nextTotal,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save meal error:', error);
    return NextResponse.json({ error: 'Failed to save meal entry' }, { status: 500 });
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
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }

    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) {
      return NextResponse.json({ error: 'Meal record not found' }, { status: 404 });
    }

    // Manager duty authorization check for meal deletion date
    const isAuthorized = await isUserMealManagerForDate(currentUser, meal.date);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You are only authorized to delete meals for dates within your elected manager term.' },
        { status: 403 }
      );
    }

    await prisma.meal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    return NextResponse.json({ error: 'Failed to delete meal record' }, { status: 500 });
  }
}
