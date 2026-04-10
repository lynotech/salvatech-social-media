'use client';

import { CheckpointData } from '@/lib/state';
import { useState } from 'react';

interface CheckpointModalProps {
  checkpoint: CheckpointData;
  activeClient: string | null;
  onClose: () => void;
}

export default function CheckpointModal({ checkpoint, activeClient, onClose }: CheckpointModalProps) {
  const [feedback, setFeedback] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Auto-detect: if question looks like onboarding or asks for input, use text mode
  const q = (checkpoint.question || '').toLowerCase();
  const isOnboarding = q.includes('pergunta') || q.includes('onboarding') || q.includes('nome da empresa')
    || q.includes('cores da marca') || q.includes('fontes') || q.includes('estrategia de imagem')
    || q.includes('canais') || q.includes('posts por') || q.includes('pilares')
    || q.includes('publico') || q.includes('tom de voz') || q.includes('topicos');
  const checkpointType = checkpoint.type ?? (isOnboarding ? 'text' : 'approval');

  const respondToCheckpoint = (approved: boolean, feedbackText: string) => {
    const url = activeClient
      ? `/api/clients/${activeClient}/checkpoint/respond`
      : '/api/checkpoint/respond';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, feedback: feedbackText }),
    }).then(onClose);
  };

  const handleApprove = () => respondToCheckpoint(true, feedback.trim());
  const handleAdjust = () => {
    if (!feedback.trim()) return;
    respondToCheckpoint(false, feedback.trim());
  };
  const handleTextSubmit = () => {
    if (!feedback.trim()) return;
    respondToCheckpoint(true, feedback.trim());
  };
  const handleChoiceSelect = (option: string) => {
    setSelectedOption(option);
    respondToCheckpoint(true, option);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        background: 'rgba(17,8,32,0.95)',
        border: '1px solid rgba(151,85,255,0.4)',
        borderRadius: 14,
        padding: '28px 32px',
        width: 520,
        maxWidth: '92vw',
        maxHeight: '82vh',
        overflowY: 'auto',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 60px rgba(151,85,255,0.2), 0 4px 30px rgba(0,0,0,0.5)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 20, paddingBottom: 14,
          borderBottom: '1px solid rgba(151,85,255,0.15)',
        }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%',
            background: '#f5a623', boxShadow: '0 0 10px #f5a623',
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Inter, Syne, sans-serif', letterSpacing: '0.01em' }}>
            {isOnboarding ? 'Onboarding' : 'Checkpoint'}
          </span>
        </div>

        {/* Question */}
        <div style={{
          fontSize: 14, color: '#e0d0ff', lineHeight: 1.7,
          marginBottom: 24,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
        }}>
          {checkpoint.question}
        </div>

        {/* Items — clicáveis (clique preenche o campo de resposta) */}
        {checkpoint.items?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {checkpoint.items.map((item, i) => {
              const isShort = item.length < 50;
              return (
                <div key={i}
                  onClick={() => {
                    if (isShort) {
                      setFeedback(item);
                      respondToCheckpoint(true, item);
                    }
                  }}
                  style={{
                    background: 'rgba(151,85,255,0.06)',
                    border: '1px solid rgba(151,85,255,0.12)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 12,
                    color: '#c49aff',
                    lineHeight: 1.7,
                    fontFamily: 'Inter, sans-serif',
                    cursor: isShort ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (isShort) { e.currentTarget.style.background = 'rgba(151,85,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(151,85,255,0.35)'; }}}
                  onMouseLeave={e => { if (isShort) { e.currentTarget.style.background = 'rgba(151,85,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(151,85,255,0.12)'; }}}
                >
                  {item}
                </div>
              );
            })}
          </div>
        )}

        {/* Text input mode (onboarding or explicit) */}
        {checkpointType === 'text' && (
          <>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Digite sua resposta..."
              autoFocus
              style={{
                width: '100%', minHeight: 80, padding: 14, borderRadius: 10,
                background: 'rgba(10,4,20,0.6)', border: '1px solid rgba(151,85,255,0.2)',
                color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical',
                marginBottom: 18, fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(151,85,255,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(151,85,255,0.2)'}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!feedback.trim()}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 10,
                background: feedback.trim() ? 'rgba(151,85,255,0.18)' : 'rgba(151,85,255,0.06)',
                border: `1px solid ${feedback.trim() ? 'rgba(151,85,255,0.5)' : 'rgba(151,85,255,0.15)'}`,
                color: feedback.trim() ? '#e0d0ff' : '#666',
                fontSize: 13, fontWeight: 600, cursor: feedback.trim() ? 'pointer' : 'default',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              Enviar
            </button>
          </>
        )}

        {/* Multiple choice mode */}
        {checkpointType === 'choice' && checkpoint.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checkpoint.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChoiceSelect(option)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                  background: selectedOption === option ? 'rgba(151,85,255,0.2)' : 'rgba(151,85,255,0.06)',
                  border: `1px solid ${selectedOption === option ? 'rgba(151,85,255,0.5)' : 'rgba(151,85,255,0.12)'}`,
                  color: selectedOption === option ? '#e0d0ff' : '#9980cc',
                  fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Approval mode (default) */}
        {checkpointType === 'approval' && (
          <>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Sugestão de ajuste (opcional)..."
              style={{
                width: '100%', minHeight: 80, padding: 14, borderRadius: 10,
                background: 'rgba(10,4,20,0.6)', border: '1px solid rgba(151,85,255,0.2)',
                color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical',
                marginBottom: 18, fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(151,85,255,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(151,85,255,0.2)'}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleApprove}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  background: 'rgba(34,214,135,0.1)', border: '1px solid rgba(34,214,135,0.3)',
                  color: '#22d687', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,214,135,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,214,135,0.1)'}
              >
                Aprovar
              </button>
              <button
                onClick={handleAdjust}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                  color: '#f5a623', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,166,35,0.1)'}
              >
                Pedir ajuste
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
