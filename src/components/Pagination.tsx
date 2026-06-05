'use client';

interface Props {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const btn = (label: React.ReactNode, target: number, active = false, disabled = false) => (
    <button
      key={String(label)}
      onClick={() => !disabled && onChange(target)}
      disabled={disabled}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: 'none',
        background: active ? 'var(--accent)' : 'var(--surface2)',
        color: active ? 'white' : disabled ? 'var(--text-dim)' : 'var(--text-muted)',
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: '10px 0 14px',
      flexShrink: 0,
      background: 'var(--bg)',
    }}>
      {btn('←', page - 1, false, page === 1)}
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`ellipsis-${i}`} style={{ width: 28, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>…</span>
          : btn(p, p as number, p === page)
      )}
      {btn('→', page + 1, false, page === totalPages)}
    </div>
  );
}
