import {describe, it, expect, beforeEach, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useFilters, __TEST_ONLY__} from '../useFilters';
import type {Movie} from '../../types/movie';

// Mock sessionStorage for isolation
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('useFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with defaults when storage is empty', () => {
    mockSessionStorage.getItem.mockReturnValueOnce(null);

    const {result} = renderHook(() => useFilters());
    const {DEFAULT_FILTERS} = __TEST_ONLY__;
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
  });

  it('persists updates to sessionStorage', () => {
    mockSessionStorage.getItem.mockReturnValueOnce(null);

    const {result} = renderHook(() => useFilters());
    const {STORAGE_KEY} = __TEST_ONLY__;

    act(() => {
      result.current.setFilters({genre: 28, minRating: 7.5, sortBy: 'rating'});
    });

    // First call can be initial persist of defaults; use the last call
    expect(mockSessionStorage.setItem.mock.calls.length).toBeGreaterThanOrEqual(1);
    const [key, value] = mockSessionStorage.setItem.mock.calls.at(-1)!;
    expect(key).toBe(STORAGE_KEY);
    const parsed = JSON.parse(value);
    expect(parsed.genre).toBe(28);
    expect(parsed.minRating).toBe(7.5);
    expect(parsed.sortBy).toBe('rating');
  });

  it('reset() restores defaults and persists', () => {
    mockSessionStorage.getItem.mockReturnValueOnce(null);

    const {result} = renderHook(() => useFilters());
    const {DEFAULT_FILTERS, STORAGE_KEY} = __TEST_ONLY__;

    act(() => {
      result.current.setFilters({genre: 12, year: 2020});
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    const [key, value] = mockSessionStorage.setItem.mock.calls.at(-1)!;
    expect(key).toBe(STORAGE_KEY);
    expect(JSON.parse(value)).toEqual(DEFAULT_FILTERS);
  });

  it('filters by genre, rating range, and year then sorts desc by default', () => {
    mockSessionStorage.getItem.mockReturnValueOnce(null);

    const movies: Movie[] = [
      {
        id: 1,
        title: 'A',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2021-05-01',
        vote_average: 8.0,
        vote_count: 100,
        genre_ids: [28, 12],
        popularity: 100,
        adult: false,
        original_language: 'en',
        original_title: 'A',
      },
      {
        id: 2,
        title: 'B',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2021-01-10',
        vote_average: 7.0,
        vote_count: 50,
        genre_ids: [35],
        popularity: 200,
        adult: false,
        original_language: 'en',
        original_title: 'B',
      },
      {
        id: 3,
        title: 'C',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2021-11-20',
        vote_average: 9.0,
        vote_count: 10,
        genre_ids: [28],
        popularity: 150,
        adult: false,
        original_language: 'en',
        original_title: 'C',
      },
    ];

    const {result} = renderHook(() => useFilters());

    act(() => {
      result.current.setFilters({genre: 28, minRating: 8, year: 2021});
    });

    const out = result.current.applyFilters(movies);
    expect(out.map((m) => m.id)).toEqual([3, 1]);
  });

  it('sorts by title asc by default and can flip order', () => {
    mockSessionStorage.getItem.mockReturnValueOnce(null);

    const movies: Movie[] = [
      {
        id: 1,
        title: 'Zulu',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2020-01-01',
        vote_average: 8,
        vote_count: 10,
        genre_ids: [],
        popularity: 1,
        adult: false,
        original_language: 'en',
        original_title: 'Zulu',
      },
      {
        id: 2,
        title: 'Apple',
        overview: '',
        poster_path: null,
        backdrop_path: null,
        release_date: '2020-01-01',
        vote_average: 5,
        vote_count: 10,
        genre_ids: [],
        popularity: 1,
        adult: false,
        original_language: 'en',
        original_title: 'Apple',
      },
    ];

    const {result} = renderHook(() => useFilters());

    act(() => {
      result.current.setFilters({sortBy: 'title'});
    });

    const asc = result.current.applyFilters(movies);
    expect(asc.map((m) => m.title)).toEqual(['Apple', 'Zulu']);

    act(() => {
      result.current.setFilters({sortOrder: 'desc'});
    });
    const desc = result.current.applyFilters(movies);
    expect(desc.map((m) => m.title)).toEqual(['Zulu', 'Apple']);
  });
});
