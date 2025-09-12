import {useMemo} from 'react';
import type {Genre, Movie, MovieFilters} from '../types/movie';
import '../styles/FilterPanel.css';

interface FilterPanelProps {
  movies: Movie[];
  genres?: Genre[];
  filters: MovieFilters;
  setFilters: (patch: Partial<MovieFilters>) => void;
  reset: () => void;
  hasActiveFilters: boolean;
}

export default function FilterPanel({
  movies,
  genres = [],
  filters,
  setFilters,
  reset,
  hasActiveFilters,
}: FilterPanelProps) {

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const m of movies) {
      const y = Number(m.release_date?.slice(0, 4));
      if (!Number.isNaN(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [movies]);

  const ratingMin = filters.minRating ?? 0;
  const ratingMax = filters.maxRating ?? 10;

  return (
    <section className="filter-panel" aria-label="Filters">
      <header className="filter-header">
        <h2 className="filter-title">Filters</h2>
        <div className="filter-actions">
          <button
            type="button"
            className="filter-reset-btn"
            onClick={() => reset()}
            disabled={!hasActiveFilters}
            aria-disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>
      </header>

      <div className="filter-grid">
        <div className="filter-control">
          <label htmlFor="genre-select" className="filter-label">
            Genre
          </label>
          <select
            id="genre-select"
            className="filter-select"
            value={filters.genre ?? ''}
            onChange={(e) =>
              setFilters({genre: e.target.value ? Number(e.target.value) : undefined})
            }
          >
            <option value="">Any</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {/* Genre fetch status handled by parent if needed */}
        </div>

        <div className="filter-control">
          <label className="filter-label" htmlFor="year-select">
            Year
          </label>
          <select
            id="year-select"
            className="filter-select"
            value={filters.year ?? ''}
            onChange={(e) =>
              setFilters({year: e.target.value ? Number(e.target.value) : undefined})
            }
          >
            <option value="">Any</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-control filter-control-rating">
          <label className="filter-label">Rating</label>
          <div className="rating-range">
            <div className="rating-field">
              <label htmlFor="min-rating" className="sub-label">
                Min rating
              </label>
              <input
                id="min-rating"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={ratingMin}
                onChange={(e) => setFilters({minRating: Number(e.target.value)})}
              />
              <span className="rating-value">{ratingMin.toFixed(1)}</span>
            </div>

            <div className="rating-field">
              <label htmlFor="max-rating" className="sub-label">
                Max rating
              </label>
              <input
                id="max-rating"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={ratingMax}
                onChange={(e) => setFilters({maxRating: Number(e.target.value)})}
              />
              <span className="rating-value">{ratingMax.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="filter-control">
          <label htmlFor="sort-by" className="filter-label">
            Sort by
          </label>
          <select
            id="sort-by"
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => setFilters({sortBy: e.target.value as any})}
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release date</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="filter-control">
          <label className="filter-label">Order</label>
          <div className="order-toggle">
            <button
              type="button"
              className={`order-btn ${filters.sortOrder === 'asc' ? 'is-active' : ''}`}
              aria-pressed={filters.sortOrder === 'asc'}
              onClick={() => setFilters({sortOrder: 'asc'})}
            >
              Asc
            </button>
            <button
              type="button"
              className={`order-btn ${filters.sortOrder === 'desc' ? 'is-active' : ''}`}
              aria-pressed={filters.sortOrder === 'desc'}
              onClick={() => setFilters({sortOrder: 'desc'})}
            >
              Desc
            </button>
          </div>
        </div>
      </div>

      <aside className="filter-active">
        {hasActiveFilters ? (
          <div className="chips">
            {filters.genre !== undefined && (
              <span className="chip">Genre: {genres.find((g) => g.id === filters.genre)?.name ?? filters.genre}</span>
            )}
            {filters.year !== undefined && (
              <span className="chip">Year: {filters.year}</span>
            )}
            {filters.minRating !== undefined && (
              <span className="chip">Min rating: {filters.minRating}</span>
            )}
            {filters.maxRating !== undefined && (
              <span className="chip">Max rating: {filters.maxRating}</span>
            )}
          </div>
        ) : (
          <small className="filter-hint">No active filters</small>
        )}
      </aside>
    </section>
  );
}
