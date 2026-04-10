'use client';

import { AppState } from '@/lib/state';

// Mapeamento: nosso agente → imagem do personagem + posição da tag (do agentroom original)
const AGENTS: Record<string, { label: string; role: string; img: string; tagPos: React.CSSProperties; bubPos: React.CSSProperties; anim: string }> = {
  orquestrador: { label: 'Craudin The Boss', role: 'Orquestrador', img: 'boss.png',
    tagPos: { bottom: '32%', left: '34%' }, bubPos: { bottom: '38%', left: '34%' },
    anim: 'bs 4s ease-in-out infinite' },
  estrategista: { label: 'Kako', role: 'Estrategista', img: 'estrategista.png',
    tagPos: { top: '18%', left: '4%' }, bubPos: { top: '12%', left: '4%' },
    anim: 'sw 5s ease-in-out infinite' },
  designer: { label: 'Jorge Macaco', role: 'Designer', img: 'Designer.png',
    tagPos: { top: '14%', left: '42%' }, bubPos: { top: '8%', left: '42%' },
    anim: 'fl 3.5s ease-in-out infinite' },
  copywriter: { label: 'Menor', role: 'Copywriter', img: 'copywriter.png',
    tagPos: { top: '20%', right: '28%' }, bubPos: { top: '14%', right: '28%' },
    anim: 'tl 6s ease-in-out infinite' },
  ilustrador: { label: 'Wildson', role: 'Ilustrador', img: 'analista.png',
    tagPos: { top: '30%', right: '15%' }, bubPos: { top: '24%', right: '15%' },
    anim: 'bf 3s ease-in-out infinite' },
};

const DOT_STYLES: Record<string, React.CSSProperties> = {
  idle: { background: '#555', boxShadow: 'none' },
  working: { background: '#9755FF', boxShadow: '0 0 8px #9755FF', animation: 'dotPulse 1.5s infinite' },
  done: { background: '#22d687', boxShadow: '0 0 8px #22d687' },
  waiting: { background: '#f5a623', boxShadow: '0 0 8px #f5a623', animation: 'dotPulse 2s infinite' },
  error: { background: '#e94560', boxShadow: '0 0 8px #e94560' },
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

      {/* Characters — each as full-size layer with animation */}
      {Object.entries(AGENTS).map(([name, cfg], i) => {
        const a = state.agents[name];
        const isWorking = a?.status === 'working';
        return (
          <img
            key={name}
            src={`/personagens/${cfg.img}`}
            alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              zIndex: 5 + i,
              animation: cfg.anim,
              filter: isWorking ? undefined : undefined,
              ...(isWorking ? { animation: `${cfg.anim}, glowPulse 1.5s ease-in-out infinite` } : {})
            }}
          />
        );
      })}

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 16, pointerEvents: 'none', opacity: 0.025, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />

      {/* Agent Tags */}
      {Object.entries(AGENTS).map(([name, cfg]) => {
        const a = state.agents[name];
        const isActive = a?.status === 'working' || a?.status === 'waiting';
        return (
          <div key={`tag-${name}`} style={{ position: 'absolute', ...cfg.tagPos, zIndex: 25, cursor: 'pointer' }}>
            <div style={{
              background: isActive ? 'rgba(151,85,255,0.22)' : 'rgba(0,0,0,0.78)',
              border: `1px solid ${isActive ? '#9755FF' : 'rgba(151,85,255,0.5)'}`,
              borderRadius: 8, padding: '5px 10px', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 0 16px rgba(151,85,255,0.4)' : 'none',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, ...(DOT_STYLES[a?.status || 'idle'] || DOT_STYLES.idle) }} />
                {cfg.label}
              </div>
              <div style={{ fontSize: 9, color: '#8b84a8', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>{cfg.role}</div>
              <div style={{ fontSize: 9, color: isActive ? '#c49aff' : '#8b84a8', fontFamily: "'DM Mono', monospace", marginTop: 3 }}>{a?.message || ''}</div>
            </div>
          </div>
        );
      })}

      {/* Bubbles */}
      {Object.entries(AGENTS).map(([name, cfg]) => {
        const a = state.agents[name];
        const show = a?.status === 'working' || a?.status === 'waiting';
        return (
          <div key={`bub-${name}`} style={{
            position: 'absolute', ...cfg.bubPos, zIndex: 30, pointerEvents: 'none',
            opacity: show ? 1 : 0, transform: show ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.9)',
            transition: 'opacity 0.3s, transform 0.3s'
          }}>
            <div style={{ background: 'rgba(8,6,18,0.93)', border: '1px solid rgba(151,85,255,0.5)', borderRadius: 10, padding: '8px 12px', maxWidth: 220, fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontFamily: "'DM Mono', monospace", boxShadow: '0 0 20px rgba(151,85,255,0.25)', position: 'relative' }}>
              <div style={{ fontSize: 9, color: '#9755FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{cfg.label}</div>
              {a?.message || '...'}
              <div style={{ position: 'absolute', bottom: -6, left: 16, width: 10, height: 6, background: 'rgba(8,6,18,0.93)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
