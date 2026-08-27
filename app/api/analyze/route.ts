import { NextResponse } from 'next/server';
import { analyzeOrder } from '../../../lib/detector';

const catalog = [
  { id: 'hoodie-black', name: 'black hoodie', price: 549 },
  { id: 'hoodie-red', name: 'red hoodie', price: 599 },
  { id: 'tshirt-black', name: 'black t-shirt', price: 399 },
  { id: 'shoes-red', name: 'red shoes', price: 1099 },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  return NextResponse.json(analyzeOrder(body.message, catalog));
}
