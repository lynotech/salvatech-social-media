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
    <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center">
      <div className="bg-[#110820] border border-purple-500/30 rounded-xl p-7 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-[0_0_80px_rgba(151,85,255,0.1)]">
        <div className="text-sm font-bold text-amber-500 mb-5 pb-3.5 border-b border-purple-500/10">Checkpoint</div>
        <div className="text-sm text-purple-300 leading-relaxed mb-4">{checkpoint.question}</div>

        {/* Items list (shared across all types) */}
        {checkpoint.items?.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-4">
            {checkpoint.items.map((item, i) => (
              <div key={i} className="bg-[#0a0414]/60 border border-purple-500/10 rounded-md px-3 py-2.5 text-xs text-[#9980cc] leading-relaxed">{item}</div>
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
              className="w-full min-h-[60px] p-3 rounded-lg bg-[#0a0414]/80 border border-purple-500/15 text-white text-xs outline-none resize-y mb-4 placeholder:text-[#444] focus:border-purple-500"
            />
            <div className="flex gap-2.5">
              <button
                onClick={handleTextSubmit}
                disabled={!feedback.trim()}
                className="flex-1 py-2.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/25 text-xs font-semibold hover:bg-purple-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </>
        )}

        {/* Multiple choice mode */}
        {checkpointType === 'choice' && checkpoint.options && (
          <div className="flex flex-col gap-2">
            {checkpoint.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChoiceSelect(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-xs font-medium transition-colors ${
                  selectedOption === option
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                    : 'bg-[#0a0414]/60 border-purple-500/10 text-[#9980cc] hover:bg-purple-500/10 hover:border-purple-500/25'
                }`}
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
              placeholder="Sugestão de ajuste..."
              className="w-full min-h-[60px] p-3 rounded-lg bg-[#0a0414]/80 border border-purple-500/15 text-white text-xs outline-none resize-y mb-4 placeholder:text-[#444] focus:border-purple-500"
            />
            <div className="flex gap-2.5">
              <button
                onClick={handleApprove}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                Aprovar
              </button>
              <button
                onClick={handleAdjust}
                className="flex-1 py-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/25 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
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
