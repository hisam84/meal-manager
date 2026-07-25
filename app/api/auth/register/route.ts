import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, TOKEN_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, phone, email, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, and password are required' }, { status: 400 });
    }

    // Check if phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
    }

    // Get or create default mess
    let mess = await prisma.mess.findFirst();
    if (!mess) {
      mess = await prisma.mess.create({
        data: {
          name: 'Main Mess',
          code: 'MAIN-01',
        },
      });
      // create mess setting
      await prisma.messSetting.create({
        data: {
          messId: mess.id,
          breakfastWeight: 1.0,
          lunchWeight: 1.0,
          dinnerWeight: 1.0,
        },
      });
    }

    // Check existing user count in mess
    const userCount = await prisma.user.count({
      where: { messId: mess.id },
    });

    // First user is ADMIN, rest are MEMBER
    const role = userCount === 0 ? 'ADMIN' : 'MEMBER';
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        password: hashedPassword,
        role: role as any,
        messId: mess.id,
      },
    });

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
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error?.message || 'Server error during registration' }, { status: 500 });
  }
}
