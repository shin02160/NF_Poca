'use client';
import PocaImage from './PocaImage';
import StatusPill from './StatusPill';
import type { PocaCard } from '@/types';

interface Props {
  card: PocaCard;
  inPhotobook: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onDetail: () => void;
}

export default function ListItem({ card, inPhotobook, onAdd, onRemove, onDetail }: Props) {
  const memberLabel = card.members.join(' · ') || '—';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onClick={onDetail}
    >
      {/* 썸네일 44px */}
      <div style={{ width: 44, flexShrink: 0 }}>
        <PocaImage src={card.imageUrl} memberName={memberLabel} radius={8} showNameOverlay={false} />
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {[card.album, card.date ?? card.year].filter(Boolean).join(' · ')}
        </p>
        <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
          {card.members.slice(0, 2).map((m) => (
            <span key={m} style={{ height: 18, padding: '0 6px', borderRadius: 4, background: '#7c3aed18', color: '#7c3aed', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
              {m}
            </span>
          ))}
          {card.cat2 && (
            <span style={{ height: 18, padding: '0 6px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: 10, display: 'inline-flex', alignItems: 'center' }}>
              {card.cat2}
            </span>
          )}
        </div>
      </div>

      {/* 상태 pill + 담기 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <StatusPill status={card.status} />
        <button
          onClick={(e) => { e.stopPropagation(); inPhotobook ? onRemove() : onAdd(); }}
          style={{
            height: 26,
            padding: '0 10px',
            borderRadius: 100,
            border: `1.5px solid ${inPhotobook ? '#e53e3e' : 'var(--accent)'}`,
            background: 'var(--surface)',
            color: inPhotobook ? '#e53e3e' : 'var(--accent)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {inPhotobook ? '✕ 제거' : '+ 담기'}
        </button>
      </div>
    </div>
  );
}
