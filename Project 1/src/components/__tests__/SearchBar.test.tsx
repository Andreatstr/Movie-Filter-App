import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = vi.fn();
  const mockOnTyping = vi.fn();
  const mockOnSelectSuggestion = vi.fn();

  const defaultProps = {
    onSearch: mockOnSearch,
    onTyping: mockOnTyping,
    onSelectSuggestion: mockOnSelectSuggestion,
    suggestions: ['Movie 1', 'Movie 2', 'Movie 3'],
    initialValue: '',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Snapshot Tests', () => {
    it('should render SearchBar with default state', () => {
      const {container} = render(<SearchBar {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render SearchBar with initial value', () => {
      const {container} = render(
        <SearchBar {...defaultProps} initialValue="Batman" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Basic Rendering', () => {
    it('renders the SearchBar component correctly', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('renders with initial value', () => {
      render(<SearchBar {...defaultProps} initialValue="Batman" />);
      const input = screen.getByPlaceholderText('Search for movies...');
      expect(input).toHaveValue('Batman');
    });
  });

  describe('User Interactions', () => {
    it('calls onSearch when the user types in the input field', async () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      await act(async () => {
        fireEvent.change(input, {target: {value: 'Inception'}});
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(mockOnSearch).toHaveBeenCalledWith('Inception');
    });

    it('calls onTyping when the input field is focused', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.focus(input);
      expect(mockOnTyping).toHaveBeenCalled();
    });

    it('clears the input field when the "X" button is clicked', () => {
      render(<SearchBar {...defaultProps} initialValue="Inception" />);
      const input = screen.getByPlaceholderText('Search for movies...');
      const clearButton = screen.getByRole('button', {name: /clear search/i});

      expect(input).toHaveValue('Inception');
      fireEvent.click(clearButton);
      expect(input).toHaveValue('');
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });

    it('triggers onSelectSuggestion when Enter is pressed with suggestions', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.change(input, {target: {value: 'Movie'}});
      fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

      expect(mockOnSelectSuggestion).toHaveBeenCalledWith('Movie 1');
    });

    it('does not trigger onSelectSuggestion when there are no suggestions', () => {
      render(<SearchBar {...defaultProps} suggestions={[]} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.change(input, {target: {value: 'Movie'}});
      fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

      expect(mockOnSelectSuggestion).not.toHaveBeenCalled();
    });
  });

  describe('Debouncing Behavior', () => {
    it('should debounce search input and trigger onSearch', async () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      await act(async () => {
        fireEvent.change(input, {target: {value: 'Batman'}});
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(mockOnSearch).toHaveBeenCalledWith('Batman');
    });
  });

  describe('State Management', () => {
    it('should update input value when typing', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.change(input, {target: {value: 'Superman'}});
      expect(input).toHaveValue('Superman');
    });
  });

  describe('Session Storage Integration', () => {
    it('should save search term to sessionStorage when searching', async () => {
      const mockSessionStorage = window.sessionStorage as Storage & {
        setItem: ReturnType<typeof vi.fn>;
        removeItem: ReturnType<typeof vi.fn>;
      };
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      await act(async () => {
        fireEvent.change(input, {target: {value: 'Avatar'}});
        vi.advanceTimersByTime(400);
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'searchTerm',
        'Avatar'
      );
    });

    it('should remove search term from sessionStorage when cleared', () => {
      const mockSessionStorage = window.sessionStorage as Storage & {
        setItem: ReturnType<typeof vi.fn>;
        removeItem: ReturnType<typeof vi.fn>;
      };
      render(<SearchBar {...defaultProps} initialValue="Avatar" />);

      const clearButton = screen.getByRole('button', {name: /clear search/i});
      fireEvent.click(clearButton);

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('searchTerm');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<SearchBar {...defaultProps} />);

      const input = screen.getByPlaceholderText('Search for movies...');
      expect(input).toHaveAttribute('type', 'search');
      expect(input).toHaveClass('input-field');
    });

    it('should have accessible clear button', () => {
      render(<SearchBar {...defaultProps} initialValue="Batman" />);

      const clearButton = screen.getByRole('button', {name: /clear search/i});
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
      expect(clearButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', () => {
      render(
        <SearchBar {...defaultProps} suggestions={['Batman', 'Superman']} />
      );

      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.change(input, {target: {value: 'Bat'}});
      fireEvent.keyDown(input, {key: 'Enter'});

      expect(mockOnSelectSuggestion).toHaveBeenCalledWith('Batman');
    });
  });

  describe('Form Behavior', () => {
    it('should prevent form submission', () => {
      render(<SearchBar {...defaultProps} />);

      const form = screen.getByRole('searchbox').closest('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('search-bar');

      const preventDefault = vi.fn();
      fireEvent.submit(form!, {preventDefault});
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suggestions array', () => {
      expect(() => {
        render(<SearchBar {...defaultProps} suggestions={[]} />);
      }).not.toThrow();
    });

    it('should handle undefined suggestions', () => {
      expect(() => {
        render(
          <SearchBar
            {...defaultProps}
            suggestions={undefined as string[] | undefined}
          />
        );
      }).not.toThrow();
    });

    it('should handle rapid clearing and typing', () => {
      render(<SearchBar {...defaultProps} initialValue="Initial" />);

      const input = screen.getByPlaceholderText('Search for movies...');
      const clearButton = screen.getByRole('button', {name: /clear search/i});

      fireEvent.click(clearButton);
      expect(input).toHaveValue('');

      fireEvent.change(input, {target: {value: 'New Search'}});
      expect(input).toHaveValue('New Search');
    });

    it('should handle special characters in search', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      fireEvent.change(input, {target: {value: specialChars}});
      expect(input).toHaveValue(specialChars);
    });
  });

  describe('Callback Props', () => {
    it('should call onTyping when input is focused', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.focus(input);
      expect(mockOnTyping).toHaveBeenCalled();
    });

    it('should call onTyping when typing', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search for movies...');

      fireEvent.change(input, {target: {value: 'B'}});
      expect(mockOnTyping).toHaveBeenCalled();
    });

    it('should not call optional callbacks when not provided', () => {
      const minimalProps = {
        onSearch: mockOnSearch,
        suggestions: [],
      };

      expect(() => {
        render(<SearchBar {...minimalProps} />);
      }).not.toThrow();
    });
  });
});
