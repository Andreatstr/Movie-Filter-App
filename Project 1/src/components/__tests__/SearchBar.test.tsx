import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the SearchBar component correctly', () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search for movies...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('calls onSearch when the user types in the input field', async () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search for movies...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Inception' } });
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
    const clearButton = screen.getByRole('button', { name: /clear search/i });

    expect(input).toHaveValue('Inception');
    fireEvent.click(clearButton);
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('triggers onSelectSuggestion when Enter is pressed with suggestions', () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search for movies...');

    fireEvent.change(input, { target: { value: 'Movie' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSelectSuggestion).toHaveBeenCalledWith('Movie 1');
  });

  it('does not trigger onSelectSuggestion when there are no suggestions', () => {
    render(<SearchBar {...defaultProps} suggestions={[]} />);
    const input = screen.getByPlaceholderText('Search for movies...');

    fireEvent.change(input, { target: { value: 'Movie' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSelectSuggestion).not.toHaveBeenCalled();
  });
});