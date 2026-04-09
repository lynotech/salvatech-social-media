import { NextResponse } from 'next/server';
import { respondCheckpoint } from '@/lib/server-state';

export async function POST(req: Request) {
  const { approved, feedback } = await req.json();
  respondCheckpoint(approved, feedback || '');
  return NextResponse.json({ ok: true });
}
