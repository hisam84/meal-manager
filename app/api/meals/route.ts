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

    // Role safeguard: Only ADMIN, MANAGER, SUPERADMIN can add or edit meals
    if (currentUser.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Standard members cannot modify meals. Only Admins and Managers can manage meals.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, date, breakfast = 0, lunch = 0, dinner = 0, note = '', mode = 'ON_ONCE' } = body;

    const targetUserId = userId || currentUser.id;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const b = Math.max(0, Number(breakfast) || 0);
    const l = Math.max(0, Number(lunch) || 0);
    const d = Math.max(0, Number(dinner) || 0);

    // Get mess weights
    const settings = await prisma.messSetting.findUnique({
      where: { messId: currentUser.messId },
    });

    const bw = settings?.breakfastWeight ?? 1.0;
    const lw = settings?.lunchWeight ?? 1.0;
    const dw = settings?.dinnerWeight ?? 1.0;

    const total = (b * bw) + (l * lw) + (d * dw);

    // Determine target dates for single day vs continuous daily modes
    const targetDates: string[] = [date];

    if (mode === 'ON_DAILY' || mode === 'OFF_DAILY') {
      const startDate = new Date(date);
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const currentDay = startDate.getDate();

      for (let day = currentDay + 1; day <= daysInMonth; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const monthStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
        targetDates.push(`${year}-${monthStr}-${dayStr}`);
      }
    }

    // Upsert meals for all target dates
    for (const targetDate of targetDates) {
      await prisma.meal.upsert({
        where: {
          userId_date: {
            userId: targetUserId,
            date: targetDate,
          },
        },
        update: {
          breakfast: b,
          lunch: l,
          dinner: d,
          total,
          note,
        },
        create: {
          userId: targetUserId,
          messId: currentUser.messId,
          date: targetDate,
          breakfast: b,
          lunch: l,
          dinner: d,
          total,
          note,
        },
      });
    }

    return NextResponse.json({ success: true, count: targetDates.length });
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

    // Role safeguard: Only ADMIN, MANAGER, SUPERADMIN can delete meals
    if (currentUser.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Standard members cannot delete meals. Only Admins and Managers can manage meals.' },
        { status: 403 }
      );
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

    await prisma.meal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    return NextResponse.json({ error: 'Failed to delete meal record' }, { status: 500 });
  }
}
