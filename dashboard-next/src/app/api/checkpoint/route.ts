import { NextResponse } from 'next/server';
import { setCheckpoint, getState } from '@/lib/server-state';

export async function POST(req: Request) {
  const data = await req.json();
  setCheckpoint(data);

  // Long-poll: wait up to 120s for response
  const start = Date.now();
  return new Promise<Response>((resolve) => {
    const poll = setInterval(() => {
      const s = getState();
      if (s.checkpoint?.responded) {
        clearInterval(poll);
        resolve(NextResponse.json({ 
          ok: true, 
          approved: s.checkpoint.response?.approved, 
          feedback: s.checkpoint.response?.feedback 
        }));
      } else if (Date.now() - start > 120000) {
        clearInterval(poll);
        resolve(NextResponse.json({ error: 'timeout' }, { status: 408 }));
      }
    }, 500);
  });
}

export async function GET() {
  const s = getState();
  if (s.checkpoint?.responded) {
    return NextResponse.json({ pending: false, approved: s.checkpoint.response?.approved, feedback: s.checkpoint.response?.feedback });
  } else if (s.checkpoint) {
    return NextResponse.json({ pending: true, question: s.checkpoint.question });
  }
  return NextResponse.json({ pending: false });
}
