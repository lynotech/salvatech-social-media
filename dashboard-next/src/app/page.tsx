'use client';

import { useEffect, useState, useRef } from 'react';
import { AppState, defaultState } from '@/lib/state';
import AgentRoom from '@/components/AgentRoom';
import SidePanel from '@/components/SidePanel';
import TopBar from '@/components/TopBar';
import BottomBar from '@/components/BottomBar';
import CheckpointModal from '@/components/CheckpointModal';

export default function Home() {
  const [state, setState] = useState<AppState>(defaultState);
  const [connected, setConnected] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Polling fallback since Next.js doesn't natively support WS
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        const data = await res.json();
        setState(data);
        setConnected(true);

        if (data.checkpoint && !data.checkpoint.responded) {
          setShowCheckpoint(true);
        }
      } catch {
        setConnected(false);
      }
    }, 1500);

    return () => clearInterval(poll);
  }, []);

  const lastLog = state.log.length > 0 ? `${state.log[state.log.length - 1].time} ${state.log[state.log.length - 1].msg}` : 'aguardando...';

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative" style={{ fontFamily: "'Syne', sans-serif" }}>
      <AgentRoom state={state} />
      <SidePanel state={state} />
      <TopBar pipeline={state.pipeline} connected={connected} />
      <BottomBar lastLog={lastLog} />
      {showCheckpoint && state.checkpoint && (
        <CheckpointModal checkpoint={state.checkpoint} onClose={() => setShowCheckpoint(false)} />
      )}
    </main>
  );
}
