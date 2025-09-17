import {render, screen, fireEvent} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {MovieViewer} from '../MovieViewer';
import type {Movie} from '../../types/movie';

// Mock the TMDB API
vi.mock('../../services/tmdbApi', () => ({
  tmdbApi: {
    getImageUrl: vi.fn(() => 'mocked-image-url'),
    getGenres: vi.fn(async () => ({genres: []})),
    searchMovies: vi.fn(async () => ({results: []})),
  },
}));

// Mock localStorage explicitly for isolation
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

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: {queries: {retry: false, staleTime: 0}},
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
};

describe('Favorites Integration', () => {
  const movies: Movie[] = [
    {
      id: 1,
      title: 'Fav One',
      overview: 'A',
      poster_path: '/a.jpg',
      release_date: '2023-01-01',
      vote_average: 7.1,
      genre_ids: [1],
      adult: false,
      backdrop_path: '/a-b.jpg',
      original_language: 'en',
      original_title: 'Fav One',
      popularity: 10,
      vote_count: 10,
    },
    {
      id: 2,
      title: 'Fav Two',
      overview: 'B',
      poster_path: '/b.jpg',
      release_date: '2022-01-01',
      vote_average: 6.2,
      genre_ids: [2],
      adult: false,
      backdrop_path: '/b-b.jpg',
      original_language: 'en',
      original_title: 'Fav Two',
      popularity: 20,
      vote_count: 20,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      // Start with empty favorites and favorites-only disabled
      if (key === 'favorites:v1') return null;
      if (key === 'favorites:showOnly') return 'false';
      return null;
    });
  });

  it('toggles favorite on MovieCard and updates count immediately', () => {
    renderWithQuery(<MovieViewer movies={movies} />);

    // Initially, counter is 0
    const counter = screen.getByTitle('Favorites count');
    expect(counter).toHaveTextContent('0');

    // Click favorite button on current movie card
    const favBtn = screen.getByRole('button', {name: /favorite/i});
    fireEvent.click(favBtn);

    // Counter should update to 1 without refresh
    expect(counter).toHaveTextContent('1');

    // Clicking again should unfavorite and decrement
    const unfavBtn = screen.getByRole('button', {name: /unfavorite/i});
    fireEvent.click(unfavBtn);
    expect(counter).toHaveTextContent('0');
  });

  it('filters to show only favorites when checkbox is enabled', () => {
    renderWithQuery(<MovieViewer movies={movies} />);

    // Favorite current visible movie
    fireEvent.click(screen.getByRole('button', {name: /favorite/i}));
    expect(screen.getByTitle('Favorites count')).toHaveTextContent('1');

    // Enable favorites-only filter
    const toggle = screen.getByLabelText('Show favorites only');
    fireEvent.click(toggle);

    // Should still render a movie (the favorited one). The title in the card should be present.
    // Note: Sorting may reorder; we assert that the displayed card has a heart as Unfavorite button present.
    expect(screen.getByRole('button', {name: /unfavorite/i})).toBeInTheDocument();
  });
});

