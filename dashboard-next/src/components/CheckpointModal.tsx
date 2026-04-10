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

  const checkpointType = checkpoint.type ?? 'approval';

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
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'rgba(151,85,255,0.14)',
        border: '1px solid #9755FF',
        borderRadius: 12,
        padding: '24px 28px',
        width: 480,
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflowY: 'auto',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 40px rgba(151,85,255,0.25)',
        fontFamily: "'DM Mono', monospace",
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 16, paddingBottom: 12,
          borderBottom: '1px solid rgba(151,85,255,0.2)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#f5a623', boxShadow: '0 0 8px #f5a623',
            animation: 'dotPulse 2s infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
            Checkpoint
          </span>
        </div>

        {/* Question */}
        <div style={{
          fontSize: 13, color: '#e0d0ff', lineHeight: 1.6,
          marginBottom: 20,
        }}>
          {checkpoint.question}
        </div>

        {/* Items */}
        {checkpoint.items?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {checkpoint.items.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(30,20,50,0.7)',
                border: '1px solid rgba(151,85,255,0.15)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 11,
                color: '#c49aff',
                lineHeight: 1.6,
              }}>
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Text input mode */}
        {checkpointType === 'text' && (
          <>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Digite sua resposta..."
              style={{
                width: '100%', minHeight: 70, padding: 12, borderRadius: 8,
                background: 'rgba(10,4,20,0.7)', border: '1px solid rgba(151,85,255,0.2)',
                color: '#fff', fontSize: 12, outline: 'none', resize: 'vertical',
                marginBottom: 16, fontFamily: "'DM Mono', monospace",
              }}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!feedback.trim()}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8,
                background: 'rgba(151,85,255,0.15)', border: '1px solid rgba(151,85,255,0.4)',
                color: '#c49aff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                opacity: feedback.trim() ? 1 : 0.4,
                fontFamily: "'DM Mono', monospace",
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
                  width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                  background: selectedOption === option ? 'rgba(151,85,255,0.2)' : 'rgba(30,20,50,0.7)',
                  border: `1px solid ${selectedOption === option ? 'rgba(151,85,255,0.5)' : 'rgba(151,85,255,0.15)'}`,
                  color: selectedOption === option ? '#e0d0ff' : '#9980cc',
                  fontSize: 12, cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
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
                width: '100%', minHeight: 70, padding: 12, borderRadius: 8,
                background: 'rgba(10,4,20,0.7)', border: '1px solid rgba(151,85,255,0.2)',
                color: '#fff', fontSize: 12, outline: 'none', resize: 'vertical',
                marginBottom: 16, fontFamily: "'DM Mono', monospace",
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleApprove}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 8,
                  background: 'rgba(34,214,135,0.12)', border: '1px solid rgba(34,214,135,0.35)',
                  color: '#22d687', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,214,135,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,214,135,0.12)'}
              >
                Aprovar
              </button>
              <button
                onClick={handleAdjust}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 8,
                  background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.35)',
                  color: '#f5a623', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,166,35,0.12)'}
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
