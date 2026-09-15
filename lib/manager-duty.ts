import { prisma } from './prisma';

export async function isUserMealManagerForDate(user: any, targetDate: string): Promise<boolean> {
  if (!user) return false;

  // Super Admin & Admin always have full management access
  if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
    return true;
  }

  if (!user.messId) return false;

  // If user role is MANAGER, grant access by default
  if (user.role === 'MANAGER') {
    // Check if there is a conflicting manager term assigned to a DIFFERENT manager for this exact date
    const otherManagerTerm = await prisma.managerTerm.findFirst({
      where: {
        messId: user.messId,
        userId: { not: user.id },
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
        status: 'ACTIVE',
      },
    });

    // If another manager has an active term for this date, restrict
    if (otherManagerTerm) {
      return false;
    }

    return true;
  }

  // If user is a general MEMBER, check if they have an elected manager term covering this date
  const term = await prisma.managerTerm.findFirst({
    where: {
      messId: user.messId,
      userId: user.id,
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
    },
  });

  return Boolean(term);
}
