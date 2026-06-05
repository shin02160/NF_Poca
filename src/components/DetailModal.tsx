'use client';
import PocaImage from './PocaImage';
import type { PocaCard } from '@/types';

interface Props {
  card: PocaCard;
  inPhotobook: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function DetailModal({ card, inPhotobook, onAdd, onRemove, onClose }: Props) {
  const memberLabel = card.members.join(', ') || '—';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-dim)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 360,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* 이미지 */}
        <div style={{ width: 180, margin: '0 auto 16px' }}>
          <PocaImage src={card.imageUrl} memberName={memberLabel} radius={14} showNameOverlay={false} />
        </div>

        {/* 포카명 */}
        <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{card.name}</h2>

        {/* 메타데이터 */}
        <div
          style={{
            background: 'var(--color-bg)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
          }}
        >
          {[
            ['멤버', memberLabel],
            ['출처', card.album],
            ['종류', card.kind],
            ['발매', card.year],
            ['구입처', card.note],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-mid)', minWidth: 48 }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{value}</span>
              </div>
            ))}
        </div>

        {/* 포토북 버튼 */}
        <button
          onClick={inPhotobook ? onRemove : onAdd}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 14,
            border: 'none',
            background: inPhotobook ? '#fee2e2' : 'var(--color-primary)',
            color: inPhotobook ? '#e53e3e' : 'white',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 10,
            boxShadow: inPhotobook ? 'none' : '0 4px 20px rgba(51,102,255,0.28)',
          }}
        >
          {inPhotobook ? '포토북에서 제거' : '포토북에 담기'}
        </button>

        {/* 닫기 */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 12,
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-mid)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
