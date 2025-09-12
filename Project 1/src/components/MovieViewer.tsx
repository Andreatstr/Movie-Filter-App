import { useState, useEffect } from 'react';
import type { Movie } from '../types/movie';
import MovieCard from './MovieCard';
import './../styles/MovieViewer.css';

interface MovieViewerProps {
  movies: Movie[];
}

export const MovieViewer = ({ movies }: MovieViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle keyboard navigation
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
  }, [currentIndex, movies.length]);

  // Save current position to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('movieViewerIndex', currentIndex.toString());
  }, [currentIndex]);

  // Load position from sessionStorage on mount
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('movieViewerIndex');
    if (savedIndex && movies.length > 0) {
      const index = parseInt(savedIndex, 10);
      if (index >= 0 && index < movies.length) {
        setCurrentIndex(index);
      }
    }
  }, [movies.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === movies.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1
    );
  };

  const jumpToMovie = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle edge cases
  if (!movies || movies.length === 0) {
    return (
      <div className="movie-viewer">
        <p className="no-movies">No movies available</p>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const totalMovies = movies.length;

  return (
    <div className="movie-viewer">
      {/* Navigation Controls */}
      <div className="movie-nav-controls">
        <button 
          className="nav-btn nav-btn--prev"
          onClick={goToPrevious}
          aria-label="Previous movie"
          disabled={totalMovies <= 1}
        >
          ← Previous
        </button>

        <div className="movie-position">
          <span className="position-text">
            {currentIndex + 1} of {totalMovies}
          </span>
        </div>

        <button 
          className="nav-btn nav-btn--next"
          onClick={goToNext}
          aria-label="Next movie"
          disabled={totalMovies <= 1}
        >
          Next →
        </button>
      </div>

      {/* Movie Card Display */}
      <div className="movie-display">
        <MovieCard movie={currentMovie} size="large" />
      </div>

      {/* Jump to Movie Dropdown */}
      <div className="movie-jump-controls">
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
          {movies.map((movie, index) => (
            <option key={movie.id} value={index}>
              {index + 1}. {movie.title}
            </option>
          ))}
        </select>
      </div>

      {/* Keyboard Instructions */}
      <div className="keyboard-hint">
        <p>Use ← → arrow keys to navigate</p>
      </div>
    </div>
  );
};