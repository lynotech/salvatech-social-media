import { NextResponse } from 'next/server';
import { setActiveClient, getActiveClient } from '@/lib/server-state';

export async function POST(req: Request) {
  const { slug } = await req.json();
  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }
  setActiveClient(slug);
  return NextResponse.json({ ok: true, activeClient: slug });
}

export async function GET() {
  return NextResponse.json({ activeClient: getActiveClient() });
}
