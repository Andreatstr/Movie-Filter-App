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
        <div className="loading">Loading movies...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app">
        <div className="error">
          Error loading movies:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </main>
    );
  }

  const movies = data?.results || [];

  return (
    <main className="app">
      <header className="app-header">
        <h1>Movie Browser</h1>
        <p>Discover popular movies</p>
      </header>

      <MovieViewer movies={movies} />
    </main>
  );
}

export default App;
