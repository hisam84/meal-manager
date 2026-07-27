import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.messSetting.findUnique({
      where: { messId: currentUser.messId },
    });

    if (!settings) {
      settings = await prisma.messSetting.create({
        data: {
          messId: currentUser.messId,
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
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can update meal settings' }, { status: 403 });
    }

    const { breakfastWeight, lunchWeight, dinnerWeight, managerDeductionType, managerDeductionAmount } = await req.json();

    const bw = Math.max(0, Number(breakfastWeight) || 0);
    const lw = Math.max(0, Number(lunchWeight) || 0);
    const dw = Math.max(0, Number(dinnerWeight) || 0);
    const mdt = ['NONE', 'ALL', 'FIXED'].includes(managerDeductionType) ? managerDeductionType : 'NONE';
    const mda = mdt === 'FIXED' ? Math.max(0, Number(managerDeductionAmount) || 0) : 0;

    const settings = await prisma.messSetting.upsert({
      where: { messId: currentUser.messId },
      update: {
        breakfastWeight: bw,
        lunchWeight: lw,
        dinnerWeight: dw,
        managerDeductionType: mdt,
        managerDeductionAmount: mda,
      },
      create: {
        messId: currentUser.messId,
        breakfastWeight: bw,
        lunchWeight: lw,
        dinnerWeight: dw,
        managerDeductionType: mdt,
        managerDeductionAmount: mda,
      },
    });

    // Re-calculate all meal totals in mess based on new settings
    const meals = await prisma.meal.findMany({
      where: { messId: currentUser.messId },
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
