import {useState, useEffect, useCallback, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {Movie} from '../types/movie';
import MovieCard from './MovieCard';
import './../styles/MovieViewer.css';
import FilterPanel from './FilterPanel';
import {useFilters} from '../hooks/useFilters';
import {tmdbApi} from '../services/tmdbApi';

interface MovieViewerProps {
  movies: Movie[];
}

export const MovieViewer = ({movies}: MovieViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {filters, setFilters, reset, hasActiveFilters, applyFilters} = useFilters();

  const filteredMovies = useMemo(() => applyFilters(movies), [applyFilters, movies]);

  // Fetch genres for FilterPanel
  const {data: genresData} = useQuery({
    queryKey: ['genres'],
    queryFn: () => tmdbApi.getGenres(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === filteredMovies.length - 1 ? 0 : prevIndex + 1
    );
  }, [filteredMovies.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? filteredMovies.length - 1 : prevIndex - 1
    );
  }, [filteredMovies.length]);

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

  const jumpToMovie = (index: number) => {
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
        <p className="no-movies">No movies available</p>
      </section>
    );
  }

  const currentMovie = filteredMovies[currentIndex];
  const totalMovies = filteredMovies.length;

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
 
      <aside className="movie-jump-controls">
        <label htmlFor="movie-select" className="jump-label">
          Jump to movie:
        </label>
        <select
          id="movie-select"
          className="movie-select"
          value={currentIndex}
          onChange={(e) => jumpToMovie(parseInt(e.target.value, 10))}
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
            {currentIndex + 1} of {totalMovies}
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
