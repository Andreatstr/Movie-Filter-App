import {useMemo, useState, useEffect} from 'react';
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
  
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle min/max changes with validation
  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, ratingMax);
    setFilters({minRating: newMin});
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, ratingMin);
    setFilters({maxRating: newMax});
  };

  return (
    <section className="filter-panel" aria-label="Filters">
      <header className="filter-header">
        <h2 className="filter-title">Filters</h2>
        <section className="filter-actions">
          <button
            type="button"
            className="filter-reset-btn"
            onClick={() => reset()}
            disabled={!hasActiveFilters}
            aria-disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </section>
      </header>

      <form className="filter-grid">
        <fieldset className="filter-control">
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
        </fieldset>

        <fieldset className="filter-control">
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
        </fieldset>

        <fieldset className="filter-control filter-control-rating">
          <label className="filter-label">Rating</label>
          {isMobile ? (
            // Mobile: Dual-handle slider
            <div className="dual-range-slider">
              <div className="slider-track"></div>
              <div 
                className="slider-range" 
                style={{
                  left: `calc(22px + (100% - 44px) * ${ratingMin / 10})`,
                  width: `calc((100% - 44px) * ${(ratingMax - ratingMin) / 10})`
                }}
              />
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={ratingMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="range-min"
                aria-label="Minimum rating"
              />
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={ratingMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="range-max"
                aria-label="Maximum rating"
              />
              <div className="range-values">
                <span className="range-value">Min: {ratingMin.toFixed(1)}</span>
                <span className="range-value">Max: {ratingMax.toFixed(1)}</span>
              </div>
            </div>
          ) : (
            // Desktop: Original separate sliders
            <section className="rating-range">
              <section className="rating-field">
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
              </section>

              <section className="rating-field">
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
              </section>
            </section>
          )}
        </fieldset>

        <fieldset className="filter-control">
          <label htmlFor="sort-by" className="filter-label">
            Sort by
          </label>
          <select
            id="sort-by"
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => setFilters({sortBy: e.target.value as MovieFilters['sortBy']})}
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release date</option>
            <option value="title">Title</option>
          </select>
        </fieldset>

        <fieldset className="filter-control">
          <label className="filter-label">Order</label>
          <section className="order-toggle">
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
          </section>
        </fieldset>
      </form>

      <aside className="filter-active">
        {hasActiveFilters ? (
          <section className="chips">
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
          </section>
        ) : (
          <small className="filter-hint">No active filters</small>
        )}
      </aside>
    </section>
  );
}