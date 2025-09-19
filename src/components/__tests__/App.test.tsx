import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import App from '../../App';
import type {MovieResponse} from '../../types/movie';

// Mock the TMDB API
const mockMovieResponse: MovieResponse = {
  page: 1,
  total_pages: 1,
  total_results: 2,
  results: [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'First test movie description',
      poster_path: '/test1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      genre_ids: [28, 12],
      adult: false,
      backdrop_path: '/backdrop1.jpg',
      original_language: 'en',
      original_title: 'Test Movie 1',
      popularity: 100,
      vote_count: 1000,
    },
    {
      id: 2,
      title: 'Test Movie 2',
      overview: 'Second test movie description',
      poster_path: '/test2.jpg',
      release_date: '2023-06-15',
      vote_average: 7.2,
      genre_ids: [35, 18],
      adult: false,
      backdrop_path: '/backdrop2.jpg',
      original_language: 'en',
      original_title: 'Test Movie 2',
      popularity: 80,
      vote_count: 800,
    },
  ],
};

vi.mock('../../services/tmdbApi', () => ({
  tmdbApi: {
    getPopularMovies: vi.fn(),
    getImageUrl: vi.fn(() => 'mocked-image-url'),
    getGenres: vi.fn(async () => ({genres: []})),
    searchMovies: vi.fn(async () => ({results: []})),
  },
}));

import {tmdbApi} from '../../services/tmdbApi';

const mockTmdbApi = tmdbApi as {
  getPopularMovies: ReturnType<typeof vi.fn>;
  getImageUrl: ReturnType<typeof vi.fn>;
  getGenres: ReturnType<typeof vi.fn>;
  searchMovies: ReturnType<typeof vi.fn>;
};

describe('App Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  describe('Snapshot Tests', () => {
    it('should render App with loading state', () => {
      mockTmdbApi.getPopularMovies.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      const {container} = renderApp();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render App with movies loaded', async () => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);

      const {container} = renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render App with error state', async () => {
      mockTmdbApi.getPopularMovies.mockRejectedValue(new Error('API Error'));

      const {container} = renderApp();

      await waitFor(() => {
        expect(screen.getByText(/error: api error/i)).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Loading State', () => {
    it('should show loading message while fetching movies', () => {
      mockTmdbApi.getPopularMovies.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderApp();

      expect(screen.getByText('Loading movies...')).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveClass('app');
    });

    it('should have proper ARIA attributes in loading state', () => {
      mockTmdbApi.getPopularMovies.mockImplementation(
        () => new Promise(() => {})
      );

      renderApp();

      const loadingSection = screen
        .getByText('Loading movies...')
        .closest('section');
      expect(loadingSection).toHaveAttribute('aria-live', 'polite');
      expect(loadingSection).toHaveClass('loading');
    });
  });

  describe('Error State', () => {
    it('should show error message when API fails', async () => {
      const errorMessage = 'Failed to fetch movies';
      mockTmdbApi.getPopularMovies.mockRejectedValue(new Error(errorMessage));

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes in error state', async () => {
      mockTmdbApi.getPopularMovies.mockRejectedValue(new Error('API Error'));

      renderApp();

      await waitFor(() => {
        const errorSection = screen
          .getByText(/error: api error/i)
          .closest('section');
        expect(errorSection).toHaveAttribute('role', 'alert');
        expect(errorSection).toHaveClass('error');
      });
    });

    it('should handle different error types', async () => {
      const networkError = new Error('Network Error');
      mockTmdbApi.getPopularMovies.mockRejectedValue(networkError);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Error: Network Error')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);
    });

    it('should pass movies to MovieViewer component', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // MovieViewer should be rendered with navigation controls
      expect(
        screen.getByRole('button', {name: /previous movie/i})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: /next movie/i})
      ).toBeInTheDocument();
    });

    it('should handle empty movie results', async () => {
      mockTmdbApi.getPopularMovies.mockResolvedValue({
        ...mockMovieResponse,
        results: [],
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('No movies available')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with React Query', () => {
    it('should call getPopularMovies with correct parameters', () => {
      renderApp();

      expect(mockTmdbApi.getPopularMovies).toHaveBeenCalledWith(1);
    });

    it('should handle query key correctly', async () => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // Query should be cached with correct key
      const cachedData = queryClient.getQueryData(['popularMovies']);
      expect(cachedData).toEqual(mockMovieResponse);
    });

    it('should handle query refetch', async () => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // Trigger refetch
      await queryClient.refetchQueries(['popularMovies']);

      expect(mockTmdbApi.getPopularMovies).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);
    });

    it('should allow navigation between movies', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', {name: /next movie/i});
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);
    });

    it('should support screen readers with live regions', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // Live region for announcements
      const liveRegion = document.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', async () => {
      // Mock console.error to avoid error output in tests
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Force a rendering error
      mockTmdbApi.getPopularMovies.mockResolvedValue({
        ...mockMovieResponse,
        results: [null], // Invalid movie data
      });

      expect(() => {
        renderApp();
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should not refetch data unnecessarily', async () => {
      mockTmdbApi.getPopularMovies.mockResolvedValue(mockMovieResponse);

      const {rerender} = renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // Rerender component
      rerender(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Should not trigger additional API calls
      expect(mockTmdbApi.getPopularMovies).toHaveBeenCalledTimes(1);
    });

    it('should handle large movie datasets', async () => {
      const largeMovieResponse = {
        ...mockMovieResponse,
        results: Array.from({length: 100}, (_, i) => ({
          ...mockMovieResponse.results[0],
          id: i + 1,
          title: `Movie ${i + 1}`,
        })),
      };

      mockTmdbApi.getPopularMovies.mockResolvedValue(largeMovieResponse);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Movie 1')).toBeInTheDocument();
      });

      // Navigation should still work
      const dropdown = screen.getByLabelText('Go to movie');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
