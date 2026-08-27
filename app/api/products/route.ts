import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

const DEMO_BUSINESS_ID = process.env.DEMO_BUSINESS_ID;

export async function GET() {
  if (!DEMO_BUSINESS_ID) return NextResponse.json({ error: 'DEMO_BUSINESS_ID is not configured' }, { status: 503 });
  const products = await db.product.findMany({ where: { businessId: DEMO_BUSINESS_ID, active: true }, include: { variants: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!DEMO_BUSINESS_ID) return NextResponse.json({ error: 'DEMO_BUSINESS_ID is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || typeof body.price !== 'number') return NextResponse.json({ error: 'name and numeric price are required' }, { status: 400 });
  const product = await db.product.create({ data: { businessId: DEMO_BUSINESS_ID, name: body.name.trim(), price: body.price, sku: typeof body.sku === 'string' ? body.sku.trim() : undefined } });
  return NextResponse.json(product, { status: 201 });
}
