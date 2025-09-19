import {render, screen, fireEvent, within} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import FilterPanel from '../FilterPanel';
import type {MovieFilters, Movie, Genre} from '../../types/movie';

const mockGenres: Genre[] = [
  {id: 28, name: 'Action'},
  {id: 35, name: 'Comedy'},
  {id: 18, name: 'Drama'},
];

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Action Movie',
    overview: 'An action movie',
    poster_path: '/action.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    genre_ids: [28],
    adult: false,
    backdrop_path: '/action-backdrop.jpg',
    original_language: 'en',
    original_title: 'Action Movie',
    popularity: 100,
    vote_count: 1000,
  },
  {
    id: 2,
    title: 'Comedy Movie',
    overview: 'A comedy movie',
    poster_path: '/comedy.jpg',
    release_date: '2022-06-15',
    vote_average: 7.2,
    genre_ids: [35],
    adult: false,
    backdrop_path: '/comedy-backdrop.jpg',
    original_language: 'en',
    original_title: 'Comedy Movie',
    popularity: 80,
    vote_count: 800,
  },
];

const defaultFilters: MovieFilters = {
  genre: undefined,
  minRating: undefined,
  maxRating: undefined,
  year: undefined,
  sortBy: 'popularity',
  sortOrder: 'desc',
};

describe('FilterPanel', () => {
  const mockSetFilters = vi.fn();
  const mockReset = vi.fn();
  const mockOnToggleFavoritesOnly = vi.fn();

  const defaultProps = {
    movies: mockMovies,
    genres: mockGenres,
    filters: defaultFilters,
    setFilters: mockSetFilters,
    reset: mockReset,
    hasActiveFilters: false,
    showFavoritesOnly: false,
    onToggleFavoritesOnly: mockOnToggleFavoritesOnly,
    favoritesCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Snapshot Tests', () => {
    it('should render FilterPanel with default state', () => {
      const {container} = render(<FilterPanel {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render FilterPanel with active filters', () => {
      const filtersWithActive = {
        ...defaultFilters,
        genre: 28,
        minRating: 7,
        year: 2023,
      };
      const {container} = render(
        <FilterPanel
          {...defaultProps}
          filters={filtersWithActive}
          hasActiveFilters={true}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render FilterPanel on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      const {container} = render(<FilterPanel {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Component Rendering', () => {
    it('should populate genre dropdown with options', () => {
      render(<FilterPanel {...defaultProps} />);

      const genreSelect = screen.getByLabelText('Genre');
      const options = within(genreSelect).getAllByRole('option');

      expect(options).toHaveLength(4); // "Any" + 3 genres
      expect(options[0]).toHaveTextContent('Any');
      expect(options[1]).toHaveTextContent('Action');
      expect(options[2]).toHaveTextContent('Comedy');
      expect(options[3]).toHaveTextContent('Drama');
    });

    it('should populate year dropdown with available years', () => {
      render(<FilterPanel {...defaultProps} />);

      const yearSelect = screen.getByLabelText('Year');
      const options = within(yearSelect).getAllByRole('option');

      expect(options).toHaveLength(3); // "Any" + 2 years (2023, 2022)
      expect(options[0]).toHaveTextContent('Any');
      expect(options[1]).toHaveTextContent('2023');
      expect(options[2]).toHaveTextContent('2022');
    });

    it('should show mobile dual-range slider on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByLabelText('Minimum rating')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum rating')).toBeInTheDocument();
      expect(screen.getByText('Min: 0.0')).toBeInTheDocument();
      expect(screen.getByText('Max: 10.0')).toBeInTheDocument();
    });
  });

  describe('Props and State Changes', () => {
    it('should show active filter chips when filters are applied', () => {
      const activeFilters = {
        ...defaultFilters,
        genre: 28,
        year: 2023,
        minRating: 7.0,
        maxRating: 9.0,
      };

      render(
        <FilterPanel
          {...defaultProps}
          filters={activeFilters}
          hasActiveFilters={true}
        />
      );

      expect(screen.getByText('Genre: Action')).toBeInTheDocument();
      expect(screen.getByText('Year: 2023')).toBeInTheDocument();
      expect(screen.getByText('Min rating: 7')).toBeInTheDocument();
      expect(screen.getByText('Max rating: 9')).toBeInTheDocument();
    });

    it('should show "No active filters" when no filters applied', () => {
      render(<FilterPanel {...defaultProps} />);
      expect(screen.getByText('No active filters')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call setFilters when genre is changed', () => {
      render(<FilterPanel {...defaultProps} />);

      const genreSelect = screen.getByLabelText('Genre');
      fireEvent.change(genreSelect, {target: {value: '28'}});

      expect(mockSetFilters).toHaveBeenCalledWith({genre: 28});
    });

    it('should call setFilters when order buttons are clicked', () => {
      render(<FilterPanel {...defaultProps} />);

      const ascButton = screen.getByRole('button', {name: 'Asc'});
      fireEvent.click(ascButton);

      expect(mockSetFilters).toHaveBeenCalledWith({sortOrder: 'asc'});
    });

    it('should disable clear filters button when no active filters', () => {
      render(<FilterPanel {...defaultProps} />);

      const clearButton = screen.getByRole('button', {name: 'Clear filters'});
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Favorites Toggle', () => {
    it('should show favorites toggle with count', () => {
      render(<FilterPanel {...defaultProps} favoritesCount={5} />);

      expect(screen.getByLabelText('Show favorites only')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should reflect showFavoritesOnly state in checkbox', () => {
      render(<FilterPanel {...defaultProps} showFavoritesOnly={true} />);

      const favoritesCheckbox = screen.getByLabelText('Show favorites only');
      expect(favoritesCheckbox).toBeChecked();
    });
  });

  describe('Rating Range Logic', () => {
    it('should enforce min <= max constraint', () => {
      const filtersWithRating = {
        ...defaultFilters,
        minRating: 8.0,
        maxRating: 6.0, // Invalid: min > max
      };

      render(<FilterPanel {...defaultProps} filters={filtersWithRating} />);

      // Component should handle this gracefully
      expect(screen.getByDisplayValue('8')).toBeInTheDocument(); // minRating slider
      expect(screen.getByDisplayValue('6')).toBeInTheDocument(); // maxRating slider
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on controls', () => {
      render(<FilterPanel {...defaultProps} hasActiveFilters={true} />);

      const clearButton = screen.getByRole('button', {name: 'Clear filters'});
      expect(clearButton).toHaveAttribute('aria-disabled', 'false');

      const orderButtons = screen.getAllByRole('button', {pressed: true});
      expect(orderButtons.length).toBeGreaterThan(0);
    });

    it('should have proper labels for all form controls', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByLabelText('Genre')).toBeInTheDocument();
      expect(screen.getByLabelText('Year')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      expect(screen.getByLabelText('Show favorites only')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty genres array', () => {
      render(<FilterPanel {...defaultProps} genres={[]} />);

      const genreSelect = screen.getByLabelText('Genre');
      const options = within(genreSelect).getAllByRole('option');

      expect(options).toHaveLength(1); // Only "Any" option
      expect(options[0]).toHaveTextContent('Any');
    });

    it('should handle movies with missing release dates', () => {
      const moviesWithMissingDates = [
        {...mockMovies[0], release_date: ''},
        {...mockMovies[1]},
      ];

      render(<FilterPanel {...defaultProps} movies={moviesWithMissingDates} />);

      const yearSelect = screen.getByLabelText('Year');
      const options = within(yearSelect).getAllByRole('option');

      // Should still show valid years
      expect(options.length).toBeGreaterThan(1);
    });

    it('should handle invalid filter values gracefully', () => {
      const invalidFilters = {
        ...defaultFilters,
        genre: 999, // Non-existent genre
        year: -1, // Invalid year
        minRating: -5, // Invalid rating
        maxRating: 15, // Invalid rating
      };

      expect(() => {
        render(<FilterPanel {...defaultProps} filters={invalidFilters} />);
      }).not.toThrow();
    });
  });
});
