import {useQuery} from '@tanstack/react-query';
import {tmdbApi} from './services/tmdbApi';
import MovieCard from './components/MovieCard';
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

  const movies = data?.results.slice(0, 1) || [];

  return (
    <main className="app">
      <header className="app-header">
        <h1>Movie Card Demo</h1>
        <p>Displaying popular movies from TMDB</p>
      </header>
      <section className="app-main">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} size="large" />
        ))}
      </section>
    </main>
  );
}

export default App;
