'use client';
import { useAppStore, useStatusCounts } from '@/store/useAppStore';
import type { Status } from '@/types';

const CHIPS: { key: Status | 'all'; label: string; color: string }[] = [
  { key: 'all',     label: '전체',     color: 'var(--accent)' },
  { key: 'owned',   label: '소장',     color: 'var(--owned)' },
  { key: 'planned', label: '구입예정', color: 'var(--planned)' },
  { key: 'wanted',  label: '원해요',   color: 'var(--wanted)' },
  { key: 'none',    label: '미정',     color: 'var(--none)' },
  { key: 'ordered', label: '미배송',   color: 'var(--ordered)' },
];

export default function StatsBar() {
  const filter = useAppStore((s) => s.filter);
  const setFilter = useAppStore((s) => s.setFilter);
  const counts = useStatusCounts();

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border2)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '8px 14px',
          width: 'max-content',
        }}
      >
        {CHIPS.map(({ key, label, color }) => {
          const active = filter.status === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => setFilter({ status: key })}
              style={{
                height: 30,
                padding: '0 10px',
                borderRadius: 100,
                border: active ? 'none' : `1px solid ${color}`,
                background: active ? color : `${color}22`,
                color: active ? 'white' : color,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {label}
              <span style={{ opacity: active ? 0.85 : 1, fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 0.5 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
