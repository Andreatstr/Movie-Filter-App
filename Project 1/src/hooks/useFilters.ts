import {useEffect, useMemo, useState, useCallback} from 'react';
import type {Movie, MovieFilters} from '../types/movie';

const STORAGE_KEY = 'movieFilters.v1';

const DEFAULT_FILTERS: MovieFilters = {
  genre: undefined,
  minRating: undefined,
  maxRating: undefined,
  year: undefined,
  sortBy: 'popularity',
  sortOrder: 'desc',
};

function clampRating(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  const v = Math.min(10, Math.max(0, value));
  return v;
}

function normalizeFilters(
  input: Partial<MovieFilters> | null | undefined,
  prev?: MovieFilters,
  patch?: Partial<MovieFilters>
): MovieFilters {
  const f: Partial<MovieFilters> = {...input};

  const sortByValues = ['popularity', 'rating', 'release_date', 'title'] as const;
  const sortOrderValues = ['asc', 'desc'] as const;

  const sortBy = sortByValues.includes(f?.sortBy as (typeof sortByValues)[number])
    ? (f!.sortBy as MovieFilters['sortBy'])
    : (prev?.sortBy ?? DEFAULT_FILTERS.sortBy);

  const defaultOrderFor = (sb: MovieFilters['sortBy'] | undefined) =>
    sb === 'title' ? 'asc' : 'desc';

  let sortOrder: MovieFilters['sortOrder'];
  const hasSortOrderInPatch = patch ? Object.prototype.hasOwnProperty.call(patch, 'sortOrder') : false;
  const hasSortByInPatch = patch ? Object.prototype.hasOwnProperty.call(patch, 'sortBy') : false;

  if (hasSortOrderInPatch) {
    sortOrder = sortOrderValues.includes(patch!.sortOrder as (typeof sortOrderValues)[number])
      ? (patch!.sortOrder as MovieFilters['sortOrder'])
      : defaultOrderFor(sortBy);
  } else if (hasSortByInPatch) {
    sortOrder = defaultOrderFor(sortBy);
  } else if (sortOrderValues.includes(f?.sortOrder as (typeof sortOrderValues)[number])) {
    sortOrder = f!.sortOrder as MovieFilters['sortOrder'];
  } else {
    sortOrder = prev?.sortOrder ?? defaultOrderFor(sortBy);
  }

  const minRating = clampRating(f?.minRating);
  const maxRating = clampRating(f?.maxRating);

  let normalizedMin = minRating;
  let normalizedMax = maxRating;

  if (
    typeof normalizedMin === 'number' &&
    typeof normalizedMax === 'number' &&
    normalizedMin > normalizedMax
  ) {
    // Swap to maintain invariant min <= max
    const tmp = normalizedMin;
    normalizedMin = normalizedMax;
    normalizedMax = tmp;
  }

  const genre = typeof f?.genre === 'number' ? f!.genre : undefined;
  const year = typeof f?.year === 'number' ? f!.year : undefined;

  return {
    genre,
    minRating: normalizedMin,
    maxRating: normalizedMax,
    year,
    sortBy,
    sortOrder,
  };
}

function loadFromStorage(): MovieFilters {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw);
    return normalizeFilters(parsed);
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function useFilters() {
  const [filters, setFiltersState] = useState<MovieFilters>(() => loadFromStorage());

  const hasActiveFilters = useMemo(() => {
    return (
      filters.genre !== undefined ||
      filters.minRating !== undefined ||
      filters.maxRating !== undefined ||
      filters.year !== undefined ||
      // sort changes are not considered "active filters"
      false
    );
  }, [filters]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore storage errors
    }
  }, [filters]);

  const setFilters = useCallback((patch: Partial<MovieFilters>) => {
    setFiltersState((prev) => normalizeFilters({...prev, ...patch}, prev, patch));
  }, []);

  const reset = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const applyFilters = useCallback(
    (movies: Movie[]): Movie[] => {
      let out = movies;

      // Filter by genre
      if (typeof filters.genre === 'number') {
        out = out.filter((m) => m.genre_ids.includes(filters.genre!));
      }

      // Filter by rating range
      if (typeof filters.minRating === 'number') {
        out = out.filter((m) => m.vote_average >= (filters.minRating as number));
      }
      if (typeof filters.maxRating === 'number') {
        out = out.filter((m) => m.vote_average <= (filters.maxRating as number));
      }

      // Filter by year
      if (typeof filters.year === 'number') {
        out = out.filter((m) => {
          const y = Number(m.release_date?.slice(0, 4));
          return !Number.isNaN(y) && y === filters.year;
        });
      }

      // Sorting
      const sortBy = filters.sortBy ?? 'popularity';
      const order = filters.sortOrder ?? 'desc';

      const sorted = [...out].sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'rating':
            cmp = (a.vote_average ?? 0) - (b.vote_average ?? 0);
            break;
          case 'release_date': {
            const at = a.release_date ? Date.parse(a.release_date) : 0;
            const bt = b.release_date ? Date.parse(b.release_date) : 0;
            cmp = at - bt;
            break;
          }
          case 'title':
            cmp = (a.title || '').localeCompare(b.title || '');
            break;
          case 'popularity':
          default:
            cmp = (a.popularity ?? 0) - (b.popularity ?? 0);
            break;
        }
        return order === 'asc' ? cmp : -cmp;
      });

      return sorted;
    },
    [filters]
  );

  return {
    filters,
    setFilters,
    reset,
    hasActiveFilters,
    applyFilters,
  } as const;
}

export const __TEST_ONLY__ = {
  DEFAULT_FILTERS,
  STORAGE_KEY,
  normalizeFilters,
};
