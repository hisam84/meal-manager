import { prisma } from './prisma';

/**
 * Checks if a user is authorized as a meal manager for a specific date (YYYY-MM-DD).
 * - SUPERADMIN and ADMIN always have full management access across all dates.
 * - MANAGER or MEMBER only have manager access for dates within their elected ManagerTerm(s).
 */
export async function isUserMealManagerForDate(user: any, targetDate: string): Promise<boolean> {
  if (!user || !user.messId || !targetDate) return false;

  // Super Admin & Admin always have full management access across all dates
  if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
    return true;
  }

  // If user object already includes managerTerms, check in-memory first
  if (user.managerTerms && Array.isArray(user.managerTerms) && user.managerTerms.length > 0) {
    const hasMatchingTerm = user.managerTerms.some(
      (term: any) =>
        (term.messId === user.messId || !term.messId) &&
        term.startDate <= targetDate &&
        term.endDate >= targetDate
    );
    if (hasMatchingTerm) return true;
  }

  // Check database for an elected manager term covering this date
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

/**
 * Checks if a user is authorized as a meal manager for any date in a given month (YYYY-MM).
 */
export async function isUserMealManagerForMonth(user: any, month: string): Promise<boolean> {
  if (!user || !user.messId || !month) return false;

  if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
    return true;
  }

  const monthStart = `${month}-01`;
  const monthEnd = `${month}-31`;

  if (user.managerTerms && Array.isArray(user.managerTerms) && user.managerTerms.length > 0) {
    const hasMatchingTerm = user.managerTerms.some(
      (term: any) =>
        (term.messId === user.messId || !term.messId) &&
        term.startDate <= monthEnd &&
        term.endDate >= monthStart
    );
    if (hasMatchingTerm) return true;
  }

  const term = await prisma.managerTerm.findFirst({
    where: {
      messId: user.messId,
      userId: user.id,
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
  });

  return Boolean(term);
}
