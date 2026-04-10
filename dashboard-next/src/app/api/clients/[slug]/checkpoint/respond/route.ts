import { NextResponse } from 'next/server';
import { respondClientCheckpoint } from '@/lib/server-state';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { approved, feedback } = await req.json();
  respondClientCheckpoint(slug, approved, feedback || '');
  return NextResponse.json({ ok: true });
}
