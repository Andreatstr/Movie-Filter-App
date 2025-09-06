import {useQuery} from '@tanstack/react-query';
import {tmdbApi} from './services/tmdbApi';

function App() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => tmdbApi.getPopularMovies(1),
  });

  console.log('API Response:', data);

  if (isLoading) return <div>Loading API...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>API Test</h1>
      <p>Check console for movie data</p>
      <p>Fetched {data?.results.length} movies</p>
    </div>
  );
}

export default App;
