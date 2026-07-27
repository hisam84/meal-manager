import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, TOKEN_NAME, SESSION_MAX_AGE } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive. Please contact admin.' }, { status: 403 });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      messId: user.messId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        messId: user.messId,
      },
    });

    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE, // 10 minutes (600s)
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  }
}
