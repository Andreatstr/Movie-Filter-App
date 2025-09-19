import {useQuery} from '@tanstack/react-query';
import {tmdbApi} from './services/tmdbApi';
import {MovieViewer} from './components/MovieViewer';
import {MotionProvider} from './components/MotionProvider';
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
    <MotionProvider>
      <main className="app">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#movie-navigation" className="skip-link">
          Skip to movie navigation
        </a>
        
        <header className="app-header">
          <h1>Movies</h1>
          <p>Browse popular movies from TMDB</p>
        </header>

        <div id="main-content" tabIndex={-1}>
          <MovieViewer movies={movies} />
        </div>
      </main>
    </MotionProvider>
  );
}

export default App;
