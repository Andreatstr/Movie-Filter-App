import {useState} from 'react';
import type {Movie} from '../types/movie';
import {tmdbApi} from '../services/tmdbApi';
import '../styles/MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
}

const MovieCard: React.FC<MovieCardProps> = ({movie, size = 'medium'}) => {
  const [imageError, setImageError] = useState(false);
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Missing year';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const title = movie.title || 'Title Missing';

  const showPlaceholder = !movie.poster_path || imageError;

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
        <h2 className="movie-card__title">{title}</h2>
        <aside className="movie-card__meta">
          <span className="movie-card__year">{year}</span>
          <span
            className="movie-card__rating"
            aria-label={`Rating: ${rating} out of 10`}
          >
            ★ {rating}
          </span>
        </aside>
      </section>
    </article>
  );
};

export default MovieCard;
