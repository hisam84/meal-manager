import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { calculateMonthlySummary } from '@/lib/calculations';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const todayStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const month = searchParams.get('month') || todayStr;
    const termId = searchParams.get('termId') || undefined;

    const summary = await calculateMonthlySummary(currentUser.messId, month, termId);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Fetch summary error:', error);
    return NextResponse.json({ error: 'Failed to calculate monthly summary' }, { status: 500 });
  }
}
