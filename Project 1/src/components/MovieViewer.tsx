import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Movie, MovieFilters } from '../types/movie';
import MovieCard from './MovieCard';
import './../styles/MovieViewer.css';
import FilterPanel from './FilterPanel';
import { useFilters } from '../hooks/useFilters';
import SearchBar from './SearchBar';
import {tmdbApi} from '../services/tmdbApi';
import {useFavorites} from '../hooks/useFavorites';
import {storage} from '../utils/localStorage';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { 
  getNavigationButtonLabel, 
  getMovieSelectLabel,
  getStatusAnnouncement 
} from '../utils/aria';

interface MovieViewerProps {
  movies: Movie[];
}

export const MovieViewer = ({ movies }: MovieViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const { filters, setFilters, reset, hasActiveFilters, applyFilters } =
    useFilters();
  const {ids: favoriteIds, count: favoritesCount} = useFavorites();
  const SHOW_FAVORITES_KEY = 'favorites:showOnly';
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(() =>
    storage.get<boolean>(SHOW_FAVORITES_KEY, false)
  );

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
    const base = applyFilters(source);
    if (!showFavoritesOnly) return base;
    return base.filter((m) => favoriteIds.has(m.id));
  }, [searchActive, searchResults, applyFilters, movies, showFavoritesOnly, favoriteIds]);

  const [filterDropdown, setFilterDropdown] = useState(false);

  const filterPanelRef = useFocusTrap({
    isActive: filterDropdown,
    initialFocus: false,
    restoreFocus: false,
    onEscape: () => setFilterDropdown(false),
  });

  const toggleFilterDropdown = () => {
    setFilterDropdown(prev => !prev);
  };

  const throttledAnnouncement = useCallback((message: string) => {
    setAnnouncement('​');
    requestAnimationFrame(() => {
      setAnnouncement('');
      requestAnimationFrame(() => {
        setAnnouncement(message);
      });
    });
  }, []);

  const setFiltersWithAnnouncement = useCallback((patch: Partial<MovieFilters>) => {
    setFilters(patch);

    const filterDescriptions = [];
    if (patch.genre) filterDescriptions.push(`Genre: ${patch.genre}`);
    if (patch.year) filterDescriptions.push(`Year: ${patch.year}`);
    if (patch.minRating !== undefined) filterDescriptions.push(`Min rating: ${patch.minRating}`);
    if (patch.maxRating !== undefined) filterDescriptions.push(`Max rating: ${patch.maxRating}`);
    if (patch.sortBy) filterDescriptions.push(`Sort by: ${patch.sortBy}`);

    if (filterDescriptions.length > 0) {
      throttledAnnouncement(getStatusAnnouncement('filter', {
        filterApplied: filterDescriptions.join(', ')
      }));
    }
  }, [setFilters, throttledAnnouncement]);

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

      throttledAnnouncement(getStatusAnnouncement('search', {
        searchResults: response.results.length
      }));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setViewerSource([]);
      throttledAnnouncement(getStatusAnnouncement('search', { searchResults: 0 }));
    } finally {
      setLoadingSearch(false);
    }
  }, [movies, applyFilters, throttledAnnouncement]);

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
    const newIndex = currentIndex === viewerSource.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);

    const movieTitle = viewerSource[newIndex]?.title;
    if (movieTitle) {
      throttledAnnouncement(getStatusAnnouncement('navigation', {
        movieTitle,
        position: { current: newIndex + 1, total: viewerSource.length }
      }));
    }
  }, [currentIndex, viewerSource, throttledAnnouncement]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? viewerSource.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);

    const movieTitle = viewerSource[newIndex]?.title;
    if (movieTitle) {
      throttledAnnouncement(getStatusAnnouncement('navigation', {
        movieTitle,
        position: { current: newIndex + 1, total: viewerSource.length }
      }));
    }
  }, [currentIndex, viewerSource, throttledAnnouncement]);

  useEffect(() => {
    if (!searchActive) {
      setViewerSource(filteredMovies);
    } else if (searchResults) {
      setViewerSource(filteredMovies);
    }
  }, [filters, movies, searchResults, applyFilters, searchActive, filteredMovies]);

  useEffect(() => {
    storage.set(SHOW_FAVORITES_KEY, showFavoritesOnly);
  }, [showFavoritesOnly]);

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

  const currentMovie = viewerSource[currentIndex];
  const totalMovies = viewerSource.length;
  const hasMovies = filteredMovies && filteredMovies.length > 0 && currentMovie;

  return (
    <section className="movie-viewer" aria-label="Movie Viewer">
      <section className='dropdown-container' ref={searchContainerRef}>
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
        <section ref={filterPanelRef} role="dialog" aria-label="Filters">
          <FilterPanel
            movies={movies}
            genres={genresData?.genres ?? []}
            filters={filters}
            setFilters={setFiltersWithAnnouncement}
            reset={reset}
            hasActiveFilters={hasActiveFilters}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={setShowFavoritesOnly}
            favoritesCount={favoritesCount}
          />
        </section>
      )}

      {hasMovies ? (
        <>
          <main className="movie-display">
            <MovieCard
              movie={currentMovie}
              size="large"
              onAnnouncement={throttledAnnouncement}
            />
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
              aria-label={getMovieSelectLabel(totalMovies)}
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

          <nav
            id="movie-navigation"
            aria-label="Movie navigation"
            className="movie-nav-controls"
          >
            <button
              className="nav-btn nav-btn--prev"
              onClick={goToPrevious}
              aria-label={getNavigationButtonLabel(
                'previous',
                currentMovie?.title,
                viewerSource[currentIndex === 0 ? viewerSource.length - 1 : currentIndex - 1]?.title
              )}
              disabled={totalMovies <= 1}
            >
              ← Prev
            </button>

            <aside className="movie-position">
              <span className="position-text">
                {currentIndex + 1} of {filteredMovies.length}
              </span>
            </aside>

            <button
              className="nav-btn nav-btn--next"
              onClick={goToNext}
              aria-label={getNavigationButtonLabel(
                'next',
                currentMovie?.title,
                viewerSource[currentIndex === viewerSource.length - 1 ? 0 : currentIndex + 1]?.title
              )}
              disabled={totalMovies <= 1}
            >
              Next →
            </button>
          </nav>
        </>
      ) : (
        <p className="no-movies">
          {!filteredMovies || filteredMovies.length === 0
            ? (showFavoritesOnly ? 'No favorite movies found' : 'No movies available')
            : 'No movies available'}
        </p>
      )}

      {/* Live region for announcements - assertive to interrupt previous announcements */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </section>
  );
};
