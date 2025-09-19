# Design Decisions and Testing Documentation

This document explains the design choices made during development and documents what has been tested.

## MovieCard Component

### Design Choices and Rationale

#### No Movie Description in Card

We deliberately chose not to include the movie description (`movie.overview`) in the MovieCard component. This decision is based on:

- **UX analysis of streaming services**: Netflix, Disney+, and others only show title, year, and rating on main pages
- **Modularity**: MovieCard can be reused in multiple contexts (lists, grids, search results)
- **Responsive design**: Without descriptions, cards are more consistent across mobile and desktop
- **Performance**: Less text content enables faster rendering and better layout stability
- **Visual hierarchy**: Focus on most important information first (title, rating, year)

#### Placeholder Image Handling

- Implemented custom placeholder (`/placeholder-movie.jpg`) instead of SVG icons
- Provides more consistent visual experience when images are missing
- Reduces layout shift when images load

#### Responsive Approach

- Defined three breakpoints: desktop (>768px), tablet (768px), mobile (480px)
- Scales text sizes and spacing proportionally
- Maintains aspect ratio (2:3) across all screen sizes for consistency

#### TypeScript and Error Handling

- Strict typing with `Movie` interface
- Graceful fallbacks for all missing data
- `imageError` state for robust image handling

### Test Coverage

**Complete test setup with Vitest and React Testing Library:**

#### Snapshot Tests (3 tests)

- Complete movie data with poster and metadata
- Movie without poster (shows placeholder)
- Movie with all missing data (fallback values)

#### Component Rendering (5 tests)

- Displays correct movie title from props
- Shows derived year from `release_date`
- Shows formatted rating with star
- Poster image with correct alt text and loading="lazy"
- Image src attribute generated via TMDB API

#### Missing Data Handling (3 tests)

- "Title Missing" when `title` is empty
- "Missing year" when `release_date` is missing
- "N/A" when `vote_average` is 0

#### Placeholder Image Handling (2 tests)

- Shows placeholder when `poster_path` is `null`
- Shows placeholder when `poster_path` is empty string

#### User Interaction and State (1 test)

- Simulates image error with `fireEvent.error()`
- Verifies `imageError` state changes
- Confirms placeholder appears after error

#### Accessibility (2 tests)

- Semantic HTML structure (article, figure, h2)
- ARIA label for rating ("Rating: 8.5 out of 10")

#### Total: 16 tests with 100% pass rate

- Covers props, state, and user interaction
- TMDB API mocking for isolated tests
- Snapshot tests for regression detection
