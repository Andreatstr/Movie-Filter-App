import {useCallback, useMemo, useSyncExternalStore} from 'react';
import type {FavoriteMovie, Movie} from '../types/movie';
import {storage} from '../utils/localStorage';

const STORAGE_KEY = 'favorites:v1';

type FavoritesMap = Record<number, FavoriteMovie>;

function toFavorite(movie: Movie): FavoriteMovie {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    timestamp: Date.now(),
  };
}

// Module-scoped store for cross-component sync
let favoritesState: FavoritesMap | undefined;
let errorState: string | null = null;
let snapshot: {favorites: FavoritesMap; error: string | null} | undefined;

function ensureInit() {
  if (!favoritesState) {
    favoritesState = storage.get<FavoritesMap>(STORAGE_KEY, {});
    snapshot = {favorites: favoritesState, error: errorState};
  }
}
const listeners = new Set<() => void>();

function emit() {
  for (const l of Array.from(listeners)) l();
}

function setFavorites(next: FavoritesMap) {
  favoritesState = next;
  try {
    const ok = storage.set(STORAGE_KEY, favoritesState);
    errorState = ok ? null : 'Persistence fallback in use';
  } catch {
    errorState = 'Failed to persist favorites';
  }
  snapshot = {favorites: favoritesState, error: errorState};
  emit();
}

function subscribe(listener: () => void) {
  // Rehydrate from storage on each new subscription to reflect latest persisted state
  try {
    favoritesState = storage.get<FavoritesMap>(STORAGE_KEY, {});
    snapshot = {favorites: favoritesState, error: errorState};
  } catch {
    // ignore
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() { ensureInit(); return snapshot!; }

// Sync with storage events (cross-tab support)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      try {
        favoritesState = storage.get<FavoritesMap>(STORAGE_KEY, {});
        snapshot = {favorites: favoritesState, error: errorState};
        emit();
      } catch {
        // ignore
      }
    }
  });
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const favorites = snapshot.favorites;
  const error = snapshot.error;

  const ids = useMemo(() => new Set(Object.keys(favorites).map(Number)), [
    favorites,
  ]);

  const list = useMemo(
    () =>
      Object.values(favorites).sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)),
    [favorites]
  );

  const isFavorite = useCallback((id: number) => ids.has(id), [ids]);

  const add = useCallback((movie: Movie) => {
    ensureInit();
    setFavorites({...favoritesState!, [movie.id]: toFavorite(movie)});
  }, []);

  const remove = useCallback((id: number) => {
    ensureInit();
    if (!(id in favoritesState!)) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[id]: _removed, ...rest} = favoritesState!;
    setFavorites(rest as FavoritesMap);
  }, []);

  const toggle = useCallback((movie: Movie) => {
    ensureInit();
    if (favoritesState![movie.id]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {[movie.id]: _removed, ...rest} = favoritesState!;
      setFavorites(rest as FavoritesMap);
    } else {
      setFavorites({...favoritesState!, [movie.id]: toFavorite(movie)});
    }
  }, []);

  const clear = useCallback(() => setFavorites({}), []);

  const count = ids.size;

  return {
    favorites,
    list,
    ids,
    count,
    isFavorite,
    add,
    remove,
    toggle,
    clear,
    error,
    STORAGE_KEY,
  } as const;
}

export const __TEST_ONLY__ = {STORAGE_KEY};
