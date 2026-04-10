import { NextResponse } from 'next/server';
import { updateClientState } from '@/lib/server-state';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await req.json();
  updateClientState(slug, data);
  return NextResponse.json({ ok: true });
}
