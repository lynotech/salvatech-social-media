'use client';

export default function TopBar({ pipeline, connected }: { pipeline: string; connected: boolean }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px', zIndex: 20,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)'
    }}>
      <img src="/logo.png" alt="SalvaTech" style={{ height: 40 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#22d687' : '#e94560', boxShadow: connected ? '0 0 8px #22d687' : '0 0 8px #e94560' }} />
          {connected ? 'online' : 'offline'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9755FF', boxShadow: '0 0 8px #9755FF' }} />
          {pipeline}
        </div>
      </div>
    </div>
  );
}
