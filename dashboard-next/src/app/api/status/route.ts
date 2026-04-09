import { NextResponse } from 'next/server';
import { updateState } from '@/lib/server-state';

export async function POST(req: Request) {
  const data = await req.json();
  updateState(data);
  return NextResponse.json({ ok: true });
}
