'use client';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { FilterState } from '@/types';

const MEMBERS = ['전체', '승협', '훈', '재현', '회승', '동성', '단체'];
const YEARS = ['전체', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

type TabKey = 'members' | 'kinds' | 'album' | 'year';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'members', label: '멤버' },
  { key: 'kinds', label: '종류' },
  { key: 'album', label: '앨범/콘서트' },
  { key: 'year', label: '연도' },
];

interface Props {
  onClose: () => void;
  initialTab?: TabKey;
}

export default function FilterModal({ onClose, initialTab = 'members' }: Props) {
  const { filter, setFilter, resetFilter, allCards } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [local, setLocal] = useState<FilterState>({ ...filter });

  // Notion 데이터에서 동적으로 종류/앨범 목록 추출
  const dynamicKinds = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach((c) => { if (c.kind) set.add(c.kind); });
    return ['전체', ...Array.from(set).sort()];
  }, [allCards]);

  const dynamicAlbums = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach((c) => { if (c.album) set.add(c.album); });
    return ['전체', ...Array.from(set).sort()];
  }, [allCards]);

  const toggleMulti = (key: 'members' | 'kinds', val: string) => {
    if (val === '전체') {
      setLocal((p) => ({ ...p, [key]: [] }));
      return;
    }
    setLocal((p) => {
      const arr = p[key];
      return { ...p, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  const toggleSingle = (key: 'album' | 'year', val: string) => {
    setLocal((p) => ({ ...p, [key]: p[key] === val || val === '전체' ? null : val }));
  };

  const apply = () => {
    setFilter(local);
    onClose();
  };

  const reset = () => {
    setLocal({ status: 'all', members: [], kinds: [], cat1: null, album: null, year: null, origin: null, search: filter.search });
    resetFilter();
  };

  const renderList = (key: 'members' | 'kinds', items: string[]) =>
    items.map((item) => {
      const selected = item === '전체' ? local[key].length === 0 : local[key].includes(item);
      return (
        <div
          key={item}
          onClick={() => toggleMulti(key, item)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 22px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: selected ? 600 : 400 }}>{item}</span>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: selected ? 'none' : '1.5px solid var(--color-border)',
              background: selected ? 'var(--color-primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: selected ? '0 2px 8px rgba(51,102,255,0.28)' : 'none',
              flexShrink: 0,
            }}
          >
            {selected && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      );
    });

  const renderChips = (key: 'album' | 'year', items: string[]) => (
    <div style={{ padding: '16px 22px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item) => {
        const selected = item === '전체' ? local[key] === null : local[key] === item;
        return (
          <button
            key={item}
            onClick={() => toggleSingle(key, item)}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 100,
              border: selected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: selected ? 'var(--color-primary)' : 'var(--color-border-light)',
              color: selected ? 'white' : 'var(--color-text)',
              fontSize: 13,
              fontWeight: selected ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-dim)',
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
          background: 'var(--color-surface)',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -12px 48px rgba(0,0,0,0.18)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 100, background: 'var(--color-border-light)' }} />
        </div>

        {/* 탭바 */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-light)', padding: '0 16px' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                height: 46,
                border: 'none',
                background: 'none',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 700 : 400,
                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-mid)',
                borderBottom: activeTab === tab.key ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {activeTab === 'members' && renderList('members', MEMBERS)}
          {activeTab === 'kinds' && renderList('kinds', dynamicKinds)}
          {activeTab === 'album' && renderChips('album', dynamicAlbums)}
          {activeTab === 'year' && renderChips('year', YEARS)}
        </div>

        {/* 버튼 */}
        <div style={{ padding: '12px 16px 24px', display: 'flex', gap: 8 }}>
          <button
            onClick={reset}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-mid)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            초기화
          </button>
          <button
            onClick={apply}
            style={{
              flex: 2,
              height: 50,
              borderRadius: 14,
              border: 'none',
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
