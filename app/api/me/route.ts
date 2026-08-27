import { NextResponse } from 'next/server';
import { getCurrentBusiness } from '../../../lib/auth';

export async function GET() {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, business: { id: business.id, name: business.name } });
}
