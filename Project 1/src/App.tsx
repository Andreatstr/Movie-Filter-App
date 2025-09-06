import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from './services/tmdbApi';
import MovieCard from './components/MovieCard';
import './App.css';

function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => tmdbApi.getPopularMovies(1),
  });

  if (isLoading) {
    return (
      <main className="app">
        <section className="loading" aria-live="polite">Loading movies...</section>
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

  // Display the first movie as a demo
  const movie = data?.results[0];

  if (!movie) {
    return (
      <main className="app">
        <section className="error" role="alert">No movies found</section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Movie Card Demo</h1>
        <p>Displaying the first popular movie</p>
      </header>
      <section className="app-main">
        <MovieCard movie={movie} />
      </section>
    </main>
  );
}

export default App;