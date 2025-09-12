import {useQuery} from '@tanstack/react-query';
import {tmdbApi} from './services/tmdbApi';
import {MovieViewer} from './components/MovieViewer';
import './App.css';

function App() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['popularMovies'],
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

  const movies = data?.results || [];

  return (
    <main className="app">
      <header className="app-header">
        <h1>Movie Card Demo</h1>
        <p>Displaying popular movies from TMDB</p>
      </header>

      <MovieViewer movies={movies} />
    </main>
  );
}

export default App;
