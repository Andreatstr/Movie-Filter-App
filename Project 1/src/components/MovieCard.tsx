import {useState, useRef, useEffect} from 'react';
import type {Movie} from '../types/movie';
import {tmdbApi} from '../services/tmdbApi';
import '../styles/MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
}

const MovieCard: React.FC<MovieCardProps> = ({movie, size = 'medium'}) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const overviewRef = useRef<HTMLParagraphElement>(null);

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Missing year';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const title = movie.title || 'Title Missing';

  const showPlaceholder = !movie.poster_path || imageError;

  useEffect(() => {
    // Reset expanded state when movie changes
    setIsExpanded(false);

    const checkTruncation = () => {
      const element = overviewRef.current;
      if (element) {
        // Check if the content is being truncated
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setIsTruncated(isOverflowing);
      }
    };

    // Check on mount and when text changes
    checkTruncation();

    // Also check after a small delay to ensure CSS is applied
    const timer = setTimeout(checkTruncation, 100);

    // Add resize event listener to recheck on viewport changes
    const handleResize = () => {
      // Small delay to ensure layout has updated
      setTimeout(checkTruncation, 50);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [movie.overview, size, movie.id]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <article className={`movie-card movie-card--${size}`}>
      <figure className="movie-card__image-container">
        {showPlaceholder ? (
          <img
            src="/placeholder-movie.jpg"
            alt="Movie poster placeholder"
            className="movie-card__image"
          />
        ) : (
          <img
            src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
            alt={`${title} poster`}
            className="movie-card__image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
      </figure>
      <section className="movie-card__content">
        <header className="movie-card__header">
          <h2 className="movie-card__title">{title}</h2>
          <aside className="movie-card__meta">
            <time
              className="movie-card__year"
              dateTime={movie.release_date || undefined}
            >
              {year}
            </time>
            <span
              className="movie-card__rating"
              aria-label={`Rating: ${rating} out of 10`}
            >
              ★ {rating}/10
            </span>
          </aside>
        </header>
        <section className="movie-card__overview-container">
          <p
            ref={overviewRef}
            className={`movie-card__overview ${
              isExpanded ? 'movie-card__overview--expanded' : ''
            }`}
          >
            {movie.overview || 'No description available.'}
          </p>
          {isTruncated && (
            <button
              className="movie-card__expand-btn"
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
