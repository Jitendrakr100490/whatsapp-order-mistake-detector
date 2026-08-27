import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '../../../../lib/db';
import { sessionCookieName } from '../../../../lib/auth';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const user = await db.user.findUnique({ where: { email }, include: { memberships: { include: { business: true }, orderBy: { createdAt: 'asc' } } } });
  if (!user || user.passwordHash !== hash(password) || !user.memberships.length) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  const business = user.memberships[0].business;
  const response = NextResponse.json({ user: { id: user.id, email: user.email }, business: { id: business.id, name: business.name } });
  response.cookies.set(sessionCookieName(), business.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}
