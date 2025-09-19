export function getNavigationButtonLabel(
  direction: 'previous' | 'next',
  currentMovie?: string,
  targetMovie?: string
): string {
  const baseAction = direction === 'previous' ? 'Go to previous movie' : 'Go to next movie';

  if (currentMovie && targetMovie) {
    return `${baseAction}: ${targetMovie}. Currently viewing ${currentMovie}`;
  }

  return baseAction;
}

export function getFavoriteButtonLabel(
  movieTitle: string,
  isFavorited: boolean
): string {
  const action = isFavorited ? 'Remove from favorites' : 'Add to favorites';
  return `${action}: ${movieTitle}`;
}

export function getMovieSelectLabel(totalMovies: number): string {
  return `Select movie to view. ${totalMovies} movies available`;
}

export function getStatusAnnouncement(
  type: 'navigation' | 'favorite' | 'filter' | 'search',
  data: {
    movieTitle?: string;
    position?: { current: number; total: number };
    favoritesCount?: number;
    searchResults?: number;
    filterApplied?: string;
  }
): string {
  switch (type) {
    case 'navigation':
      if (data.movieTitle && data.position) {
        return `Now viewing ${data.movieTitle}, movie ${data.position.current} of ${data.position.total}`;
      }
      return 'Movie navigation updated';

    case 'favorite':
      if (data.movieTitle && data.favoritesCount !== undefined) {
        const action = data.favoritesCount > 0 ? 'added to' : 'removed from';
        return `${data.movieTitle} ${action} favorites. ${data.favoritesCount} total favorites`;
      }
      return 'Favorites updated';

    case 'filter':
      if (data.filterApplied) {
        return `Filter applied: ${data.filterApplied}`;
      }
      return 'Filters updated';

    case 'search':
      if (data.searchResults !== undefined) {
        return `Search completed. ${data.searchResults} result${data.searchResults !== 1 ? 's' : ''} found`;
      }
      return 'Search updated';

    default:
      return 'Content updated';
  }
}

