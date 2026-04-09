import { NextResponse } from 'next/server';
import { resetState } from '@/lib/server-state';

export async function POST() {
  resetState();
  return NextResponse.json({ ok: true });
}
