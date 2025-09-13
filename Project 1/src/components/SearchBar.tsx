// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './../styles/SearchBar.css';

interface SearchBarProps {
	onSearch: (query: string) => void;
	initialValue?: string;
	onTyping?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue = '', onTyping }) => {
	const [input, setInput] = useState(initialValue);
	const debouncedInput = useDebounce(input, 400);
	const previousSearchTerm = useRef<string | null>(null);

	useEffect(() => {
		sessionStorage.setItem('searchTerm', debouncedInput);
		onSearch(debouncedInput);
	}, [debouncedInput, onSearch]);

	// useEffect(() => {
  //       if (debouncedInput !== previousSearchTerm.current) {
  //           previousSearchTerm.current = debouncedInput;
  //           onSearch(debouncedInput);
  //       }
  //   }, [debouncedInput, onSearch]);

	const clearSearch = () => {
		setInput('');
		sessionStorage.removeItem('searchTerm');
		onSearch('');
	};

	return (
		<div className="search-bar">
			<input
				type="text"
				placeholder="Search for movies..."
				value={input}
				onChange={(e) => {
					setInput(e.target.value)
					onTyping?.();
				}}
			/>
			{input && <button onClick={clearSearch}>Clear</button>}
		</div>
	);
};

export default SearchBar;
