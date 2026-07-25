import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let messId = currentUser.messId;
    if (!messId) {
      const defaultMess = await prisma.mess.findFirst();
      messId = defaultMess?.id || null;
    }

    if (!messId) {
      return NextResponse.json({ error: 'No active mess found' }, { status: 404 });
    }

    let settings = await prisma.messSetting.findUnique({
      where: { messId },
    });

    if (!settings) {
      settings = await prisma.messSetting.create({
        data: {
          messId,
          breakfastWeight: 1.0,
          lunchWeight: 1.0,
          dinnerWeight: 1.0,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can update meal settings' }, { status: 403 });
    }

    let messId = currentUser.messId;
    if (!messId) {
      const defaultMess = await prisma.mess.findFirst();
      messId = defaultMess?.id || null;
    }

    if (!messId) {
      return NextResponse.json({ error: 'No active mess found to update' }, { status: 404 });
    }

    const { breakfastWeight, lunchWeight, dinnerWeight } = await req.json();

    const bw = Math.max(0, Number(breakfastWeight) || 0);
    const lw = Math.max(0, Number(lunchWeight) || 0);
    const dw = Math.max(0, Number(dinnerWeight) || 0);

    const settings = await prisma.messSetting.upsert({
      where: { messId },
      update: {
        breakfastWeight: bw,
        lunchWeight: lw,
        dinnerWeight: dw,
      },
      create: {
        messId,
        breakfastWeight: bw,
        lunchWeight: lw,
        dinnerWeight: dw,
      },
    });

    // Re-calculate all meal totals in mess based on new settings
    const meals = await prisma.meal.findMany({
      where: { messId },
    });

    for (const meal of meals) {
      const newTotal = (meal.breakfast * bw) + (meal.lunch * lw) + (meal.dinner * dw);
      await prisma.meal.update({
        where: { id: meal.id },
        data: { total: newTotal },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
