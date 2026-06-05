'use client';
import { useEffect } from 'react';
import PocaImage from './PocaImage';
import StatusPill from './StatusPill';
import { useAppStore } from '@/store/useAppStore';
import type { PocaCard } from '@/types';

interface Props {
  card: PocaCard;
  inPhotobook: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}

const FIELD_PURPLE = '#7c3aed';

function FieldCell({ label, value, fullWidth }: { label: string; value: string | null | undefined; fullWidth?: boolean }) {
  if (!value) return null;
  return (
    <div style={{
      background: 'var(--surface2)',
      borderRadius: 9,
      padding: '10px 12px',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-dim)', fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

export default function DetailModal({ card, inPhotobook, onAdd, onRemove, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const memberLabel = card.members.join(', ') || '—';

  const fields = [
    { label: '멤버',   value: memberLabel },
    { label: '매체',   value: card.cat1 },
    { label: '종류',   value: card.cat2 ?? card.kind },
    { label: '발매',   value: card.date ?? card.year },
    { label: '출처',   value: card.origin },
    { label: '구입처', value: card.source ?? card.note },
  ].filter((f) => f.value);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,15,18,0.48)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          background: 'var(--surface)',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.18)',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 16px', flexShrink: 0 }}>
          <div style={{ width: 38, height: 4, borderRadius: 100, background: 'var(--border)' }} />
        </div>

        {/* 상단 — 이미지 + 기본 정보 */}
        <div style={{ display: 'flex', gap: 14, padding: '0 16px 18px', flexShrink: 0 }}>
          {/* 이미지 */}
          <div style={{ width: 112, flexShrink: 0 }}>
            <PocaImage
              src={card.imageUrl}
              memberName={memberLabel}
              radius={12}
              showNameOverlay={false}
            />
          </div>

          {/* 텍스트 */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <StatusPill status={card.status} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{card.name}</p>
            {card.album && (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{card.album}</p>
            )}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
              {card.members.map((m) => (
                <span key={m} style={{ height: 18, padding: '0 6px', borderRadius: 4, background: '#7c3aed18', color: FIELD_PURPLE, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                  {m}
                </span>
              ))}
              {(card.cat2 ?? card.kind) && (
                <span style={{ height: 18, padding: '0 6px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: 10, display: 'inline-flex', alignItems: 'center' }}>
                  {card.cat2 ?? card.kind}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2열 상세 필드 */}
        {fields.length > 0 && (
          <div style={{ padding: '0 16px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {fields.map((f, i) => {
                const isLast = i === fields.length - 1;
                const isOddTotal = fields.length % 2 !== 0;
                return (
                  <FieldCell
                    key={f.label}
                    label={f.label}
                    value={f.value}
                    fullWidth={isLast && isOddTotal}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 포토북 버튼 */}
        <div style={{ padding: '0 16px 28px', flexShrink: 0 }}>
          <button
            onClick={inPhotobook ? onRemove : onAdd}
            style={{
              width: '100%',
              height: 50,
              borderRadius: 14,
              border: 'none',
              background: inPhotobook ? '#fee2e2' : 'var(--accent)',
              color: inPhotobook ? '#e53e3e' : 'white',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: inPhotobook ? 'none' : '0 4px 20px rgba(37,99,235,0.28)',
            }}
          >
            {inPhotobook ? '포토북에서 제거' : '포토북에 담기'}
          </button>
        </div>
      </div>
    </div>
  );
}
