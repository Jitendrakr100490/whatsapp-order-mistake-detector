import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

const DEMO_BUSINESS_ID = process.env.DEMO_BUSINESS_ID;

export async function GET() {
  if (!DEMO_BUSINESS_ID) return NextResponse.json({ error: 'DEMO_BUSINESS_ID is not configured' }, { status: 503 });
  const [ordersScanned, safe, review, critical] = await Promise.all([
    db.order.count({ where: { businessId: DEMO_BUSINESS_ID } }),
    db.order.count({ where: { businessId: DEMO_BUSINESS_ID, status: 'SAFE' } }),
    db.order.count({ where: { businessId: DEMO_BUSINESS_ID, status: 'REVIEW' } }),
    db.order.count({ where: { businessId: DEMO_BUSINESS_ID, status: 'CRITICAL' } }),
  ]);
  return NextResponse.json({ ordersScanned, safe, review, critical });
}
