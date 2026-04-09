'use client';

export default function TopBar({ pipeline, connected }: { pipeline: string; connected: boolean }) {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-[20]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
      <img src="/logo.png" alt="SalvaTech" className="h-10" />
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 border border-white/10 rounded-full text-[11px] font-mono text-white/50 bg-black/50 backdrop-blur-lg">
          <span className={`w-[7px] h-[7px] rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_#22d687]' : 'bg-red-500 shadow-[0_0_8px_#e94560]'}`} />
          {connected ? 'online' : 'offline'}
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 border border-white/10 rounded-full text-[11px] font-mono text-white/50 bg-black/50 backdrop-blur-lg">
          <span className="w-[7px] h-[7px] rounded-full bg-purple-500 shadow-[0_0_8px_#9755FF] animate-pulse" />
          {pipeline}
        </div>
      </div>
    </div>
  );
}
