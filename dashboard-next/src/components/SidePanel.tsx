'use client';

import { AppState } from '@/lib/state';

const STEP_NAMES: Record<string, string> = {
  1: 'Pesquisa', 2: 'Aprovação', 3: 'Copy', 4: 'Aprovação', 5: 'Ilustrador', 6: 'Designer', 7: 'Render'
};

export default function SidePanel({ state }: { state: AppState }) {
  return (
    <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 170, display: 'flex', flexDirection: 'column', gap: 6, padding: 12, zIndex: 25 }}>
      {Object.entries(state.steps).map(([num, st]) => {
        const active = st === 'active' || st === 'working';
        const done = st === 'done';
        const fill = done ? 100 : active ? 50 : 0;
        const color = done ? '#22d687' : '#9755FF';
        return (
          <div key={num} style={{
            background: active ? 'rgba(151,85,255,0.15)' : 'rgba(0,0,0,0.72)',
            border: `1px solid ${active ? '#9755FF' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            boxShadow: active ? '0 0 14px rgba(151,85,255,0.3)' : 'none',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{num}. {STEP_NAMES[num]}</div>
            <div style={{ fontSize: 9, color: '#8b84a8', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{st}</div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 1, width: `${fill}%`, background: color, transition: 'width 0.6s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
