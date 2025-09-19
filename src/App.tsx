import {useQuery} from '@tanstack/react-query';
import {tmdbApi} from './services/tmdbApi';
import {MovieViewer} from './components/MovieViewer';
import './App.css';
import './styles/accessibility.css';

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
      {/* Skip Navigation Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#movie-navigation" className="skip-link">
        Skip to movie navigation
      </a>

      <header className="app-header">
        <h1 className="app-logo">
          <span className="logo-movie">Movie</span>
          <span className="logo-heaven">Heaven</span>
        </h1>
        <p className="sr-only">Browse popular movies from TMDB</p>
      </header>

      <div id="main-content" tabIndex={-1}>
        <MovieViewer movies={movies} />
      </div>
    </main>
  );
}

export default App;
