import { cookies } from 'next/headers';
import { db } from './db';

const SESSION_COOKIE = 'order_guard_session';

export async function getCurrentBusiness() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return db.business.findUnique({ where: { id: token } });
}

export function sessionCookieName() { return SESSION_COOKIE; }
