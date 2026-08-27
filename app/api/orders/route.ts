import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getCurrentBusiness } from '../../../lib/auth';
import { analyzeOrderV2 } from '../../../lib/detector-v2';

export async function GET() {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const orders = await db.order.findMany({ where: { businessId: business.id }, include: { items: true, issues: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.message !== 'string' || !body.message.trim()) return NextResponse.json({ error: 'message is required' }, { status: 400 });
  const products = await db.product.findMany({ where: { businessId: business.id, active: true }, include: { variants: true } });
  const result = analyzeOrderV2(body.message, products.map(p => ({ id: p.id, name: p.name, price: Number(p.price), variants: p.variants.map(v => ({ sku: v.sku ?? '', size: v.size ?? undefined, color: v.color ?? undefined, price: Number(v.price) })) })));
  const status = result.issues.some(i => i.severity === 'critical') ? 'CRITICAL' : result.issues.length ? 'REVIEW' : 'SAFE';
  const order = await db.order.create({ data: { businessId: business.id, rawMessage: body.message, statedTotal: result.statedTotal ?? undefined, expectedTotal: result.expectedTotal, confidence: result.confidence, status, items: { create: result.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, size: i.size, color: i.color, unitPrice: i.unitPrice })) }, issues: { create: result.issues.map(i => ({ type: i.type, severity: i.severity === 'critical' ? 'CRITICAL' : 'WARNING', message: i.message, expected: i.expected, actual: i.actual, difference: i.difference })) } }, include: { items: true, issues: true } });
  return NextResponse.json(order, { status: 201 });
}
