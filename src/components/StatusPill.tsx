'use client';
import type { Status } from '@/types';

const STATUS_MAP: Record<Status, { label: string; color: string }> = {
  owned:   { label: '소장',     color: '#00bf40' },
  planned: { label: '구입예정', color: '#f59e0b' },
  wanted:  { label: '원해요',   color: '#ef4444' },
  none:    { label: '미정',     color: '#70737c' },
  ordered: { label: '미배송',   color: '#f97316' },
};

export default function StatusPill({ status }: { status: Status | null | undefined }) {
  if (!status || !STATUS_MAP[status]) return null;
  const { label, color } = STATUS_MAP[status];
  return (
    <span
      style={{
        height: 19,
        padding: '0 7px',
        borderRadius: 100,
        fontSize: 10,
        fontWeight: 700,
        background: `${color}22`,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}
