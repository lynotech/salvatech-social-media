'use client';

interface BottomBarProps {
  onOpenGear: () => void;
  onOpenStatus: () => void;
}

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 48, height: 48, borderRadius: 24,
  border: '1px solid rgba(151,85,255,0.25)',
  background: 'rgba(10,4,20,0.65)',
  backdropFilter: 'blur(12px)',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.45)',
  transition: 'border-color 0.2s, color 0.2s, background 0.2s, box-shadow 0.2s',
};

export default function BottomBar({ onOpenGear, onOpenStatus }: BottomBarProps) {
  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(151,85,255,0.6)';
    e.currentTarget.style.color = '#c49aff';
    e.currentTarget.style.background = 'rgba(151,85,255,0.12)';
    e.currentTarget.style.boxShadow = '0 0 16px rgba(151,85,255,0.2)';
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(151,85,255,0.25)';
    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
    e.currentTarget.style.background = 'rgba(10,4,20,0.65)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '16px 24px', zIndex: 25,
      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onOpenGear} title="Ações" style={btnStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <PlayIcon />
        </button>
        <button onClick={onOpenStatus} title="Status dos clientes" style={btnStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <ChartIcon />
        </button>
      </div>
    </div>
  );
}
