/**
 * ARIA Utilities for Consistent Accessibility Implementation
 * WCAG 2.1 Level AA Compliance
 */

/**
 * Generate descriptive ARIA label for movie position
 */
export function getMoviePositionLabel(current: number, total: number, movieTitle?: string): string {
  if (movieTitle) {
    return `Showing ${movieTitle}, movie ${current} of ${total}`;
  }
  return `Movie ${current} of ${total}`;
}

/**
 * Generate ARIA label for navigation buttons
 */
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

/**
 * Generate ARIA label for favorite button
 */
export function getFavoriteButtonLabel(
  movieTitle: string,
  isFavorited: boolean
): string {
  const action = isFavorited ? 'Remove from favorites' : 'Add to favorites';
  return `${action}: ${movieTitle}`;
}

/**
 * Generate ARIA label for movie dropdown
 */
export function getMovieSelectLabel(totalMovies: number): string {
  return `Select movie to view. ${totalMovies} movies available`;
}

/**
 * Generate ARIA label for search with suggestions
 */
export function getSearchLabel(hasResults: boolean, resultCount?: number): string {
  const base = 'Search for movies';
  if (hasResults && resultCount !== undefined) {
    return `${base}. ${resultCount} suggestion${resultCount !== 1 ? 's' : ''} available`;
  }
  return base;
}

/**
 * Generate ARIA label for filter controls
 */
export function getFilterLabel(filterType: string, currentValue?: string): string {
  const base = `Filter movies by ${filterType}`;
  if (currentValue) {
    return `${base}. Currently set to ${currentValue}`;
  }
  return `${base}. No filter applied`;
}

/**
 * Generate ARIA label for favorites counter
 */
export function getFavoritesCountLabel(count: number): string {
  if (count === 0) {
    return 'No favorite movies';
  }
  return `${count} favorite movie${count !== 1 ? 's' : ''}`;
}

/**
 * Generate ARIA label for rating display
 */
export function getRatingLabel(rating: number, maxRating: number = 10): string {
  return `Rating: ${rating} out of ${maxRating} stars`;
}

/**
 * Generate ARIA label for movie overview with read more functionality
 */
export function getOverviewLabel(
  overview: string,
  isExpanded: boolean,
  movieTitle: string
): string {
  const truncated = overview.length > 200;
  if (!truncated) {
    return `Plot summary for ${movieTitle}: ${overview}`;
  }
  
  if (isExpanded) {
    return `Full plot summary for ${movieTitle}: ${overview}. Press Show Less to collapse`;
  } else {
    const truncatedText = overview.substring(0, 200);
    return `Plot summary for ${movieTitle}: ${truncatedText}... Press Show More to expand full summary`;
  }
}

/**
 * Generate ARIA live region announcement for dynamic changes
 */
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

/**
 * Generate ARIA describedby text for complex interactions
 */
export function getHelpText(context: 'keyboard-navigation' | 'search' | 'filters'): string {
  switch (context) {
    case 'keyboard-navigation':
      return 'Use left and right arrow keys to navigate between movies, or use the dropdown to jump to a specific movie';
      
    case 'search':
      return 'Start typing to search for movies. Use the dropdown suggestions or press Enter to search';
      
    case 'filters':
      return 'Use filters to narrow down movie results by genre, year, rating, or sorting options';
      
    default:
      return '';
  }
}

/**
 * Create ARIA attributes object for easier component integration
 */
export function createAriaAttributes(config: {
  label?: string;
  describedBy?: string;
  live?: 'polite' | 'assertive' | 'off';
  expanded?: boolean;
  pressed?: boolean;
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}): Record<string, any> {
  const attrs: Record<string, any> = {};
  
  if (config.label) attrs['aria-label'] = config.label;
  if (config.describedBy) attrs['aria-describedby'] = config.describedBy;
  if (config.live) attrs['aria-live'] = config.live;
  if (config.expanded !== undefined) attrs['aria-expanded'] = config.expanded;
  if (config.pressed !== undefined) attrs['aria-pressed'] = config.pressed;
  if (config.current !== undefined) attrs['aria-current'] = config.current;
  
  return attrs;
}