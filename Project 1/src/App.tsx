import {useQuery} from '@tanstack/react-query';
import {tmdbApi} from './services/tmdbApi';
import MovieCard from './components/MovieCard';
import type {Movie} from './types/movie';
import './App.css';

function App() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => tmdbApi.getPopularMovies(1),
  });

  if (isLoading) {
    return (
      <main className="app">
        <section className="loading" aria-live="polite">
          Loading movies...
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app">
        <section className="error" role="alert">
          Error: {(error as Error).message}
        </section>
      </main>
    );
  }

  // Display only 1 movie as a demo plus a test movie with missing data
  const movies = data?.results.slice(0, 1) || [];

  // Add minimal test movie with missing data
  const testMovie: Movie = {
    id: 999999,
    title: '',
    poster_path: null,
    release_date: '',
    vote_average: 0,
    overview: '',
    backdrop_path: null,
    vote_count: 0,
    genre_ids: [],
    popularity: 0,
    adult: false,
    original_language: '',
    original_title: '',
  };

  const allMovies = [...movies, testMovie];

  return (
    <main className="app">
      <header className="app-header">
        <h1>Movie Card Demo</h1>
        <p>Displaying 1 popular movie + 1 test movie with missing data</p>
      </header>
      <section className="app-main">
        {allMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </section>
    </main>
  );
}

export default App;
