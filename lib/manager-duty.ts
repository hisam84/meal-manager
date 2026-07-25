import { prisma } from './prisma';

export async function isUserMealManagerForDate(user: any, targetDate: string): Promise<boolean> {
  if (!user) return false;

  // Super Admin & Admin always have full management access
  if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
    return true;
  }

  if (!user.messId) return false;

  // Check if user has an active ManagerTerm covering the targetDate
  const term = await prisma.managerTerm.findFirst({
    where: {
      messId: user.messId,
      userId: user.id,
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
      status: 'ACTIVE',
    },
  });

  return Boolean(term);
}
