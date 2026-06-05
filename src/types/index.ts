export type Status = 'owned' | 'planned' | 'wanted' | 'none' | 'ordered';

export interface PocaCard {
  id: string;
  name: string;
  members: string[];
  kind: string | null;
  cat1: string | null;
  cat2: string | null;
  album: string | null;
  origin: string | null;
  date: string | null;
  year: string | null;
  status: Status | null;
  imageUrl: string | null;
  photos: string[];
  source: string | null;
  note: string | null;
}

export type ViewMode = 'list' | 'grid';
export type AppTab = 'list' | 'dashboard';

export interface FilterState {
  status: Status | 'all';
  members: string[];
  kinds: string[];
  cat1: string | null;
  album: string | null;
  year: string | null;
  origin: string | null;
  search: string;
}
