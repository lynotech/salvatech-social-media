'use client';

import { useEffect, useState } from 'react';
import { AppState, defaultState } from '@/lib/state';
import AgentRoom from '@/components/AgentRoom';
import SidePanel from '@/components/SidePanel';
import TopBar from '@/components/TopBar';
import BottomBar from '@/components/BottomBar';
import LogPanel from '@/components/LogPanel';
import CheckpointModal from '@/components/CheckpointModal';
import GearModal from '@/components/GearModal';
import StatusModal from '@/components/StatusModal';

const STORAGE_KEY = 'activeClient';

export default function Home() {
  const [state, setState] = useState<AppState>(defaultState);
  const [connected, setConnected] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showGearModal, setShowGearModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeClient, setActiveClientState] = useState<string | null>(null);

  // Load activeClient from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setActiveClientState(stored);
  }, []);

  // Persist activeClient to localStorage whenever it changes
  const setActiveClient = (slug: string) => {
    setActiveClientState(slug);
    localStorage.setItem(STORAGE_KEY, slug);
  };

  // Poll state — use client-specific endpoint when activeClient is set
  useEffect(() => {
    let prevPipeline = '';
    const poll = setInterval(async () => {
      try {
        const url = activeClient
          ? `/api/clients/${activeClient}/state`
          : '/api/state';
        const res = await fetch(url);
        const data = await res.json();
        setState(data);
        setConnected(true);
        if (data.checkpoint && !data.checkpoint.responded) setShowCheckpoint(true);

        // Auto-reset agents 5s after pipeline finishes
        if (data.pipeline === 'done' && prevPipeline !== 'done') {
          setTimeout(() => {
            if (activeClient) {
              fetch(`/api/clients/${activeClient}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pipeline: 'idle',
                  agent: 'orquestrador', status: 'idle', message: '',
                }),
              });
              ['estrategista','copywriter','ilustrador','designer'].forEach(a => {
                fetch(`/api/clients/${activeClient}/status`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ agent: a, status: 'idle', message: '' }),
                });
              });
            }
          }, 5000);
        }
        prevPipeline = data.pipeline || '';
      } catch {
        setConnected(false);
      }
    }, 1500);
    return () => clearInterval(poll);
  }, [activeClient]);

  return (
    <main style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', position: 'relative', fontFamily: "'Syne', sans-serif" }}>
      <AgentRoom state={state} />
      <SidePanel state={state} />
      <TopBar pipeline={state.pipeline} connected={connected} />
      <LogPanel logs={state.log} />
      <BottomBar onOpenGear={() => setShowGearModal(true)} onOpenStatus={() => setShowStatusModal(true)} />
      {showCheckpoint && state.checkpoint && (
        <CheckpointModal checkpoint={state.checkpoint} activeClient={activeClient} onClose={() => setShowCheckpoint(false)} />
      )}
      {showGearModal && (
        <GearModal
          activeClient={activeClient}
          onClose={() => setShowGearModal(false)}
          onClientChange={setActiveClient}
        />
      )}
      {showStatusModal && (
        <StatusModal
          onClose={() => setShowStatusModal(false)}
          onClientSelect={setActiveClient}
        />
      )}
    </main>
  );
}
