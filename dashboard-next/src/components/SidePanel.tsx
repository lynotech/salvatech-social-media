'use client';

import { AppState } from '@/lib/state';

const STEP_NAMES: Record<string, string> = {
  1: 'Pesquisa', 2: 'Aprovação', 3: 'Copy', 4: 'Aprovação', 5: 'Ilustrador', 6: 'Designer', 7: 'Render'
};

export default function SidePanel({ state }: { state: AppState }) {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[170px] flex flex-col gap-1.5 p-3 z-[25]">
      {Object.entries(state.steps).map(([num, st]) => {
        const active = st === 'active' || st === 'working';
        const done = st === 'done';
        const fill = done ? 100 : active ? 50 : 0;
        const color = done ? '#22d687' : '#9755FF';
        return (
          <div key={num} className={`bg-black/70 border rounded-[10px] px-2.5 py-2 backdrop-blur-xl transition-all cursor-pointer ${active ? 'border-purple-500 bg-purple-500/15 shadow-[0_0_14px_rgba(151,85,255,0.3)]' : 'border-white/10 hover:border-purple-500/50'}`}>
            <div className="text-[11px] font-bold text-white">{num}. {STEP_NAMES[num]}</div>
            <div className="text-[9px] text-[#8b84a8] font-mono mt-0.5">{st}</div>
            <div className="h-[2px] bg-white/[0.08] rounded-sm mt-1.5 overflow-hidden">
              <div className="h-full rounded-sm transition-all duration-600" style={{ width: `${fill}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
