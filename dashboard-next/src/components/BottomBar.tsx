'use client';

const OPTIONS = [
  { group: 'Mensal', items: [{ value: 'planejamento', label: 'Planejamento completo' }, { value: 'copys', label: 'Gerar copys' }] },
  { group: 'Semanal', items: [{ value: 'artes', label: 'Artes (2 posts)' }, { value: 'arte1', label: 'Arte post 1' }, { value: 'arte2', label: 'Arte post 2' }] },
  { group: 'Teste', items: [{ value: 'teste', label: '1 post completo' }] },
];

export default function BottomBar({ lastLog }: { lastLog: string }) {
  const run = () => {
    const sel = (document.getElementById('cmd-select') as HTMLSelectElement)?.value;
    if (sel) fetch('/api/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: sel }) });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3 z-[25]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
      <div className="font-mono text-[10px] text-white/40 max-w-[500px] truncate">{lastLog}</div>
      <div className="flex items-center gap-1.5">
        <select id="cmd-select" className="px-2.5 py-1.5 pr-7 rounded-md bg-black/60 border border-purple-500/20 text-purple-300 font-mono text-[10px] outline-none cursor-pointer backdrop-blur-lg appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239755FF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
          {OPTIONS.map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </optgroup>
          ))}
        </select>
        <button onClick={run} className="px-4 py-1.5 rounded-md bg-purple-600 text-white font-mono text-[10px] font-medium hover:bg-purple-700 transition-colors">▶</button>
      </div>
    </div>
  );
}
