'use client';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

function ChevIcon() {
  return (
    <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
      <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

interface DropdownProps {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}

function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const active = !!value;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 30,
          padding: '0 8px',
          borderRadius: 7,
          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
          background: active ? '#2563eb14' : 'var(--surface2)',
          color: active ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        {value ?? label}
        <ChevIcon />
      </button>
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 9,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 20,
              minWidth: 120,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              style={{
                width: '100%',
                padding: '9px 12px',
                textAlign: 'left',
                border: 'none',
                background: !value ? 'var(--surface2)' : 'none',
                color: 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: !value ? 600 : 400,
              }}
            >
              전체
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  textAlign: 'left',
                  border: 'none',
                  background: value === opt ? 'var(--surface2)' : 'none',
                  color: value === opt ? 'var(--accent)' : 'var(--text)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: value === opt ? 600 : 400,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FilterBar() {
  const allCards = useAppStore((s) => s.allCards);
  const filter = useAppStore((s) => s.filter);
  const setFilter = useAppStore((s) => s.setFilter);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const [showSearch, setShowSearch] = useState(false);

  const memberOptions = useMemo(() =>
    [...new Set(allCards.flatMap((c) => c.members))].filter(Boolean).sort(),
    [allCards]
  );
  const cat1Options = useMemo(() =>
    [...new Set(allCards.map((c) => c.cat1).filter(Boolean) as string[])].sort(),
    [allCards]
  );
  const yearOptions = useMemo(() =>
    [...new Set(allCards.map((c) => c.year).filter(Boolean) as string[])].sort((a, b) => b.localeCompare(a)),
    [allCards]
  );
  const originOptions = useMemo(() =>
    [...new Set(allCards.map((c) => c.origin).filter(Boolean) as string[])].sort((a, b) => b.localeCompare(a)),
    [allCards]
  );

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {/* 검색 */}
      {showSearch ? (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input
            autoFocus
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            onBlur={() => { if (!filter.search) setShowSearch(false); }}
            placeholder="검색"
            style={{
              width: 110,
              height: 30,
              borderRadius: 7,
              border: '1px solid var(--accent)',
              background: '#2563eb0a',
              padding: '0 10px',
              fontSize: 12,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SearchIcon />
        </button>
      )}

      <Dropdown
        label="멤버"
        value={filter.members[0] ?? null}
        options={memberOptions}
        onChange={(v) => setFilter({ members: v ? [v] : [] })}
      />
      <Dropdown
        label="매체"
        value={filter.cat1}
        options={cat1Options}
        onChange={(v) => setFilter({ cat1: v })}
      />
      <Dropdown
        label="발매년"
        value={filter.year}
        options={yearOptions}
        onChange={(v) => setFilter({ year: v })}
      />
      <Dropdown
        label="출처"
        value={filter.origin}
        options={originOptions}
        onChange={(v) => setFilter({ origin: v })}
      />

      <div style={{ flex: 1 }} />

      {/* 뷰 토글 */}
      <div
        style={{
          background: 'var(--surface2)',
          borderRadius: 8,
          padding: '2.5px',
          display: 'flex',
          gap: 2,
          flexShrink: 0,
          border: '1px solid var(--border)',
        }}
      >
        {(['grid', 'list'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              width: 28,
              height: 26,
              borderRadius: 5,
              border: 'none',
              background: viewMode === mode ? 'white' : 'transparent',
              boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {mode === 'grid' ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="0" y="0" width="5.5" height="5.5" rx="1" fill="currentColor"/>
                <rect x="7.5" y="0" width="5.5" height="5.5" rx="1" fill="currentColor"/>
                <rect x="0" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor"/>
                <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                <rect x="0" y="0" width="13" height="2.2" rx="1.1" fill="currentColor"/>
                <rect x="0" y="4.4" width="13" height="2.2" rx="1.1" fill="currentColor"/>
                <rect x="0" y="8.8" width="13" height="2.2" rx="1.1" fill="currentColor"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
