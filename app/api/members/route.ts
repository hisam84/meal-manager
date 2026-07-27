import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await prisma.user.findMany({
      where: { messId: currentUser.messId, role: { not: 'SUPERADMIN' } },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Fetch members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can add new members' }, { status: 403 });
    }

    const { name, phone, email, password, role } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Phone number is already registered' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        password: hashedPassword,
        role: (role || 'MEMBER') as any,
        messId: currentUser.messId,
      },
    });

    const { password: _, ...cleanUser } = user;
    return NextResponse.json({ success: true, user: cleanUser });
  } catch (error: any) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can update member roles or status' }, { status: 403 });
    }

    const { id, name, phone, role, active, password } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Phone uniqueness check if changing phone
    if (phone && phone.trim() !== targetUser.phone) {
      const phoneOwner = await prisma.user.findUnique({ where: { phone: phone.trim() } });
      if (phoneOwner) {
        return NextResponse.json({ error: 'This phone number is already used by another member' }, { status: 400 });
      }
    }

    // Last admin protection: cannot deactivate or demote last Admin
    if (targetUser.role === 'ADMIN' && (role === 'MEMBER' || active === false)) {
      const adminCount = await prisma.user.count({
        where: { messId: currentUser.messId, role: 'ADMIN', active: true },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot deactivate or demote the last Admin of the mess' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = Boolean(active);
    if (password) updateData.password = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...cleanUser } = updatedUser;
    return NextResponse.json({ success: true, user: cleanUser });
  } catch (error: any) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only Admins and Managers can delete members' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if target member is currently an active Manager (today falls in their term)
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeTerm = await prisma.managerTerm.findFirst({
      where: {
        messId: currentUser.messId,
        userId: targetUser.id,
        startDate: { lte: todayStr },
        endDate: { gte: todayStr },
      },
    });

    if (activeTerm) {
      return NextResponse.json({
        error: `রানিং মেয়াদের কারেন্ট ম্যানেজার (${targetUser.name})-কে ডিলিট করা যাবে না। প্রথমে ম্যানেজারের মেয়াদ পরিবর্তন বা ফিল্ড আপডেট করুন।`,
      }, { status: 400 });
    }

    // Last admin protection
    if (targetUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { messId: currentUser.messId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Deletion failed: Cannot delete the last Admin' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
