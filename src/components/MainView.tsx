'use client';
import { useEffect, useCallback } from 'react';
import { VList } from 'virtua';
import { useAppStore, useFilteredCards, isCacheStale } from '@/store/useAppStore';
import ListItem from './ListItem';
import GridItem from './GridItem';
import DetailModal from './DetailModal';
import PhotobookPanel from './PhotobookPanel';
import TabBar from './TabBar';
import StatsBar from './StatsBar';
import FilterBar from './FilterBar';
import DashboardView from './DashboardView';
import Pagination from './Pagination';
import UploadModal from './UploadModal';
import type { PocaCard } from '@/types';

const GRID_COLS = 3;
const PAGE_SIZE_GRID = 27;
const PAGE_SIZE_LIST = 20;

export default function MainView() {
  const {
    allCards, loading, loadedCount, error, fetchedAt,
    setCards, setLoading, setLoadedCount, setError, setFetchedAt,
    filter, setFilter,
    activeTab,
    photobookCards, addToPhotobook, removeFromPhotobook,
  } = useAppStore();

  const filteredCards = useFilteredCards();
  const viewMode = useAppStore((s) => s.viewMode);
  const page = useAppStore((s) => s.page);
  const { setPage, resetPage } = useAppStore();

  const isInPhotobook = useCallback((id: string) => photobookCards.some((c) => c.id === id), [photobookCards]);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notion');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCards(data.cards);
      setLoadedCount(data.total);
      setFetchedAt(Date.now());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCacheStale(fetchedAt)) fetchCards();
  }, []);

  useEffect(() => {
    const id = setInterval(fetchCards, 45 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const pageSize = viewMode === 'grid' ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const pagedCards = filteredCards.slice((page - 1) * pageSize, page * pageSize);

  const gridRows: PocaCard[][] = [];
  for (let i = 0; i < pagedCards.length; i += GRID_COLS) {
    gridRows.push(pagedCards.slice(i, i + GRID_COLS));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480, margin: '0 auto', background: 'var(--bg)' }}>

      {/* 헤더 */}
      <div style={{
        height: 54,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/nflying-logo.png" alt="N.Flying" style={{ height: 38, width: 'auto' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: 'var(--text)', letterSpacing: 0.5 }}>
            {loading ? `${loadedCount}…` : `${allCards.length}장`}
          </span>
          <button
            onClick={() => useAppStore.setState({ showUpload: true })}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="CSV 업로드"
          >
            ↑
          </button>
          <button
            onClick={fetchCards}
            disabled={loading}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '⏳' : '↻'}
          </button>
        </div>
      </div>

      {/* 목록 탭 전용: Stats Bar + Filter Bar */}
      {activeTab === 'list' && (
        <>
          <StatsBar />
          <FilterBar />
        </>
      )}

      {/* 결과 카운트 (목록 탭) */}
      {activeTab === 'list' && (
        <div style={{
          padding: '6px 14px',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {error ? (
            <span style={{ fontSize: 12, color: 'var(--wanted)' }}>오류: {error}</span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              총 <strong style={{ color: 'var(--text)' }}>{filteredCards.length}</strong>건
            </span>
          )}
          {(filter.members.length || filter.kinds.length || filter.cat1 || filter.album || filter.year || filter.origin || filter.search || filter.status !== 'all') && (
            <button
              onClick={() => useAppStore.getState().resetFilter()}
              style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              필터 초기화
            </button>
          )}
        </div>
      )}

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'list' ? (
          loading && !allCards.length ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
              데이터를 불러오는 중입니다…
            </div>
          ) : viewMode === 'list' ? (
            <VList style={{ height: '100%' }}>
              {pagedCards.map((card) => (
                <ListItem
                  key={card.id}
                  card={card}
                  inPhotobook={isInPhotobook(card.id)}
                  onAdd={() => addToPhotobook(card)}
                  onRemove={() => removeFromPhotobook(card.id)}
                  onDetail={() => useAppStore.setState({ detailCard: card })}
                />
              ))}
            </VList>
          ) : (
            <VList style={{ height: '100%' }}>
              {gridRows.map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gap: 10,
                    padding: '6px 14px',
                    alignItems: 'start',
                  }}
                >
                  {row.map((card) => (
                    <GridItem
                      key={card.id}
                      card={card}
                      inPhotobook={isInPhotobook(card.id)}
                      onAdd={() => addToPhotobook(card)}
                      onRemove={() => removeFromPhotobook(card.id)}
                      onDetail={() => useAppStore.setState({ detailCard: card })}
                    />
                  ))}
                </div>
              ))}
            </VList>
          )
        ) : (
          <DashboardView />
        )}
      </div>

      {/* 하단 포토북 바 */}
      {photobookCards.length > 0 && activeTab === 'list' && (
        <div style={{ padding: '10px 16px 4px', background: 'var(--surface)', borderTop: '1px solid var(--border2)', flexShrink: 0 }}>
          <button
            onClick={() => useAppStore.setState({ showPhotobook: true })}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 100,
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(37,99,235,0.32)',
            }}
          >
            포토북에 {photobookCards.length}장 담기 →
          </button>
        </div>
      )}

      {/* 페이지네이션 (목록 탭) */}
      {activeTab === 'list' && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
        />
      )}

      {/* 하단 탭바 */}
      <TabBar />

      {/* 모달 */}
      <DetailModalWrapper />
      <PhotobookWrapper />
  <UploadModalWrapper />
    </div>
  );
}

function DetailModalWrapper() {
  const detailCard = useAppStore((s) => s.detailCard);
  const photobookCards = useAppStore((s) => s.photobookCards);
  const addToPhotobook = useAppStore((s) => s.addToPhotobook);
  const removeFromPhotobook = useAppStore((s) => s.removeFromPhotobook);

  if (!detailCard) return null;
  const inPhotobook = photobookCards.some((c) => c.id === detailCard.id);

  return (
    <DetailModal
      card={detailCard}
      inPhotobook={inPhotobook}
      onAdd={() => addToPhotobook(detailCard)}
      onRemove={() => removeFromPhotobook(detailCard.id)}
      onClose={() => useAppStore.setState({ detailCard: null })}
    />
  );
}

function PhotobookWrapper() {
  const showPhotobook = useAppStore((s) => s.showPhotobook);
  if (!showPhotobook) return null;
  return <PhotobookPanel onClose={() => useAppStore.setState({ showPhotobook: false })} />;
}

function UploadModalWrapper() {
  const show = useAppStore((s) => (s as any).showUpload as boolean);
  if (!show) return null;
  return <UploadModal onClose={() => useAppStore.setState({ showUpload: false })} />;
}
