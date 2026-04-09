import { NextResponse } from 'next/server';
import { getState } from '@/lib/server-state';

export async function GET() {
  return NextResponse.json(getState());
}
