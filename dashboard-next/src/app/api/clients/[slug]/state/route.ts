import { NextResponse } from 'next/server';
import { getClientState } from '@/lib/server-state';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return NextResponse.json(getClientState(slug));
}
