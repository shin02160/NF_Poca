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

export default function GridItem({ card, inPhotobook, onAdd, onRemove, onDetail }: Props) {
  const memberLabel = card.members.join(' · ') || '—';

  return (
    <div onClick={onDetail} style={{ cursor: 'pointer', width: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '150%',
          borderRadius: 9,
          overflow: 'hidden',
          outline: inPhotobook ? '2.5px solid var(--accent)' : 'none',
          outlineOffset: -2,
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <PocaImage src={card.imageUrl} memberName={memberLabel} radius={0} showNameOverlay />
        </div>

        {/* 상태 pill */}
        {card.status && (
          <div style={{ position: 'absolute', top: 5, left: 5, zIndex: 2 }}>
            <StatusPill status={card.status} />
          </div>
        )}

        {/* 담기 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); inPhotobook ? onRemove() : onAdd(); }}
          style={{
            position: 'absolute',
            bottom: 6,
            right: 4,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: inPhotobook ? '#e53e3e' : 'var(--accent)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
            border: 'none',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          {inPhotobook ? '✕' : '+'}
        </button>
      </div>

      {/* 카드명 */}
      <p style={{ margin: '5px 0 1px', fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {card.name}
      </p>
      {/* 앨범명 */}
      {card.album && (
        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.album}
        </p>
      )}
      {/* 태그 */}
      <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
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
  );
}
