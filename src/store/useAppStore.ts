import { create } from 'zustand';
import { useMemo } from 'react';
import type { PocaCard, ViewMode, FilterState, AppTab } from '@/types';

const URL_TTL_MS = 45 * 60 * 1000;

interface AppStore {
  allCards: PocaCard[];
  loading: boolean;
  loadedCount: number;
  error: string | null;
  fetchedAt: number | null;

  filter: FilterState;
  viewMode: ViewMode;
  activeTab: AppTab;

  photobookCards: PocaCard[];

  setCards: (cards: PocaCard[]) => void;
  setLoading: (v: boolean) => void;
  setLoadedCount: (n: number) => void;
  setError: (e: string | null) => void;
  setFetchedAt: (t: number) => void;

  setFilter: (partial: Partial<FilterState>) => void;
  resetFilter: () => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveTab: (tab: AppTab) => void;

  page: number;
  setPage: (n: number) => void;
  resetPage: () => void;

  detailCard: PocaCard | null;
  showPhotobook: boolean;
  showUpload: boolean;

  addToPhotobook: (card: PocaCard) => void;
  removeFromPhotobook: (id: string) => void;
  clearPhotobook: () => void;
  reorderPhotobook: (cards: PocaCard[]) => void;
}

const defaultFilter: FilterState = {
  status: 'all',
  members: [],
  kinds: [],
  cat1: null,
  album: null,
  year: null,
  origin: null,
  search: '',
};

export const useAppStore = create<AppStore>((set) => ({
  allCards: [],
  loading: false,
  loadedCount: 0,
  error: null,
  fetchedAt: null,
  filter: defaultFilter,
  viewMode: 'grid',
  activeTab: 'list',
  photobookCards: [],
  detailCard: null,
  showPhotobook: false,
  showUpload: false,
  page: 1,

  setCards: (cards) => set({ allCards: cards }),
  setLoading: (v) => set({ loading: v }),
  setLoadedCount: (n) => set({ loadedCount: n }),
  setError: (e) => set({ error: e }),
  setFetchedAt: (t) => set({ fetchedAt: t }),

  setFilter: (partial) => set((s) => ({ filter: { ...s.filter, ...partial }, page: 1 })),
  resetFilter: () => set({ filter: defaultFilter, page: 1 }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setPage: (n) => set({ page: n }),
  resetPage: () => set({ page: 1 }),

  addToPhotobook: (card) =>
    set((s) => {
      if (s.photobookCards.find((c) => c.id === card.id)) return s;
      return { photobookCards: [...s.photobookCards, card] };
    }),
  removeFromPhotobook: (id) =>
    set((s) => ({ photobookCards: s.photobookCards.filter((c) => c.id !== id) })),
  clearPhotobook: () => set({ photobookCards: [] }),
  reorderPhotobook: (cards) => set({ photobookCards: cards }),
}));

export function isCacheStale(fetchedAt: number | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt > URL_TTL_MS;
}

export function useFilteredCards() {
  const allCards = useAppStore((s) => s.allCards);
  const filter = useAppStore((s) => s.filter);

  return useMemo(() => {
    return allCards.filter((card) => {
      if (filter.status !== 'all' && card.status !== filter.status) return false;
      if (filter.members.length && !filter.members.some((m) => card.members.includes(m))) return false;
      if (filter.kinds.length && !filter.kinds.includes(card.kind ?? '')) return false;
      if (filter.cat1 && card.cat1 !== filter.cat1) return false;
      if (filter.album && card.album !== filter.album) return false;
      if (filter.year && card.year !== filter.year) return false;
      if (filter.origin && card.origin !== filter.origin) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (
          !card.name.toLowerCase().includes(q) &&
          !card.members.join('').toLowerCase().includes(q) &&
          !(card.album ?? '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [allCards, filter]);
}

export function useStatusCounts() {
  const allCards = useAppStore((s) => s.allCards);
  return useMemo(() => {
    const counts: Record<string, number> = { all: allCards.length };
    allCards.forEach((c) => {
      const s = c.status ?? 'none';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return counts;
  }, [allCards]);
}
