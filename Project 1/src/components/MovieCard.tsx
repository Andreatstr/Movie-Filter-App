import type { Movie } from "../types/movie";
import { tmdbApi } from "../services/tmdbApi";
import "../styles/MovieCard.css";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const imageUrl = tmdbApi.getImageUrl(movie.poster_path, "w500");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <article className="movie-card">
      <figure className="movie-card__image-container">
        <img
          src={imageUrl}
          alt={`${movie.title} poster`}
          className="movie-card__image"
          loading="lazy"
        />
      </figure>
      <section className="movie-card__content">
        <h2 className="movie-card__title">{movie.title}</h2>
        <aside className="movie-card__meta">
          <span className="movie-card__year">{year}</span>
          <span className="movie-card__rating" aria-label={`Rating: ${rating} out of 10`}>
            ★ {rating}
          </span>
        </aside>
        {movie.overview && (
          <p className="movie-card__overview">{movie.overview}</p>
        )}
      </section>
    </article>
  );
};

export default MovieCard;