'use client';

interface BottomBarProps {
  onOpenGear: () => void;
  onOpenStatus: () => void;
}

export default function BottomBar({ onOpenGear, onOpenStatus }: BottomBarProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '10px 20px', zIndex: 25,
      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onOpenGear}
          title="Configurações"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.5)',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(151,85,255,0.5)';
            e.currentTarget.style.color = '#c49aff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          ⚙
        </button>
        <button
          onClick={onOpenStatus}
          title="Status dos clientes"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.5)',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(151,85,255,0.5)';
            e.currentTarget.style.color = '#c49aff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          📊
        </button>
      </div>
    </div>
  );
}
