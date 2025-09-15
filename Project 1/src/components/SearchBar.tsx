import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './../styles/SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  onTyping?: () => void;
  onSelectSuggestion?: (suggestion: string) => void;
  suggestions: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = '',
  onTyping,
  onSelectSuggestion,
  suggestions,
}) => {
  const [input, setInput] = useState(initialValue);
  const debouncedInput = useDebounce(input, 400);
  const previousSearchTerm = useRef<string | null>(null);

  useEffect(() => {
    if (debouncedInput !== previousSearchTerm.current) {
      sessionStorage.setItem('searchTerm', debouncedInput);
      previousSearchTerm.current = debouncedInput;
      onSearch(debouncedInput);
    }
  }, [debouncedInput, onSearch]);

  const clearSearch = () => {
    setInput('');
    sessionStorage.removeItem('searchTerm');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      onSelectSuggestion?.(suggestions[0]);
    }
  };

  return (
    <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
      <input
        className="input-field"
        type="search"
        placeholder="Search for movies..."
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          onTyping?.();
        }}
        onFocus={() => onTyping?.()}
        onKeyDown={handleKeyDown}
      />
      {input && (
          <button
            type="button"
            className="clear-icon"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
    </form>
  );
};

export default SearchBar;
