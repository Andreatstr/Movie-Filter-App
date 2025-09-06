# Movie Filter App

A React-based movie filtering application built with TypeScript that allows users to browse, filter, and manage movie collections using the TMDB API.

## Project Overview

This project is part of a web development course focusing on modern React development practices, REST API integration, and comprehensive testing strategies.

## Features

- Browse popular movies from TMDB
- Search movies by title
- Responsive design for mobile and desktop
- Mark movies as favorites (localStorage)
- Filter by genre, rating, and year
- Fast loading with TanStack Query caching

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **API**: The Movie Database (TMDB)
- **State Management**: TanStack Query
- **Testing**: Vitest + React Testing Library
- **Styling**: Plain CSS (responsive design)
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js v24.6.x or higher (currently using v22.13.1 - upgrade recommended)
- npm v11.x or higher
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd Project 1
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Add your TMDB API key to `.env`:

```
VITE_TMDB_API_KEY=your_api_key_here
```

5. Start the development server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix auto-fixable linting errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/          # Reusable React components
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── styles/             # CSS stylesheets
└── utils/              # Utility functions
```

## API Integration

Uses [The Movie Database (TMDB) API](https://developers.themoviedb.org/3) for movie data:

- Popular movies endpoint
- Search functionality
- Genre listings
- Movie details and images

## Contributing

1. Create GitHub issue inside Projects board
2. Create feature branch
3. Implement with tests
4. Submit pull request
5. Code review process

## License

This project is for educational purposes as part of NTNU web development course.

## MovieCard Component - Design Decisions

### Design Choices and Rationale

**No Movie Description in Card**
We deliberately chose not to include the movie description (`movie.overview`) in the MovieCard component. This decision is based on:

- **UX analysis of streaming services**: Netflix, Disney+, and others only show title, year, and rating on main pages
- **Modularity**: MovieCard can be reused in multiple contexts (lists, grids, search results)
- **Responsive design**: Without descriptions, cards are more consistent across mobile and desktop
- **Performance**: Less text content enables faster rendering and better layout stability
- **Visual hierarchy**: Focus on most important information first (title, rating, year)

**Placeholder Image Handling**

- Implemented custom placeholder (`/placeholder-movie.jpg`) instead of SVG icons
- Provides more consistent visual experience when images are missing
- Reduces layout shift when images load

**Responsive Approach**

- Defined three breakpoints: desktop (>768px), tablet (768px), mobile (480px)
- Scales text sizes and spacing proportionally
- Maintains aspect ratio (2:3) across all screen sizes for consistency

**TypeScript and Error Handling**

- Strict typing with `Movie` interface
- Graceful fallbacks for all missing data
- `imageError` state for robust image handling

### Test Coverage

**Complete test setup with Vitest and React Testing Library:**

**Snapshot Tests (3 tests)**

- Complete movie data with poster and metadata
- Movie without poster (shows placeholder)
- Movie with all missing data (fallback values)

**Component Rendering (5 tests)**

- Displays correct movie title from props
- Shows derived year from `release_date`
- Shows formatted rating with star
- Poster image with correct alt text and loading="lazy"
- Image src attribute generated via TMDB API

**Missing Data Handling (3 tests)**

- "Title Missing" when `title` is empty
- "Missing year" when `release_date` is missing
- "N/A" when `vote_average` is 0

**Placeholder Image Handling (2 tests)**

- Shows placeholder when `poster_path` is `null`
- Shows placeholder when `poster_path` is empty string

**User Interaction and State (1 test)**

- Simulates image error with `fireEvent.error()`
- Verifies `imageError` state changes
- Confirms placeholder appears after error

**Accessibility (2 tests)**

- Semantic HTML structure (article, figure, h2)
- ARIA label for rating ("Rating: 8.5 out of 10")

**Total: 16 tests with 100% pass rate**

- Covers props, state, and user interaction
- TMDB API mocking for isolated tests
- Snapshot tests for regression detection

## Assignment Requirements Met

- React + TypeScript setup
- REST API integration with TanStack Query
- Responsive design
- Git workflow with issues/PRs
- Code quality (ESLint + Prettier)
- Environment configuration
- Modern development practices
