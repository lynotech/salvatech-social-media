'use client';

import { useEffect, useState } from 'react';

interface ClientInfo {
  name: string;
  slug: string;
  logo: string;
}

interface GearModalProps {
  activeClient: string | null;
  onClose: () => void;
  onClientChange: (slug: string) => void;
}

const ACTIONS = [
  {
    section: 'Mensal',
    items: [
      { label: 'Planejamento completo', command: 'planejamento' },
      { label: 'Gerar copys', command: 'copys' },
    ],
  },
  {
    section: 'Semanal',
    items: [
      { label: 'Artes (2 posts)', command: 'artes' },
      { label: 'Arte post 1', command: 'arte1' },
      { label: 'Arte post 2', command: 'arte2' },
    ],
  },
  {
    section: 'Teste',
    items: [
      { label: '1 post completo', command: 'teste' },
    ],
  },
  {
    section: 'Cliente',
    items: [
      { label: 'Criar novo cliente', command: 'onboarding' },
    ],
  },
];

export default function GearModal({ activeClient, onClose, onClientChange }: GearModalProps) {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then((data: ClientInfo[]) => setClients(data))
      .catch(() => {});
    // Trigger fade-in on mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const selectedClient = clients.find(c => c.slug === activeClient);

  const handleClientChange = async (slug: string) => {
    onClientChange(slug);
    try {
      await fetch('/api/clients/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
    } catch {}
  };

  const handleAction = async (command: string) => {
    if (!activeClient) return;
    try {
      await fetch(`/api/clients/${activeClient}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
    } catch {}
    onClose();
  };

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#110820',
          border: '1px solid rgba(151,85,255,0.3)',
          borderRadius: 12,
          padding: 28,
          width: 420,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 80px rgba(151,85,255,0.1)',
          fontFamily: "'DM Mono', monospace",
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 200ms ease, opacity 200ms ease',
        }}
      >
        {/* Active client name */}
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#c49aff',
          marginBottom: 20, paddingBottom: 14,
          borderBottom: '1px solid rgba(151,85,255,0.1)',
          fontFamily: "'DM Mono', monospace",
        }}>
          {selectedClient ? selectedClient.name : 'Nenhum cliente selecionado'}
        </div>

        {/* Client selector dropdown */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: '#9980cc', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Cliente ativo
          </label>
          <select
            value={activeClient || ''}
            onChange={e => handleClientChange(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8,
              background: '#0a0414', border: '1px solid rgba(151,85,255,0.15)',
              color: '#fff', fontSize: 12, outline: 'none',
              fontFamily: "'DM Mono', monospace",
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>Selecione um cliente</option>
            {clients.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Action sections */}
        {ACTIONS.map(section => (
          <div key={section.section} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, color: '#9980cc', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 8,
            }}>
              {section.section}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.items.map(item => (
                <button
                  key={item.command}
                  onClick={() => handleAction(item.command)}
                  disabled={!activeClient}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: activeClient ? 'rgba(151,85,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(151,85,255,0.15)',
                    color: activeClient ? '#e0d0ff' : '#555',
                    fontSize: 12, textAlign: 'left',
                    cursor: activeClient ? 'pointer' : 'not-allowed',
                    fontFamily: "'DM Mono', monospace",
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!activeClient) return;
                    e.currentTarget.style.background = 'rgba(151,85,255,0.18)';
                    e.currentTarget.style.borderColor = 'rgba(151,85,255,0.4)';
                  }}
                  onMouseLeave={e => {
                    if (!activeClient) return;
                    e.currentTarget.style.background = 'rgba(151,85,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(151,85,255,0.15)';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
