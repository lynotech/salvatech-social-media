'use client';

import { LogEntry } from '@/lib/state';
import { useEffect, useRef } from 'react';

const TYPE_COLORS: Record<string, string> = {
  agent: '#9755FF',
  ok: '#22d687',
  err: '#e94560',
  warn: '#f5a623',
  '': 'rgba(255,255,255,0.5)',
};

export default function LogPanel({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div style={{
      position: 'absolute', bottom: 48, left: 12, width: 420, maxHeight: 200,
      background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(151,85,255,0.2)',
      borderRadius: 10, backdropFilter: 'blur(12px)', zIndex: 25,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(151,85,255,0.1)', fontSize: 9, fontFamily: "'DM Mono', monospace", color: '#9755FF', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Log
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', maxHeight: 160 }}>
        {logs.length === 0 && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono', monospace" }}>aguardando...</div>
        )}
        {logs.map((l, i) => (
          <div key={i} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", lineHeight: 1.7, display: 'flex', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{l.time}</span>
            <span style={{ color: TYPE_COLORS[l.type] || TYPE_COLORS[''], wordBreak: 'break-word' }}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
