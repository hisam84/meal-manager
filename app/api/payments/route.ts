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
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { messId: currentUser.messId };

    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    } else if (month) {
      where.date = { startsWith: month };
    }

    if (userId) {
      where.userId = userId;
    } else if (currentUser.role === 'MEMBER') {
      where.userId = currentUser.id;
    }

    let payments;
    try {
      payments = await prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          addedBy: { select: { id: true, name: true } },
          editHistory: {
            include: {
              editedBy: { select: { id: true, name: true, phone: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { date: 'desc' },
      });
    } catch (queryErr: any) {
      // Fallback in case PaymentEditHistory table is not yet created in remote DB
      payments = await prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          addedBy: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
      });
    }

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, userId, amount, date, note, reason } = await req.json();

    if (!userId || !amount || !date) {
      return NextResponse.json({ error: 'Member, amount, and date are required' }, { status: 400 });
    }

    // Duty date check for new date
    const isAuthorizedForNewDate = await isUserMealManagerForDate(currentUser, date);
    if (!isAuthorizedForNewDate) {
      return NextResponse.json(
        { error: 'You are only authorized to record or edit payments for dates within your elected manager term.' },
        { status: 403 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    let payment;
    if (id) {
      // Find existing payment
      const existingPayment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Check authorization for the existing date as well if it differs
      if (existingPayment.date !== date) {
        const isAuthorizedForOldDate = await isUserMealManagerForDate(currentUser, existingPayment.date);
        if (!isAuthorizedForOldDate) {
          return NextResponse.json(
            { error: 'You are not authorized to modify a payment originally dated outside your manager term.' },
            { status: 403 }
          );
        }
      }

      const cleanNote = note ? note.trim() : null;
      const cleanPrevNote = existingPayment.note ? existingPayment.note.trim() : null;

      const hasChanged =
        existingPayment.amount !== numericAmount ||
        existingPayment.date !== date ||
        existingPayment.userId !== userId ||
        cleanPrevNote !== cleanNote;

      payment = await prisma.payment.update({
        where: { id },
        data: {
          userId,
          amount: numericAmount,
          date,
          note: cleanNote,
        },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          addedBy: { select: { id: true, name: true } },
        },
      });

      if (hasChanged) {
        try {
          await prisma.paymentEditHistory.create({
            data: {
              paymentId: id,
              editedById: currentUser.id,
              prevAmount: existingPayment.amount,
              newAmount: numericAmount,
              prevDate: existingPayment.date,
              newDate: date,
              prevNote: cleanPrevNote,
              newNote: cleanNote,
              prevUserId: existingPayment.userId,
              newUserId: userId,
              reason: reason ? reason.trim() : null,
            },
          });
        } catch (historyErr) {
          console.warn('Could not record edit history entry:', historyErr);
        }
      }
    } else {
      payment = await prisma.payment.create({
        data: {
          messId: currentUser.messId,
          userId,
          amount: numericAmount,
          date,
          note: note ? note.trim() : null,
          addedById: currentUser.id,
        },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          addedBy: { select: { id: true, name: true } },
        },
      });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Save payment error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to record payment' }, { status: 500 });
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
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Duty date check
    const isAuthorized = await isUserMealManagerForDate(currentUser, payment.date);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You are only authorized to delete payments for dates within your elected manager term.' },
        { status: 403 }
      );
    }

    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete payment error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
