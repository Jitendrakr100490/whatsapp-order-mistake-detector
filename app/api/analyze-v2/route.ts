import { NextResponse } from 'next/server';
import { analyzeWhatsAppOrder } from '../../../lib/order-pipeline';

const catalog = [
  { id: 'hoodie', name: 'hoodie', price: 549, variants: [
    { sku: 'H-B-L', size: 'L', color: 'black', price: 549 },
    { sku: 'H-R-XL', size: 'XL', color: 'red', price: 599 },
  ] },
  { id: 'shoes', name: 'shoes', price: 1099, variants: [
    { sku: 'S-8-R', size: '8', color: 'red', price: 1099 },
  ] },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  return NextResponse.json(analyzeWhatsAppOrder(body.message, catalog));
}
