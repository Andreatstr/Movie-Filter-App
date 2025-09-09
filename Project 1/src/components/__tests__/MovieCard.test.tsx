import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import MovieCard from '../MovieCard';
import type {Movie} from '../../types/movie';

// Mock the TMDB API
vi.mock('../../services/tmdbApi', () => ({
  tmdbApi: {
    getImageUrl: vi.fn(() => 'mocked-image-url'),
  },
}));

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'A test movie description',
    poster_path: '/test-poster.jpg',
    release_date: '2023-12-25',
    vote_average: 8.5,
    genre_ids: [1, 2, 3],
    adult: false,
    backdrop_path: '/test-backdrop.jpg',
    original_language: 'en',
    original_title: 'Test Movie',
    popularity: 100,
    vote_count: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Snapshot Tests', () => {
    it('should render MovieCard with complete movie data', () => {
      const {container} = render(<MovieCard movie={mockMovie} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render MovieCard with missing poster', () => {
      const movieWithoutPoster = {...mockMovie, poster_path: null};
      const {container} = render(<MovieCard movie={movieWithoutPoster} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render MovieCard with missing data', () => {
      const movieWithMissingData = {
        ...mockMovie,
        title: '',
        release_date: '',
        vote_average: 0,
        poster_path: '',
      };
      const {container} = render(<MovieCard movie={movieWithMissingData} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Component Rendering', () => {
    it('should display movie title', () => {
      render(<MovieCard movie={mockMovie} />);
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    it('should display release year', () => {
      render(<MovieCard movie={mockMovie} />);
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('should display rating', () => {
      render(<MovieCard movie={mockMovie} />);
      expect(screen.getByText('★ 8.5')).toBeInTheDocument();
    });

    it('should display movie poster with correct alt text', () => {
      render(<MovieCard movie={mockMovie} />);
      const posterImage = screen.getByAltText('Test Movie poster');
      expect(posterImage).toBeInTheDocument();
      expect(posterImage).toHaveAttribute('src', 'mocked-image-url');
    });

    it('should have loading="lazy" attribute on poster image', () => {
      render(<MovieCard movie={mockMovie} />);
      const posterImage = screen.getByAltText('Test Movie poster');
      expect(posterImage).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Missing Data Handling', () => {
    it('should show "Title Missing" when title is missing', () => {
      const movieWithoutTitle = {...mockMovie, title: ''};
      render(<MovieCard movie={movieWithoutTitle} />);
      expect(screen.getByText('Title Missing')).toBeInTheDocument();
    });

    it('should show "Missing year" when release date is missing', () => {
      const movieWithoutDate = {...mockMovie, release_date: ''};
      render(<MovieCard movie={movieWithoutDate} />);
      expect(screen.getByText('Missing year')).toBeInTheDocument();
    });

    it('should show "N/A" when rating is missing', () => {
      const movieWithoutRating = {...mockMovie, vote_average: 0};
      render(<MovieCard movie={movieWithoutRating} />);
      expect(screen.getByText('★ N/A')).toBeInTheDocument();
    });
  });

  describe('Placeholder Image Handling', () => {
    it('should show placeholder when poster_path is null', () => {
      const movieWithoutPoster = {...mockMovie, poster_path: null};
      render(<MovieCard movie={movieWithoutPoster} />);

      const placeholderImage = screen.getByAltText('Movie poster placeholder');
      expect(placeholderImage).toBeInTheDocument();
      expect(placeholderImage).toHaveAttribute('src', '/placeholder-movie.jpg');
    });

    it('should show placeholder when poster_path is empty string', () => {
      const movieWithEmptyPoster = {...mockMovie, poster_path: ''};
      render(<MovieCard movie={movieWithEmptyPoster} />);

      const placeholderImage = screen.getByAltText('Movie poster placeholder');
      expect(placeholderImage).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show placeholder when image fails to load', () => {
      render(<MovieCard movie={mockMovie} />);

      // Initially should show the poster
      const posterImage = screen.getByAltText('Test Movie poster');
      expect(posterImage).toBeInTheDocument();

      // Simulate image load error
      fireEvent.error(posterImage);

      // Should now show placeholder
      const placeholderImage = screen.getByAltText('Movie poster placeholder');
      expect(placeholderImage).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      render(<MovieCard movie={mockMovie} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('figure')).toBeInTheDocument();
      expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
    });

    it('should have aria-label for rating', () => {
      render(<MovieCard movie={mockMovie} />);

      const ratingElement = screen.getByLabelText('Rating: 8.5 out of 10');
      expect(ratingElement).toBeInTheDocument();
    });
  });
});
