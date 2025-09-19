import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useFavorites, __TEST_ONLY__ as FAV_TEST} from '../useFavorites';
import type {Movie} from '../../types/movie';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useFavorites', () => {
  const movie = (id: number, title = `Movie ${id}`): Movie => ({
    id,
    title,
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2020-01-01',
    vote_average: 7,
    vote_count: 10,
    genre_ids: [],
    popularity: 1,
    adult: false,
    original_language: 'en',
    original_title: title,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('initializes with empty favorites when storage empty', () => {
    const {result} = renderHook(() => useFavorites());
    expect(result.current.count).toBe(0);
    expect(result.current.list).toEqual([]);
  });

  it('toggles favorite add/remove and updates count', () => {
    const {result} = renderHook(() => useFavorites());

    act(() => result.current.toggle(movie(1)));
    expect(result.current.isFavorite(1)).toBe(true);
    expect(result.current.count).toBe(1);

    act(() => result.current.toggle(movie(1)));
    expect(result.current.isFavorite(1)).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('persists to localStorage', () => {
    const {result} = renderHook(() => useFavorites());
    act(() => result.current.add(movie(2)));
    // last setItem call should be favorites
    const [key, value] = mockLocalStorage.setItem.mock.calls.at(-1)!;
    expect(key).toBe(FAV_TEST.STORAGE_KEY);
    const parsed = JSON.parse(value);
    expect(parsed['2'].id).toBe(2);
  });

  it('restores from localStorage on init', () => {
    const favs = {
      3: {
        id: 3,
        title: 'Restored',
        poster_path: null,
        vote_average: 8,
        timestamp: Date.now(),
      },
    };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(favs));
    const {result} = renderHook(() => useFavorites());
    expect(result.current.isFavorite(3)).toBe(true);
    expect(result.current.count).toBe(1);
  });

  it('handles corrupted localStorage gracefully', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('not-json');
    const {result} = renderHook(() => useFavorites());
    expect(result.current.count).toBe(0);
  });

  it('handles many favorites without crashing', () => {
    const {result} = renderHook(() => useFavorites());
    act(() => {
      for (let i = 1; i <= 50; i++) result.current.add(movie(i));
    });
    expect(result.current.count).toBe(50);
  });
});
