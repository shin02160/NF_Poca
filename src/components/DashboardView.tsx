'use client';
import { useAppStore } from '@/store/useAppStore';
import { useMemo } from 'react';

function StatCard({ value, unit, label, bg, color }: { value: string | number; unit: string; label: string; bg: string; color: string }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '12px 14px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, opacity: 0.6 }}>{unit}</span>
      </div>
      <p style={{ margin: '3px 0 0', fontSize: 11, color, opacity: 0.7, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export default function DashboardView() {
  const allCards = useAppStore((s) => s.allCards);

  const stats = useMemo(() => {
    const total = allCards.length;
    const memberSet = new Set(allCards.flatMap((c) => c.members).filter((m) => m !== '단체'));
    const originSet = new Set(allCards.map((c) => c.origin).filter(Boolean));
    const withPhoto = allCards.filter((c) => (c.photos?.length ?? 0) > 0 || c.imageUrl).length;
    const photoRate = total ? Math.round(withPhoto / total * 100) : 0;

    const memberMap: Record<string, number> = {};
    allCards.forEach((c) => c.members.forEach((m) => { memberMap[m] = (memberMap[m] ?? 0) + 1; }));
    const memberBreakdown = Object.entries(memberMap).sort((a, b) => b[1] - a[1]);
    const maxMember = memberBreakdown[0]?.[1] ?? 1;

    const originMap: Record<string, { count: number; year: string }> = {};
    allCards.forEach((c) => {
      if (!c.origin) return;
      const year = c.origin.match(/^(\d{4})/)?.[1] ?? '';
      if (!originMap[c.origin]) originMap[c.origin] = { count: 0, year };
      originMap[c.origin].count++;
    });
    const originBreakdown = Object.entries(originMap)
      .map(([label, { count, year }]) => ({ label, count, year }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const maxOrigin = originBreakdown[0]?.count ?? 1;

    const mediaMap: Record<string, number> = {};
    allCards.forEach((c) => { if (c.cat1) mediaMap[c.cat1] = (mediaMap[c.cat1] ?? 0) + 1; });
    const mediaBreakdown = Object.entries(mediaMap).sort((a, b) => b[1] - a[1]);
    const maxMedia = mediaBreakdown[0]?.[1] ?? 1;

    const yearMap: Record<string, number> = {};
    allCards.forEach((c) => {
      const y = c.origin?.match(/^(\d{4})/)?.[1];
      if (y) yearMap[y] = (yearMap[y] ?? 0) + 1;
    });
    const yearlyTrend = Object.entries(yearMap).sort((a, b) => a[0].localeCompare(b[0]));
    const maxYear = Math.max(...yearlyTrend.map(([, c]) => c), 1);
    const currentYear = String(new Date().getFullYear());

    const cat2Map: Record<string, number> = {};
    allCards.forEach((c) => { if (c.cat2 ?? c.kind) cat2Map[(c.cat2 ?? c.kind)!] = (cat2Map[(c.cat2 ?? c.kind)!] ?? 0) + 1; });
    const cat2Breakdown = Object.entries(cat2Map).sort((a, b) => b[1] - a[1]);
    const maxCat2 = cat2Breakdown[0]?.[1] ?? 1;

    const recentPocas = [...allCards].slice(0, 8);

    return { total, memberCount: memberSet.size, originCount: originSet.size, photoRate, memberBreakdown, maxMember, originBreakdown, maxOrigin, mediaBreakdown, maxMedia, yearlyTrend, maxYear, currentYear, cat2Breakdown, maxCat2, recentPocas };
  }, [allCards]);

  const MEDIA_COLORS: Record<string, string> = {
    '앨범': '#93c5fd', '팬미팅': '#c4b5fd', '콘서트': '#f9a8d4',
    '잡지/화보': '#fcd34d', 'MD굿즈': '#a5f3fc', '기타': '#d1d5db',
  };

  if (!allCards.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
        데이터를 불러오는 중입니다…
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '14px 14px 24px', boxSizing: 'border-box' }}>

      {/* ① 요약 카드 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
        <StatCard value={stats.total} unit="장" label="총 포카" bg="#f5f3ff" color="#6d28d9" />
        <StatCard value={stats.memberCount} unit="명" label="등록 멤버" bg="#fffbeb" color="#d97706" />
        <StatCard value={stats.originCount} unit="건" label="등록 출처" bg="#eff6ff" color="#2563eb" />
        <StatCard value={stats.photoRate} unit="%" label="사진 등록률" bg="#f0fdf4" color="#059669" />
      </div>

      {/* ② 멤버별 현황 */}
      <Section title="멤버별 현황">
        {stats.memberBreakdown.map(([name, count]) => (
          <BarRow
            key={name}
            label={name}
            count={count}
            pct={Math.round(count / stats.maxMember * 100)}
            color="#c4b5fd"
          />
        ))}
      </Section>

      {/* ③ 출처별 현황 */}
      <Section title="출처별 현황">
        {stats.originBreakdown.map(({ label, count }) => (
          <BarRow
            key={label}
            label={label.replace(/^\d{4}_/, '')}
            count={count}
            pct={Math.round(count / stats.maxOrigin * 100)}
            color="#93c5fd"
            labelWidth={110}
          />
        ))}
      </Section>

      {/* ④ 매체별 */}
      <Section title="매체별 분포">
        {stats.mediaBreakdown.map(([label, count]) => (
          <BarRow
            key={label}
            label={label}
            count={count}
            pct={Math.round(count / stats.maxMedia * 100)}
            color={MEDIA_COLORS[label] ?? '#d1d5db'}
          />
        ))}
      </Section>

      {/* ⑤ 연도별 추이 */}
      <Section title="연도별 추이">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90, paddingBottom: 16, position: 'relative' }}>
          {stats.yearlyTrend.map(([year, count]) => {
            const barH = Math.round(count / stats.maxYear * 70);
            const isCurrent = year === stats.currentYear;
            return (
              <div key={year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: '#c4b5fd', opacity: isCurrent ? 0.5 : 1 }}>{count}</span>
                <div
                  style={{
                    width: '100%',
                    height: barH,
                    background: '#c4b5fd',
                    borderRadius: '3px 3px 0 0',
                    opacity: isCurrent ? 0.45 : 1,
                  }}
                />
                <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>{year.slice(2)}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ⑥ 종류별 분포 */}
      {stats.cat2Breakdown.length > 0 && (
        <Section title="종류별 분포">
          {stats.cat2Breakdown.map(([label, count]) => (
            <BarRow
              key={label}
              label={label}
              count={count}
              pct={Math.round(count / stats.maxCat2 * 100)}
              color="#6ee7b7"
            />
          ))}
        </Section>
      )}

      {/* ⑦ 최근 추가 포카 */}
      {stats.recentPocas.length > 0 && (
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 16px 16px', marginBottom: 10 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>최근 추가 포카</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {stats.recentPocas.map((card) => {
              const initials = card.members[0]?.slice(0, 2) ?? '??';
              return (
                <div key={card.id} style={{ flexShrink: 0, width: 65 }}>
                  <div style={{ width: 65, aspectRatio: '3/4', borderRadius: 9, overflow: 'hidden', background: 'var(--surface2)', position: 'relative' }}>
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: '#7c3aed66' }}>{initials}</span>
                      </div>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {card.name}
                  </p>
                </div>
              );
            })}
            {/* 마지막 카드 우측 여백 spacer */}
            <div style={{ flexShrink: 0, width: 16 }} />
          </div>
        </div>
      )}

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function BarRow({ label, count, pct, color, labelWidth = 60 }: { label: string; count: number; pct: number; color: string; labelWidth?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: labelWidth, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <div style={{ flex: 1, height: 7, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100 }} />
      </div>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color, width: 28, textAlign: 'right', flexShrink: 0 }}>{count}</span>
    </div>
  );
}
