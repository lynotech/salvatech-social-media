import { NextResponse } from 'next/server';
import { setClientCommand, consumeClientCommand, updateClientState, getActiveClient } from '@/lib/server-state';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { command } = await req.json();
  setClientCommand(slug, command);
  updateClientState(slug, { log: `Comando: ${command}`, logType: 'agent' } as any);
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cmd = consumeClientCommand(slug);
  return NextResponse.json({ command: cmd, activeClient: getActiveClient() });
}
