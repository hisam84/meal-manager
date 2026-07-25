import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Super Admin authorization required' }, { status: 403 });
    }

    const messes = await prisma.mess.findMany({
      include: {
        _count: {
          select: { users: true, meals: true, expenses: true, payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messes);
  } catch (error: any) {
    console.error('Fetch messes error:', error);
    return NextResponse.json({ error: 'Failed to fetch messes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Only Super Admin can create new messes' }, { status: 403 });
    }

    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Mess name and unique mess code are required' }, { status: 400 });
    }

    const existingCode = await prisma.mess.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json({ error: 'Mess code already exists. Please use a unique code.' }, { status: 400 });
    }

    const mess = await prisma.mess.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
      },
    });

    // Create default mess setting
    await prisma.messSetting.create({
      data: {
        messId: mess.id,
        breakfastWeight: 1.0,
        lunchWeight: 1.0,
        dinnerWeight: 1.0,
      },
    });

    return NextResponse.json({ success: true, mess });
  } catch (error: any) {
    console.error('Create mess error:', error);
    return NextResponse.json({ error: 'Failed to create new mess' }, { status: 500 });
  }
}
