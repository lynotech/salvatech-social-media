import { NextResponse } from 'next/server';
import { getClientsOverview } from '@/lib/server-state';

export async function GET() {
  return NextResponse.json(getClientsOverview());
}
