import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getCurrentBusiness } from '../../../lib/auth';

export async function GET() {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const [ordersScanned, safe, review, critical] = await Promise.all([
    db.order.count({ where: { businessId: business.id } }),
    db.order.count({ where: { businessId: business.id, status: 'SAFE' } }),
    db.order.count({ where: { businessId: business.id, status: 'REVIEW' } }),
    db.order.count({ where: { businessId: business.id, status: 'CRITICAL' } }),
  ]);
  return NextResponse.json({ ordersScanned, safe, review, critical });
}
