'use client';
import { useAppStore } from '@/store/useAppStore';
import type { AppTab } from '@/types';

const TABS: { key: AppTab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'list',
    label: '목록',
    icon: (
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <rect x="0" y="0" width="18" height="2.5" rx="1.25" fill="currentColor"/>
        <rect x="0" y="5.75" width="18" height="2.5" rx="1.25" fill="currentColor"/>
        <rect x="0" y="11.5" width="18" height="2.5" rx="1.25" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: 'dashboard',
    label: '대시보드',
    icon: (
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <rect x="0" y="7" width="4" height="7" rx="1" fill="currentColor"/>
        <rect x="7" y="3.5" width="4" height="10.5" rx="1" fill="currentColor"/>
        <rect x="14" y="0" width="4" height="14" rx="1" fill="currentColor"/>
      </svg>
    ),
  },
];

export default function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <div
      style={{
        height: 60,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {TABS.map(({ key, label, icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              paddingTop: 4,
            }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 2.5,
                  borderRadius: 100,
                  background: 'var(--accent)',
                }}
              />
            )}
            {icon}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
