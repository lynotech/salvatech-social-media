'use client';

import { AppState } from '@/lib/state';

const AGENT_MAP: Record<string, { label: string; role: string; charId: string; tagPos: string; bubPos: string }> = {
  orquestrador: { label: 'Orquestrador', role: 'coordenação', charId: 'boss', tagPos: 'bottom-[58%] left-[32%]', bubPos: 'bottom-[64%] left-[32%]' },
  estrategista: { label: 'Estrategista', role: 'pesquisa · temas', charId: 'estrategista', tagPos: 'bottom-[54%] left-[3%]', bubPos: 'bottom-[60%] left-[3%]' },
  designer: { label: 'Designer', role: 'slides · render', charId: 'Designer', tagPos: 'bottom-[54%] left-[44%]', bubPos: 'bottom-[60%] left-[44%]' },
  copywriter: { label: 'Copywriter', role: 'copy · legendas', charId: 'copywriter', tagPos: 'bottom-[54%] right-[23%]', bubPos: 'bottom-[60%] right-[23%]' },
  ilustrador: { label: 'Ilustrador', role: 'imagens · arte', charId: 'analista', tagPos: 'bottom-[52%] right-[3%]', bubPos: 'bottom-[58%] right-[3%]' },
};

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-emerald-500 shadow-[0_0_8px_#22d687]',
  working: 'bg-purple-500 shadow-[0_0_8px_#9755FF] animate-pulse',
  done: 'bg-emerald-500 shadow-[0_0_8px_#22d687]',
  waiting: 'bg-amber-500 shadow-[0_0_8px_#f5a623]',
  error: 'bg-red-500 shadow-[0_0_8px_#e94560]',
};

export default function AgentRoom({ state }: { state: AppState }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <img src="/personagens/bgescritorio.png" alt="" className="absolute inset-0 w-full h-full object-cover z-[1]" />

      {/* Mesa */}
      <img src="/personagens/mesacentral.png" alt="" className="absolute inset-0 w-full h-full object-cover z-[4]" />

      {/* Characters — all same size layers */}
      {Object.entries(AGENT_MAP).map(([name, cfg]) => {
        const a = state.agents[name];
        const isWorking = a?.status === 'working';
        return (
          <img
            key={name}
            src={`/personagens/${cfg.charId}.png`}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover z-[6] transition-all duration-300 ${isWorking ? 'drop-shadow-[0_0_12px_rgba(151,85,255,0.6)]' : ''}`}
          />
        );
      })}

      {/* Effects */}
      <div className="absolute inset-0 z-[8] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)' }} />
      <div className="absolute inset-0 z-[10] pointer-events-none opacity-[0.02]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />

      {/* Agent Tags */}
      {Object.entries(AGENT_MAP).map(([name, cfg]) => {
        const a = state.agents[name];
        return (
          <div key={`tag-${name}`} className={`absolute ${cfg.tagPos} z-[25] cursor-pointer group`}>
            <div className="bg-black/80 border border-purple-500/50 rounded-lg px-2.5 py-1.5 backdrop-blur-md transition-all group-hover:bg-purple-500/20 group-hover:border-purple-500 group-hover:shadow-[0_0_16px_rgba(151,85,255,0.4)]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${STATUS_DOT[a?.status || 'idle']}`} />
                {cfg.label}
              </div>
              <div className="text-[9px] text-[#8b84a8] font-mono mt-0.5">{cfg.role}</div>
              <div className="text-[9px] text-[#8b84a8] font-mono mt-0.5">{a?.message || a?.status || 'idle'}</div>
            </div>
          </div>
        );
      })}

      {/* Bubbles */}
      {Object.entries(AGENT_MAP).map(([name, cfg]) => {
        const a = state.agents[name];
        const show = a?.status === 'working' || a?.status === 'waiting';
        return (
          <div key={`bub-${name}`} className={`absolute ${cfg.bubPos} z-[30] pointer-events-none transition-all duration-300 ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1.5 scale-90'}`}>
            <div className="bg-[#080612]/95 border border-purple-500/50 rounded-[10px] px-3 py-2 max-w-[220px] font-mono text-[11px] text-white/85 leading-relaxed shadow-[0_0_20px_rgba(151,85,255,0.2)] relative">
              <div className="text-[9px] text-purple-500 font-bold uppercase tracking-wider mb-1">{cfg.label}</div>
              {a?.message || '...'}
              <div className="absolute -bottom-1.5 left-4 w-2.5 h-1.5 bg-[#080612]/95" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
