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

    const { userId, startDate, endDate } = await req.json();

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Member, start date, and end date are required' }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    // Create Manager Term
    const term = await prisma.managerTerm.create({
      data: {
        messId: currentUser.messId,
        userId,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });

    // Update user role to MANAGER if currently MEMBER
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === 'MEMBER') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'MANAGER' },
      });
    }

    return NextResponse.json({ success: true, term });
  } catch (error: any) {
    console.error('Create manager term error:', error);
    return NextResponse.json({ error: 'Failed to elect manager' }, { status: 500 });
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
