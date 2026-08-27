import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '../../../../lib/db';
import { sessionCookieName } from '../../../../lib/auth';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const businessName = typeof body?.businessName === 'string' ? body.businessName.trim() : '';
  if (!email || password.length < 8 || !businessName) return NextResponse.json({ error: 'email, businessName and password (8+ chars) are required' }, { status: 400 });
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  const user = await db.user.create({ data: { email, passwordHash: hash(password), memberships: { create: { role: 'OWNER', business: { create: { name: businessName } } } } }, include: { memberships: { include: { business: true } } } });
  const business = user.memberships[0].business;
  const response = NextResponse.json({ user: { id: user.id, email: user.email }, business: { id: business.id, name: business.name } }, { status: 201 });
  response.cookies.set(sessionCookieName(), business.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}
