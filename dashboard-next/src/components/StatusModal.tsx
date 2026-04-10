'use client';

import { useEffect, useState } from 'react';

interface ClientOverview {
  name: string;
  slug: string;
  logo: string;
  briefs: number;
  copys: number;
  artes: number;
  exports: number;
  totalPosts: number;
}

interface StatusModalProps {
  onClose: () => void;
  onClientSelect: (slug: string) => void;
}

function getBarColor(value: number, total: number): string {
  if (total === 0 || value === 0) return '#333';
  if (value >= total) return '#4ade80';
  return '#9755FF';
}

function ProgressBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  const color = getBarColor(value, total);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10, color: '#9980cc', marginBottom: 3,
        fontFamily: "'DM Mono', monospace",
      }}>
        <span>{label}</span>
        <span>{value}/{total}</span>
      </div>
      <div style={{
        width: '100%', height: 6, borderRadius: 3,
        background: 'rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: color,
          transition: 'width 300ms ease',
        }} />
      </div>
    </div>
  );
}

export default function StatusModal({ onClose, onClientSelect }: StatusModalProps) {
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/clients/overview')
      .then(res => res.json())
      .then((data: ClientOverview[]) => setClients(data))
      .catch(() => {});
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handleClientClick = async (slug: string) => {
    try {
      await fetch('/api/clients/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
    } catch {}
    onClientSelect(slug);
    close();
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
          width: 520,
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
        {/* Header */}
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#c49aff',
          marginBottom: 6,
          fontFamily: "'DM Mono', monospace",
        }}>
          Status de Produção
        </div>
        <div style={{
          fontSize: 10, color: '#9980cc', textTransform: 'capitalize',
          marginBottom: 20, paddingBottom: 14,
          borderBottom: '1px solid rgba(151,85,255,0.1)',
        }}>
          {currentMonth}
        </div>

        {/* Client cards */}
        {clients.length === 0 && (
          <div style={{ fontSize: 12, color: '#555', textAlign: 'center', padding: 20 }}>
            Nenhum cliente encontrado
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clients.map(client => (
            <div
              key={client.slug}
              onClick={() => handleClientClick(client.slug)}
              style={{
                padding: 16, borderRadius: 8,
                background: 'rgba(151,85,255,0.08)',
                border: '1px solid rgba(151,85,255,0.15)',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(151,85,255,0.18)';
                e.currentTarget.style.borderColor = 'rgba(151,85,255,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(151,85,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(151,85,255,0.15)';
              }}
            >
              {/* Client name + logo + month */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'rgba(151,85,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#9755FF',
                  fontFamily: "'DM Mono', monospace",
                  flexShrink: 0,
                }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#e0d0ff',
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {client.name}
                  </div>
                  <div style={{
                    fontSize: 9, color: '#9980cc', textTransform: 'capitalize',
                  }}>
                    {currentMonth}
                  </div>
                </div>
              </div>

              {/* Progress bars */}
              <ProgressBar label="Planejamento" value={client.briefs} total={client.totalPosts} />
              <ProgressBar label="Copys" value={client.copys} total={client.totalPosts} />
              <ProgressBar label="Artes" value={client.artes} total={client.totalPosts} />
              <ProgressBar label="Exports" value={client.exports} total={client.totalPosts} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
