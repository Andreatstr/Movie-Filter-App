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

- Node.js v24.6.x or higher
- npm v11.x or higher
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository

```bash
git clone <git@git.ntnu.no:IT2810-H25/T26-Project-1.git>
cd "Project 1"
```

    Alt:

```bash
git clone <https://git.ntnu.no/IT2810-H25/T26-Project-1.git>
cd "Project 1"
```

2. Install dependencies

```bash
pnpm install
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
pnpm run dev
```

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Check for linting errors
- `pnpm run lint:fix` - Fix auto-fixable linting errors
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check code formatting
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run test:ui` - Open Vitest UI

## Project Structure

```
src/
├── components/          # Reusable React components
│   └── __tests__/      # Component tests
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

## Testing

This project implements comprehensive testing using Vitest and React Testing Library.

### Testing Framework
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **jsdom** - Browser environment simulation
- **@testing-library/jest-dom** - Additional matchers

### Test Coverage
- **46 tests** across all components
- **Snapshot tests** - Verify component rendering consistency
- **Component tests** - Props, state, and behavior validation
- **User interaction tests** - Button clicks, keyboard navigation, form inputs
- **API mocking** - No real network requests during testing
- **Browser storage mocking** - sessionStorage and localStorage testing

### Test Types Implemented

#### Snapshot Tests
- Component rendering with different props
- State variations (empty data, missing images, etc.)
- Responsive layout changes

#### Component Prop Testing
- Required and optional props validation
- Default prop behavior
- Error handling with missing data

#### State Testing
- Movie navigation index tracking
- Expand/collapse text functionality
- Session storage persistence

#### User Interaction Testing
- Button clicks (next/previous navigation)
- Keyboard navigation (arrow keys)
- Dropdown selection changes
- Image error handling

#### API Mocking
- TMDB API calls intercepted with `vi.mock()`
- No real HTTP requests during tests
- Predictable test data for consistency

### Running Tests
```bash
pnpm run test        # Watch mode
pnpm run test:run    # Single run
pnpm run test:ui     # Interactive UI
```

### Browser Testing
*To be documented when manual testing is completed*

### Mobile Device Testing
*To be documented when device testing is completed*

### Test File Organization
```
src/components/__tests__/
├── MovieCard.test.tsx      # 16 tests - Component props, state, accessibility
└── MovieViewer.test.tsx    # 30 tests - Navigation, keyboard, storage
```

### Future Testing Areas (To be implemented with remaining features)
- **Favorites functionality** - localStorage persistence, click interactions
- **Filtering/sorting** - UI controls, state persistence, data transformation
- **Enhanced accessibility** - Screen reader compatibility, keyboard navigation patterns


## Contributing

1. Create GitHub issue inside Projects board
2. Create feature branch
3. Implement with tests
4. Submit pull request
5. Code review process

## License

This project is for educational purposes as part of NTNU web development course.

## Assignment Requirements Met

- React + TypeScript setup
- REST API integration with TanStack Query
- Responsive design
- Git workflow with issues/PRs
- Code quality (ESLint + Prettier)
- Environment configuration
- Comprehensive testing with Vitest
- Modern development practices
