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

    // Standard members only see their own meals if filtering by member or unless viewing mess list
    if (currentUser.role === 'MEMBER' && userId && userId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const meals = await prisma.meal.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, role: true } },
      },
      orderBy: { date: 'desc' },
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
    const { userId, date, breakfast = 0, lunch = 0, dinner = 0, note = '' } = body;

    const targetUserId = userId || currentUser.id;

    // Permissions check
    if (currentUser.role === 'MEMBER' && targetUserId !== currentUser.id) {
      return NextResponse.json({ error: 'Members can only manage their own meals' }, { status: 403 });
    }

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

    // Upsert meal for target user and date
    const meal = await prisma.meal.upsert({
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
        total,
        note,
      },
      create: {
        userId: targetUserId,
        messId: currentUser.messId,
        date,
        breakfast: b,
        lunch: l,
        dinner: d,
        total,
        note,
      },
    });

    return NextResponse.json({ success: true, meal });
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

    if (currentUser.role === 'MEMBER' && meal.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.meal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    return NextResponse.json({ error: 'Failed to delete meal record' }, { status: 500 });
  }
}
