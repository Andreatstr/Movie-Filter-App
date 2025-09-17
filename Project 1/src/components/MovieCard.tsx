import { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { Movie } from '../types/movie';
import { tmdbApi } from '../services/tmdbApi';
import { useFavorites } from '../hooks/useFavorites';
import '../styles/MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, size = 'medium' }) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const overviewRef = useRef<HTMLParagraphElement>(null);
  const { isFavorite, toggle } = useFavorites();

  const year = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Missing year';
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const title = movie?.title || 'Title Missing';

  const showPlaceholder = !movie?.poster_path || imageError;

  useEffect(() => {
    setIsExpanded(false);

    const checkTruncation = () => {
      const element = overviewRef.current;
      if (element) {
        const wasExpanded = element.classList.contains('overview--expanded');
        if (wasExpanded) {
          element.classList.remove('overview--expanded');
        }

        const isOverflowing = element.scrollHeight > element.clientHeight;
        setIsTruncated(isOverflowing);

        if (wasExpanded) {
          element.classList.add('overview--expanded');
        }
      }
    };

    requestAnimationFrame(checkTruncation);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkTruncation);
    });

    if (overviewRef.current) {
      resizeObserver.observe(overviewRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [movie?.overview, size, movie?.id]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!movie) {
    return (
      <article className={`movie-card movie-card--${size}`}>
        <section className="content">
          <p>No movie data available</p>
        </section>
      </article>
    );
  }

  return (
    <article className={`movie-card movie-card--${size}`}>
      <figure className="image-container">
        {showPlaceholder ? (
          <img
            src="/placeholder-movie.jpg"
            alt="Movie poster placeholder"
            className="image"
          />
        ) : (
          <img
            src={tmdbApi.getImageUrl(movie?.poster_path || null, 'w500')}
            alt={`${title} poster`}
            className="image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
        <button
          type="button"
          aria-label={isFavorite(movie.id) ? 'Unfavorite' : 'Favorite'}
          className={`favorite-btn ${isFavorite(movie.id) ? 'is-favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggle(movie);
            // Remove focus on touch devices to prevent blue outline
            if ('ontouchstart' in window) {
              (e.target as HTMLButtonElement).blur();
            }
          }}
          title={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart fill={isFavorite(movie.id) ? 'currentColor' : 'none'} size={20} />
        </button>
      </figure>
      <section className="content">
        <header className="header">

          <h2 className="title">{title}</h2>
          <aside className="meta">
            <time className="year" dateTime={movie?.release_date || undefined}>
              {year}
            </time>
            <span className="rating" aria-label={`Rating: ${rating} out of 10`}>
              ★ {rating}/10
            </span>
          </aside>
        </header>
        <section className="overview-container">
          <p
            ref={overviewRef}
            className={`overview ${isExpanded ? 'overview--expanded' : ''}`}
          >
            {movie?.overview || 'No description available.'}
          </p>
          {isTruncated && (
            <button
              className="expand-btn"
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </section>
      </section>
    </article>
  );
};

export default MovieCard;
