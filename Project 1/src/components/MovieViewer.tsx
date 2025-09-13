import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const { filters, setFilters, reset, hasActiveFilters, applyFilters } = useFilters();

  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
  const [searchTerm, setSearchTerm] = useState(sessionStorage.getItem('searchTerm') || '');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewerSource, setViewerSource] = useState<Movie[]>(applyFilters(movies));

  const filteredMovies = useMemo(() => {
    const source = searchActive && searchResults ? searchResults : movies;
    return applyFilters(source);
  }, [searchActive, searchResults, applyFilters, movies]);


  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    setSearchActive(!!query);
    setLoadingSearch(true);

    if (!query) {
      setSearchResults(null);
      setLoadingSearch(false);
      return;
    }

    try {
      const response = await tmdbApi.searchMovies(query);
      setSearchResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Fetch genres for FilterPanel
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

  // Save current position to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('movieViewerIndex', currentIndex.toString());
  }, [currentIndex]);

  // Load position from sessionStorage on mount
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('movieViewerIndex');
    if (savedIndex && filteredMovies.length > 0) {
      const index = parseInt(savedIndex, 10);
      if (index >= 0 && index < filteredMovies.length) {
        setCurrentIndex(index);
      }
    }
  }, [filteredMovies.length]);

  // Clamp index when filtered list changes
  useEffect(() => {
    if (currentIndex >= filteredMovies.length) {
      setCurrentIndex(filteredMovies.length > 0 ? 0 : 0);
    }
  }, [filteredMovies.length, currentIndex]);

  const jumpToMovie = (index: number, source: Movie[]) => {
    setViewerSource(source);
    setCurrentIndex(index);
    setSearchActive(false);
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
        <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
        <p className="no-movies">No movies available</p>
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
        <p className="no-movies">No movies available</p>
      </section>
    );
  }

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


      <div className="search-container">
        <div className="search-bar">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchTerm}
            onTyping={() => setShowSuggestions(true)}
          />
        </div>

        {loadingSearch && (
          <div className="search-loading">
            <p>Loading search results...</p>
          </div>
        )}

        {searchTerm && showSuggestions && filteredMovies.length > 0 && (
          <ul className="search-suggestions">
            {filteredMovies.slice(0, 3).map((movie, index) => (
              <li key={movie.id}>
                <button
                  className="suggestion-button"
                  onClick={() => {
                    jumpToMovie(index, filteredMovies);
                    setSearchActive(false);
                    setShowSuggestions(false);
                  }}
                >
                  {movie.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="movie-jump-controls">
        <label htmlFor="movie-select" className="jump-label">
          Jump to movie:
        </label>
        <select
          id="movie-select"
          className="movie-select"
          value={currentIndex}
          onChange={(e) => jumpToMovie(parseInt(e.target.value, 10), viewerSource)}
          disabled={totalMovies <= 1}
        >
          {filteredMovies.map((movie, index) => (
            <option key={movie.id} value={index}>
              {index + 1}. {movie.title}
            </option>
          ))}
        </select>
      </aside>

      <main className="movie-display">
        <MovieCard movie={currentMovie} size="large" />
      </main>
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
