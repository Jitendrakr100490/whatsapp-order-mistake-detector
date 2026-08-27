import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getCurrentBusiness } from '../../../lib/auth';

export async function GET() {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const products = await db.product.findMany({ where: { businessId: business.id, active: true }, include: { variants: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || typeof body.price !== 'number' || !Number.isFinite(body.price)) return NextResponse.json({ error: 'name and numeric price are required' }, { status: 400 });
  const product = await db.product.create({ data: { businessId: business.id, name: body.name.trim(), price: body.price, sku: typeof body.sku === 'string' ? body.sku.trim() : undefined } });
  return NextResponse.json(product, { status: 201 });
}
