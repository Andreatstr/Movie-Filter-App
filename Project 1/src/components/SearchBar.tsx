// src/components/SearchBar.tsx
import React, {useState, useEffect, useRef} from 'react';
import {useDebounce} from '../hooks/useDebounce';
import './../styles/SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  onTyping?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = '',
  onTyping,
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
      />
      {input && (
        <button type="button" className="clear-button" onClick={clearSearch}>
          Clear
        </button>
      )}
    </form>
  );
};

export default SearchBar;
