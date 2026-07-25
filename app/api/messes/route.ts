import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Super Admin authorization required' }, { status: 403 });
    }

    const messes = await prisma.mess.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { id: true, name: true, phone: true, email: true },
        },
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

    const { name, code, adminName, adminPhone, adminPassword } = await req.json();

    if (!name || !code || !adminName || !adminPhone || !adminPassword) {
      return NextResponse.json({ error: 'Mess name, code, Admin name, phone, and password are required' }, { status: 400 });
    }

    const existingCode = await prisma.mess.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json({ error: 'Mess code already exists. Please use a unique code.' }, { status: 400 });
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: adminPhone.trim() },
    });

    if (existingPhone) {
      return NextResponse.json({ error: 'Admin phone number already registered to another account' }, { status: 400 });
    }

    // 1. Create Mess
    const mess = await prisma.mess.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
      },
    });

    // 2. Create default mess setting
    await prisma.messSetting.create({
      data: {
        messId: mess.id,
        breakfastWeight: 1.0,
        lunchWeight: 1.0,
        dinnerWeight: 1.0,
      },
    });

    // 3. Create Mess Admin User
    const hashedPassword = await hashPassword(adminPassword);
    const adminUser = await prisma.user.create({
      data: {
        name: adminName.trim(),
        phone: adminPhone.trim(),
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
        messId: mess.id,
      },
    });

    return NextResponse.json({
      success: true,
      mess,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        phone: adminUser.phone,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    console.error('Create mess error:', error);
    return NextResponse.json({ error: 'Failed to create new mess and admin' }, { status: 500 });
  }
}
