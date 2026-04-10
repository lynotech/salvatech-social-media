'use client';

import { AppState } from '@/lib/state';

const AGENTS: Record<string, { label: string; role: string; img: string; tagPos: React.CSSProperties; anim: string }> = {
  orquestrador: { label: 'Craudin The Boss', role: 'Orquestrador', img: 'boss.png',
    tagPos: { bottom: '32%', left: '34%' },
    anim: 'bs 4s ease-in-out infinite' },
  estrategista: { label: 'Kako', role: 'Estrategista', img: 'estrategista.png',
    tagPos: { top: '18%', left: '4%' },
    anim: 'sw 5s ease-in-out infinite' },
  designer: { label: 'Jorge Macaco', role: 'Designer', img: 'Designer.png',
    tagPos: { top: '14%', left: '42%' },
    anim: 'fl 3.5s ease-in-out infinite' },
  copywriter: { label: 'Menor', role: 'Copywriter', img: 'copywriter.png',
    tagPos: { top: '20%', right: '28%' },
    anim: 'tl 6s ease-in-out infinite' },
  ilustrador: { label: 'Wildson', role: 'Ilustrador', img: 'analista.png',
    tagPos: { top: '30%', right: '15%' },
    anim: 'bf 3s ease-in-out infinite' },
};

export default function AgentRoom({ state }: { state: AppState }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes bs{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes sw{0%,100%{transform:translateX(0) rotate(0deg)}33%{transform:translateX(-3px) rotate(-.5deg)}66%{transform:translateX(3px) rotate(.5deg)}}
        @keyframes fl{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.01)}}
        @keyframes tl{0%,100%{transform:rotate(0deg) translateY(0)}25%{transform:rotate(.8deg) translateY(-2px)}75%{transform:rotate(-.8deg) translateY(-4px)}}
        @keyframes bf{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes hdp{0%,100%{opacity:.85;filter:brightness(1)}50%{opacity:1;filter:brightness(1.25)}}
        @keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 6px rgba(151,85,255,0.3))}50%{filter:drop-shadow(0 0 18px rgba(151,85,255,0.7))}}
      `}</style>

      {/* Background */}
      <img src="/personagens/bgescritorio.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />

      {/* Mesa central com holo glow */}
      <img src="/personagens/mesacentral.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 4, animation: 'hdp 2.5s ease-in-out infinite' }} />

      {/* Characters */}
      {Object.entries(AGENTS).map(([name, cfg], i) => {
        const a = state.agents[name];
        const isWorking = a?.status === 'working';
        return (
          <img key={name} src={`/personagens/${cfg.img}`} alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              zIndex: 5 + i,
              animation: isWorking ? `${cfg.anim}, glowPulse 1.5s ease-in-out infinite` : cfg.anim,
            }}
          />
        );
      })}

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 16, pointerEvents: 'none', opacity: 0.025, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />

      {/* Agent Tags — único card por agente */}
      {Object.entries(AGENTS).map(([name, cfg]) => {
        const a = state.agents[name];
        const status = a?.status || 'idle';
        const isActive = status === 'working' || status === 'waiting';
        const isDone = status === 'done';

        const borderColor = isActive ? '#9755FF' : isDone ? 'rgba(34,214,135,0.4)' : 'rgba(100,100,120,0.3)';
        const bgColor = isActive ? 'rgba(151,85,255,0.18)' : 'rgba(30,25,45,0.75)';
        const shadow = isActive ? '0 0 20px rgba(151,85,255,0.35)' : 'none';
        const dotBg = isActive ? '#9755FF' : isDone ? '#22d687' : '#555';
        const dotShadow = isActive ? '0 0 8px #9755FF' : isDone ? '0 0 8px #22d687' : 'none';
        const dotAnim = isActive ? 'dotPulse 1.5s infinite' : 'none';
        const msgColor = isActive ? '#c49aff' : '#666';

        return (
          <div key={`tag-${name}`} style={{ position: 'absolute', ...cfg.tagPos, zIndex: 25 }}>
            <div style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 8, padding: '6px 12px',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              boxShadow: shadow,
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#fff' : '#aaa', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: dotBg, boxShadow: dotShadow, animation: dotAnim }} />
                {cfg.label}
              </div>
              <div style={{ fontSize: 9, color: isActive ? '#9980cc' : '#666', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{cfg.role}</div>
              {a?.message && (
                <div style={{ fontSize: 9, color: msgColor, fontFamily: "'DM Mono', monospace", marginTop: 3 }}>{a.message}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
