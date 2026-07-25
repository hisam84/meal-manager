import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { calculateMonthlySummary } from '@/lib/calculations';
import { generateMonthlySummaryExcel } from '@/lib/excel';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.messId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const summary = await calculateMonthlySummary(currentUser.messId, month);
    const excelBuffer = generateMonthlySummaryExcel(summary);
    const uint8Array = new Uint8Array(excelBuffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Mess-Summary-${month}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Excel export error:', error);
    return NextResponse.json({ error: 'Failed to generate Excel report' }, { status: 500 });
  }
}
