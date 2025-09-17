import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Movie } from '../types/movie';
import MovieCard from './MovieCard';
import './../styles/MovieViewer.css';
import FilterPanel from './FilterPanel';
import { useFilters } from '../hooks/useFilters';
import SearchBar from './SearchBar';
import { tmdbApi } from '../services/tmdbApi';

interface MovieViewerProps {
  movies: Movie[];
}

export const MovieViewer = ({ movies }: MovieViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { filters, setFilters, reset, hasActiveFilters, applyFilters } =
    useFilters();

  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    sessionStorage.getItem('searchTerm') || ''
  );
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchActive, setSearchActive] = useState(
    !!sessionStorage.getItem('searchTerm')
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewerSource, setViewerSource] = useState<Movie[]>(
    applyFilters(movies)
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filteredMovies = useMemo(() => {
    const source = searchActive && searchResults ? searchResults : movies;
    return applyFilters(source);
  }, [searchActive, searchResults, applyFilters, movies]);

  const [filterDropdown, setFilterDropdown] = useState(false);

  const toggleFilterDropdown = () => {
    setFilterDropdown(prev => !prev);
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);
    setSearchActive(!!query);
    setLoadingSearch(true);

    if (!query) {
      setSearchResults(null);
      setViewerSource(applyFilters(movies));
      setLoadingSearch(false);
      return;
    }

    try {
      const response = await tmdbApi.searchMovies(query);
      setSearchResults(response.results);
      setViewerSource(response.results);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setViewerSource([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [movies, applyFilters]);

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSearchActive(true);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => tmdbApi.getGenres(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === viewerSource.length - 1 ? 0 : prevIndex + 1
    );
  }, [viewerSource.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? viewerSource.length - 1 : prevIndex - 1
    );
  }, [viewerSource.length]);

  useEffect(() => {
    if (!searchActive) {
      setViewerSource(applyFilters(movies));
    } else if (searchResults) {
      setViewerSource(applyFilters(searchResults));
    }
  }, [filters, movies, searchResults, applyFilters, searchActive]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('movieViewerIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    const savedIndex = sessionStorage.getItem('movieViewerIndex');
    if (savedIndex && filteredMovies.length > 0) {
      const index = parseInt(savedIndex, 10);
      if (index >= 0 && index < filteredMovies.length) {
        setCurrentIndex(index);
      }
    }
  }, [filteredMovies.length]);

  useEffect(() => {
    if (currentIndex >= filteredMovies.length) {
      setCurrentIndex(filteredMovies.length > 0 ? 0 : 0);
    }
  }, [filteredMovies.length, currentIndex]);

  const jumpToMovie = (index: number, source: Movie[]) => {
    setViewerSource(source);
    setCurrentIndex(index);
  };

  if (!filteredMovies || filteredMovies.length === 0) {
    return (
      <section className="movie-viewer" aria-label="Movie Viewer">
        <FilterPanel
          movies={movies}
          genres={genresData?.genres ?? []}
          filters={filters}
          setFilters={setFilters}
          reset={reset}
          hasActiveFilters={hasActiveFilters}
        />
        <SearchBar
          onSearch={handleSearch}
          initialValue={searchTerm}
          onTyping={() => setShowSuggestions(true)}
          onSelectSuggestion={handleSelectSuggestion}
          suggestions={searchResults?.map((movie) => movie.title) || []}
        />        <p className="no-movies">No movies available</p>
      </section>
    );
  }

  const currentMovie = viewerSource[currentIndex];
  const totalMovies = viewerSource.length;

  if (!currentMovie) {
    return (
      <section className="movie-viewer" aria-label="Movie Viewer">
        <FilterPanel
          movies={movies}
          genres={genresData?.genres ?? []}
          filters={filters}
          setFilters={setFilters}
          reset={reset}
          hasActiveFilters={hasActiveFilters}
        />
        <SearchBar
          onSearch={handleSearch}
          initialValue={searchTerm}
          onTyping={() => setShowSuggestions(true)}
          onSelectSuggestion={handleSelectSuggestion}
          suggestions={searchResults?.map((movie) => movie.title) || []}
        />
        <p className="no-movies">No movies available</p>
      </section>
    );
  }

  return (
    <section className="movie-viewer" aria-label="Movie Viewer">
      <section className='dropdown-container'>
        <SearchBar
          onSearch={handleSearch}
          initialValue={searchTerm}
          onTyping={() => setShowSuggestions(true)}
          onSelectSuggestion={handleSelectSuggestion}
          suggestions={searchResults?.map((movie) => movie.title) || []}
        />
        <button
          onClick={toggleFilterDropdown}
          className='dropdown-button'
        >
          Filter
        </button>
      </section>

      <section className='suggestion-container'>
        {loadingSearch && (
          <aside className="search-loading">
            <p>Loading search results...</p>
          </aside>
        )}

        {searchTerm &&
          showSuggestions &&
          !loadingSearch &&
          filteredMovies.length > 0 && (
            <section className="search-suggestions">
              {filteredMovies.slice(0, 5).map((movie, index) => (
                <li key={movie.id}>
                  <button
                    className="suggestion-button"
                    onClick={() => {
                      jumpToMovie(index, filteredMovies);
                      setShowSuggestions(false);
                    }}
                    title={`${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`}
                  >
                    <span>{movie.title}</span>
                    {movie.release_date && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginLeft: '8px',
                        }}
                      >
                        ({movie.release_date.split('-')[0]})
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </section>
          )}
      </section>

      {filterDropdown && (
        <FilterPanel
          movies={movies}
          genres={genresData?.genres ?? []}
          filters={filters}
          setFilters={setFilters}
          reset={reset}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <main className="movie-display">
        <MovieCard movie={currentMovie} size="large" />
      </main>

      <aside className="movie-jump-controls">
        <label htmlFor="movie-select" className="jump-label">
          Go to movie
        </label>
        <select
          id="movie-select"
          className="movie-select"
          value={currentIndex}
          onChange={(e) =>
            jumpToMovie(parseInt(e.target.value, 10), viewerSource)
          }
          disabled={totalMovies <= 1}
        >
          {filteredMovies.map((movie, index) => (
            <option key={movie.id} value={index}>
              {index + 1}. {movie.title}
            </option>
          ))}
        </select>
      </aside>

      <aside className="keyboard-hint">
        <p>Use ← → arrow keys to navigate</p>
      </aside>

      <nav className="movie-nav-controls" aria-label="Movie navigation">
        <button
          className="nav-btn nav-btn--prev"
          onClick={goToPrevious}
          aria-label="Previous movie"
          disabled={totalMovies <= 1}
        >
          ← Previous
        </button>

        <aside className="movie-position">
          <span className="position-text">
            {currentIndex + 1} of {filteredMovies.length}
          </span>
        </aside>

        <button
          className="nav-btn nav-btn--next"
          onClick={goToNext}
          aria-label="Next movie"
          disabled={totalMovies <= 1}
        >
          Next →
        </button>
      </nav>
    </section>
  );
};
