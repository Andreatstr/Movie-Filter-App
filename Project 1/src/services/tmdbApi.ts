import type {Movie, MovieResponse, Genre} from '../types/movie';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = {
  async getPopularMovies(page = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
  },

  async getTopRatedMovies(page = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
  },

  async getNowPlayingMovies(page = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
  },

  async getUpcomingMovies(page = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
  },

  async searchMovies(query: string, page = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to search movies');
    return response.json();
  },

  async getMoviesByGenre(genreId: number, page = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch movies by genre');
    return response.json();
  },

  async getGenres(): Promise<{genres: Genre[]}> {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch genres');
    return response.json();
  },

  async getMovieDetails(movieId: number): Promise<Movie> {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return response.json();
  },

  getImageUrl(
    path: string | null,
    size: 'w200' | 'w500' | 'original' = 'w500'
  ): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },
};
