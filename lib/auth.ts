import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'mess_meal_tracker_secret_2026';
export const TOKEN_NAME = 'mess_session_token';
export const SESSION_MAX_AGE = 10 * 60; // 10 minutes in seconds (600s)

export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
  messId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(password, hashed);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { mess: true },
    });

    if (!user || !user.active) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    return null;
  }
}
