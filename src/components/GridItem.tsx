'use client';
import { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const memberLabel = card.members.join(' · ') || '—';
  const showFallback = !card.imageUrl || imgError;

  return (
    <div onClick={onDetail} style={{ cursor: 'pointer', width: '100%' }}>
      {/* aspect-ratio:3/4 + overflow:hidden 으로 크기 완전 고정 */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        borderRadius: 9,
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--surface2)',
        outline: inPhotobook ? '2.5px solid var(--accent)' : 'none',
        outlineOffset: -2,
      }}>
        {showFallback ? (
          <div style={{ position: 'absolute', inset: '0', background: '#dbeafe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/nflying-logo.png" alt="" style={{ width: '55%', filter: 'invert(1) sepia(1) saturate(6) hue-rotate(200deg) brightness(0.7)' }} />
            <p style={{ margin: 0, fontSize: 7, color: '#3b82f6', fontWeight: 500, textAlign: 'center', lineHeight: 1.4 }}>이미지<br />준비중</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.imageUrl!}
            alt={memberLabel}
            onError={() => setImgError(true)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
        )}

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
            position: 'absolute', bottom: 6, right: 4, width: 24, height: 24,
            borderRadius: '50%', background: inPhotobook ? '#e53e3e' : 'var(--accent)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.4)', border: 'none',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
          }}
        >
          {inPhotobook ? '✕' : '+'}
        </button>
      </div>

      {/* 카드명 */}
      <p style={{ margin: '5px 0 1px', fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {card.name}
      </p>
      {card.album && (
        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.album}
        </p>
      )}
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
