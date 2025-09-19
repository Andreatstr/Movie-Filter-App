# Movie Filter App

A React-based movie filtering application built with TypeScript that allows users to browse, filter, and manage movie collections using the TMDB API.

## Link to webpage
[Live Demo](http://it2810-26.idi.ntnu.no/project1/)

Make sure to connect to edoram VPN if you are accessing from outside NTNU.

## Project Overview

This project is part of the NTNU IT2810 web development course, demonstrating modern React development practices, REST API integration, accessibility features, and comprehensive testing strategies. The application showcases fundamental web technologies while implementing advanced features like responsive design, state management, and performance optimization.

### Course Learning Objectives Demonstrated

- **Fundamental HTML and CSS**: Semantic HTML structure with accessibility features
- **Accessibility Requirements**: WCAG-compliant navigation, ARIA labels, screen reader support
- **Responsive Design**: Mobile-first design with three breakpoints (480px, 768px, 1024px)
- **TypeScript and Functional Programming**: Strict typing, custom hooks, functional components
- **React State and Props**: Complex state management with custom hooks and context
- **REST API Usage**: TMDB API integration with TanStack Query for caching
- **Node and npm**: Modern toolchain with Vite, ESLint, Prettier
- **Linting and Code Quality**: Comprehensive linting rules and automated formatting
- **Git Development**: Feature branches, pull requests, and structured commit messages
- **AI Assistance**: Extensive use of Claude Code for development and quality control

## Features

### Core Functionality

- **Single-movie carousel interface** with intuitive navigation
- **Real-time search** with debounced API calls and live suggestions
- **Advanced filtering system** with genre, year, and rating filters
- **Favorites management** with cross-tab synchronization
- **Responsive design** optimized for mobile, tablet, and desktop
- **Accessibility features** including keyboard navigation and screen reader support

### Technical Features

- **Performance optimization** with React Query caching and debouncing
- **State persistence** using localStorage and sessionStorage
- **Error handling** with graceful fallbacks and user feedback
- **Type safety** with comprehensive TypeScript interfaces
- **Testing coverage** with 46+ tests including snapshots and user interactions

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **API**: The Movie Database (TMDB)
- **State Management**: TanStack Query
- **Testing**: Vitest + React Testing Library
- **Styling**: Plain CSS
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js v24.6.x or higher
- npm v11.x or higher / pnpm v10.x or higher
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository

```bash
git clone https://git.ntnu.no/IT2810-H25/T26-Project-1.git
cd "Project 1"
```

2. Install dependencies

```bash
pnpm install
```

Alternatively, you can use npm:

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
pnpm run dev
```

Alternatively, you can use npm:

```bash
npm run dev
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

Can also use npm instead of pnpm for all scripts.
Check `package.json` for details and quick access.

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

- **149 tests** across all components
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

## Design Decisions and Architecture

### API Integration Strategy

**Decision**: Centralized TMDB API service with typed interfaces

**Rationale**: Single source of truth prevents inconsistencies and enables comprehensive testing

**Implementation**: `src/services/tmdbApi.ts` with TypeScript interfaces for all endpoints

### State Management Approach

**Decision**: Custom hooks with localStorage/sessionStorage persistence

**Rationale**: Lightweight solution avoiding Redux complexity while maintaining data persistence

**Implementation**:

- `useFavorites`: Cross-tab synchronized favorites with `useSyncExternalStore`
- `useFilters`: Advanced filtering with real-time application
- `useDebounce`: Performance optimization for search functionality

### Navigation Pattern

**Decision**: Single-movie carousel with multiple navigation methods

**Rationale**: Improves user experience with intuitive controls and accessibility

**Implementation**: Arrow keys, next/previous buttons, and dropdown selector

### Responsive Design Strategy

**Decision**: Implement breakpoints at 480px, 768px, and 1024px, start mobile-first

**Rationale**: Easier to scale up for larger screens

**Implementation**:

- **Mobile**: 480px and below
- **Mobile to Tablet**: 481px to 767px
- **Tablet**: 768px to 1023px
- **Desktop**: 1024px and above

### Performance Optimizations

**Decision**: Multi-layered caching and optimization strategy

**Rationale**: Minimize API calls and improve user experience

**Implementation**:

- React Query caching (5 minutes default, 24 hours for genres)
- Debounced search (400ms delay in SearchBar)
- useMemo for expensive computations (filtered movies, available years, favorites)
- useCallback for event handlers to prevent unnecessary re-renders

### Accessibility Implementation

**Decision**: WCAG 2.1 AA compliance with comprehensive screen reader support

**Rationale**: Ensure usability for all users, following inclusive design principles

**Implementation**:

- Skip navigation links for keyboard users
- Custom focus trap hook for modal-like components
- Comprehensive ARIA labels and live regions for dynamic updates
- Semantic HTML structure (article, figure, section, nav, aside)

### Component Design Decisions

#### MovieCard Component

**Decision**: Minimal information display (title, year, rating) without description

**Rationale**: UX analysis of streaming services (Netflix, Disney+) shows this pattern works best

**Implementation**:

- Visual hierarchy focusing on essential information
- Custom placeholder image for missing posters
- Responsive aspect ratio (2:3) maintained across all screen sizes
- Graceful fallbacks for missing data

#### Search Functionality

**Decision**: Live search with suggestions and session persistence

**Rationale**: Provides instant feedback matching modern search expectations

**Implementation**:

- 400ms debounced search to prevent API spam
- Live suggestion dropdown with movie selection
- Session storage persistence of search terms
- Clear button for immediate reset

#### Favorites Management

**Decision**: Cross-tab synchronized favorites using `useSyncExternalStore`

**Rationale**: Prevents data inconsistency when multiple tabs are open

**Implementation**:

- Optimistic localStorage updates with fallbacks
- Minimal data storage (id, title, poster, rating)
- Timestamp-based sorting for recency
- Heart icon toggle following universal conventions

#### Filter System

**Decision**: Dropdown panel with responsive controls

**Rationale**: Saves screen space while providing comprehensive filtering

**Implementation**:

- Responsive dual-range slider for mobile rating filters
- Separate single sliders for desktop precision
- Real-time filter chips showing active filters
- Modal-like behavior with focus trap

For more detailed design decisions and rationale, see the `/docs` directory.

## AI-Assisted Development Process

### Claude Code Usage

This project was developed with extensive assistance from Claude Code, Anthropic's AI-powered development tool.

#### Code Generation and Implementation

- **Component Architecture**: Claude Code helped structure React components with proper TypeScript typing
- **Testing Suites**: Developed comprehensive test coverage including snapshots and user interaction tests

#### Quality Assurance and Optimization

- **Code Review**: Claude Code reviewed all implementations for best practices and potential issues
- **Performance Analysis**: AI identified optimization opportunities (debouncing, memoization, caching)

#### Problem Solving and Debugging

- **Cross-browser Compatibility**: Identified and resolved browser-specific issues
- **Performance Bottlenecks**: Analyzed and optimized API call patterns
- **Testing Edge Cases**: Generated comprehensive test scenarios including error conditions

#### Human Oversight and Decision Making

While Claude Code provided substantial technical assistance, all architectural decisions, feature priorities, and design choices were made by the team. The AI served as an intelligent pair programming partner, offering suggestions and implementations that were then reviewed, modified, and approved.

### Benefits of AI-Assisted Development

- **Faster Development**: Significantly reduced implementation time for complex features
- **Higher Code Quality**: Easy to troubleshoot and optimize code
- **Comprehensive Testing**: More thorough test coverage than would be feasible manually
- **Best Practices**: Consistent application of modern React and TypeScript patterns
- **Learning Enhancement**: AI explanations improved understanding of complex concepts

## Detailed Technical Implementation

### Component Architecture

```
src/
├── components/           # React components
│   ├── MovieCard.tsx    # Individual movie display
│   ├── MovieViewer.tsx  # Main carousel interface
│   ├── FilterPanel.tsx  # Advanced filtering
│   └── SearchBar.tsx    # Debounced search
├── hooks/               # Custom React hooks
│   ├── useDebounce.ts   # Search optimization
│   ├── useFavorites.ts  # Cross-tab sync
│   ├── useFilters.ts    # Filter management
│   └── useFocusTrap.ts  # Accessibility
├── services/            # API integration
│   └── tmdbApi.ts       # TMDB service layer
├── types/               # TypeScript definitions
│   └── movie.ts         # Movie interfaces
└── utils/               # Utility functions
    ├── aria.ts          # ARIA label generation
    └── localStorage.ts  # Storage abstraction
```

## Browser and Device Compatibility

### Browser Testing

The application has been tested in development mode across modern browsers:

- **Chrome**
- **Firefox**
- **Edge**
- **Arc**

### Device Testing

- **Responsive Design**: Tested across multiple viewport sizes using browser DevTools
- **Mobile Simulation**: iPhone and Android
- **Tablet Simulation**: iPad and tablet
- **Desktop**: Multiple resolution testing (1920x1080, 1366x768)

### Responsive Breakpoints

- **Mobile**: 480px and below
- **Mobile to Tablet**: 481px to 767px
- **Tablet**: 768px to 1023px
- **Desktop**: 1024px and above
