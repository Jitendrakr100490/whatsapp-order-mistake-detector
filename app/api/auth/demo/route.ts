import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { sessionCookieName } from '../../../../lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.businessName === 'string' ? body.businessName.trim() : '';
  if (!name) return NextResponse.json({ error: 'businessName is required' }, { status: 400 });

  const business = await db.business.create({ data: { name } });
  const response = NextResponse.json({ business: { id: business.id, name: business.name } }, { status: 201 });
  response.cookies.set(sessionCookieName(), business.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(sessionCookieName());
  return response;
}
