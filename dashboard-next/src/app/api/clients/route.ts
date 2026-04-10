import { NextResponse } from 'next/server';
import { getClientsOverview } from '@/lib/server-state';

export async function GET() {
  const overview = getClientsOverview();
  const clients = overview.map(({ name, slug, logo }) => ({ name, slug, logo }));
  return NextResponse.json(clients);
}
