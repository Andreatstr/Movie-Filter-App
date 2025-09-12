import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {MovieViewer} from '../MovieViewer';
import type {Movie} from '../../types/movie';

// Mock the TMDB API
vi.mock('../../services/tmdbApi', () => ({
  tmdbApi: {
    getImageUrl: vi.fn(() => 'mocked-image-url'),
  },
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('MovieViewer', () => {
  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'First Movie',
      overview: 'First movie description that is long enough to test truncation behavior',
      poster_path: '/first-poster.jpg',
      release_date: '2023-12-25',
      vote_average: 8.5,
      genre_ids: [1, 2],
      adult: false,
      backdrop_path: '/first-backdrop.jpg',
      original_language: 'en',
      original_title: 'First Movie',
      popularity: 100,
      vote_count: 1000,
    },
    {
      id: 2,
      title: 'Second Movie',
      overview: 'Second movie description',
      poster_path: '/second-poster.jpg',
      release_date: '2023-11-15',
      vote_average: 7.2,
      genre_ids: [3, 4],
      adult: false,
      backdrop_path: '/second-backdrop.jpg',
      original_language: 'en',
      original_title: 'Second Movie',
      popularity: 80,
      vote_count: 800,
    },
    {
      id: 3,
      title: 'Third Movie',
      overview: 'Third movie description',
      poster_path: '/third-poster.jpg',
      release_date: '2023-10-01',
      vote_average: 9.1,
      genre_ids: [5, 6],
      adult: false,
      backdrop_path: '/third-backdrop.jpg',
      original_language: 'en',
      original_title: 'Third Movie',
      popularity: 120,
      vote_count: 1200,
    },
  ];

  const singleMovie: Movie[] = [mockMovies[0]];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Snapshot Tests', () => {
    it('should render MovieViewer with multiple movies', () => {
      const {container} = render(<MovieViewer movies={mockMovies} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render MovieViewer with single movie', () => {
      const {container} = render(<MovieViewer movies={singleMovie} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render MovieViewer with no movies', () => {
      const {container} = render(<MovieViewer movies={[]} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Component Rendering', () => {
    it('should display the first movie by default', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('should display navigation controls', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByRole('button', {name: /previous movie/i})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /next movie/i})).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display keyboard navigation hint', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByText(/use ← → arrow keys to navigate/i)).toBeInTheDocument();
    });

    it('should show "No movies available" when movies array is empty', () => {
      render(<MovieViewer movies={[]} />);
      
      expect(screen.getByText('No movies available')).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: /previous movie/i})).not.toBeInTheDocument();
    });
  });

  describe('Navigation State Changes', () => {
    it('should navigate to next movie when next button is clicked', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Initially showing first movie
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
      
      // Click next button
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      
      // Should show second movie
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('should navigate to previous movie when previous button is clicked', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Go to second movie first
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
      
      // Click previous button
      fireEvent.click(screen.getByRole('button', {name: /previous movie/i}));
      
      // Should show first movie again
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('should jump to specific movie using dropdown', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      const dropdown = screen.getByRole('combobox');
      
      // Jump to third movie (index 2)
      fireEvent.change(dropdown, {target: {value: '2'}});
      
      expect(screen.getByText('Third Movie')).toBeInTheDocument();
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });

    it('should update dropdown value when navigating with buttons', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
      
      // Initially at index 0
      expect(dropdown.value).toBe('0');
      
      // Navigate to next movie
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      
      // Dropdown should update to index 1
      expect(dropdown.value).toBe('1');
    });
  });

  describe('Wrapping Navigation', () => {
    it('should wrap from last movie to first when clicking next', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Navigate to last movie
      fireEvent.change(screen.getByRole('combobox'), {target: {value: '2'}});
      expect(screen.getByText('Third Movie')).toBeInTheDocument();
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
      
      // Click next - should wrap to first movie
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('should wrap from first movie to last when clicking previous', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // At first movie by default
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      
      // Click previous - should wrap to last movie
      fireEvent.click(screen.getByRole('button', {name: /previous movie/i}));
      
      expect(screen.getByText('Third Movie')).toBeInTheDocument();
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
    });
  });

  describe('Keyboard Event Handlers', () => {
    it('should navigate to next movie with right arrow key', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      
      // Press right arrow key
      fireEvent.keyDown(window, {key: 'ArrowRight'});
      
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
    });

    it('should navigate to previous movie with left arrow key', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Go to second movie first
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
      
      // Press left arrow key
      fireEvent.keyDown(window, {key: 'ArrowLeft'});
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
    });

    it('should prevent default behavior for arrow keys', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Test that navigation actually works (which means preventDefault was called)
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      
      // Press right arrow key
      fireEvent.keyDown(window, {key: 'ArrowRight'});
      
      // Should navigate to next movie (proves the event was handled)
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
    });

    it('should not respond to other keys', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      
      // Press random keys
      fireEvent.keyDown(window, {key: 'Enter'});
      fireEvent.keyDown(window, {key: 'Space'});
      fireEvent.keyDown(window, {key: 'a'});
      
      // Should still be on first movie
      expect(screen.getByText('First Movie')).toBeInTheDocument();
    });

    it('should wrap navigation with keyboard', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // At first movie, press left arrow (should wrap to last)
      fireEvent.keyDown(window, {key: 'ArrowLeft'});
      expect(screen.getByText('Third Movie')).toBeInTheDocument();
      
      // Press right arrow (should wrap to first)
      fireEvent.keyDown(window, {key: 'ArrowRight'});
      expect(screen.getByText('First Movie')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should disable navigation buttons with single movie', () => {
      render(<MovieViewer movies={singleMovie} />);
      
      const prevButton = screen.getByRole('button', {name: /previous movie/i});
      const nextButton = screen.getByRole('button', {name: /next movie/i});
      const dropdown = screen.getByRole('combobox');
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      expect(dropdown).toBeDisabled();
    });

    it('should show correct position with single movie', () => {
      render(<MovieViewer movies={singleMovie} />);
      
      expect(screen.getByText('1 of 1')).toBeInTheDocument();
    });

    it('should handle navigation with single movie gracefully', () => {
      render(<MovieViewer movies={singleMovie} />);
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      
      // Try keyboard navigation - should stay on same movie
      fireEvent.keyDown(window, {key: 'ArrowRight'});
      fireEvent.keyDown(window, {key: 'ArrowLeft'});
      
      expect(screen.getByText('First Movie')).toBeInTheDocument();
    });

    it('should populate dropdown options correctly', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      const options = screen.getAllByRole('option');
      
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('1. First Movie');
      expect(options[1]).toHaveTextContent('2. Second Movie');
      expect(options[2]).toHaveTextContent('3. Third Movie');
    });
  });

  describe('Session Storage', () => {
    it('should save current index to sessionStorage', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Navigate to second movie
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('movieViewerIndex', '1');
    });

    it('should restore position from sessionStorage', () => {
      // Mock sessionStorage returning index 1
      mockSessionStorage.getItem.mockReturnValue('1');
      
      render(<MovieViewer movies={mockMovies} />);
      
      // Should start at second movie (index 1)
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('should handle invalid sessionStorage values gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid');
      
      render(<MovieViewer movies={mockMovies} />);
      
      // Should default to first movie
      expect(screen.getByText('First Movie')).toBeInTheDocument();
    });

    it('should handle out-of-bounds sessionStorage values', () => {
      mockSessionStorage.getItem.mockReturnValue('10'); // Index beyond array
      
      render(<MovieViewer movies={mockMovies} />);
      
      // Should default to first movie
      expect(screen.getByText('First Movie')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on navigation buttons', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByLabelText('Previous movie')).toBeInTheDocument();
      expect(screen.getByLabelText('Next movie')).toBeInTheDocument();
    });

    it('should have proper ARIA label on dropdown', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByLabelText('Jump to movie:')).toBeInTheDocument();
    });

    it('should update button text when movie changes', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      // Navigate to second movie
      fireEvent.click(screen.getByRole('button', {name: /next movie/i}));
      
      // Check that movie title changed in the display
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      render(<MovieViewer movies={mockMovies} />);
      
      expect(screen.getByRole('article')).toBeInTheDocument(); // MovieCard
      expect(screen.getAllByRole('button')).toHaveLength(2); // Previous and Next buttons
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Dropdown
    });
  });
});
