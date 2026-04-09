import { NextResponse } from 'next/server';
import { setCommand, consumeCommand, updateState } from '@/lib/server-state';

export async function POST(req: Request) {
  const { command } = await req.json();
  setCommand(command);
  updateState({ log: `Comando: ${command}`, logType: 'agent' } as any);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cmd = consumeCommand();
  return NextResponse.json({ command: cmd });
}
