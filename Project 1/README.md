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


## Assignment Requirements Met

- React + TypeScript setup
- REST API integration with TanStack Query
- Responsive design
- Git workflow with issues/PRs
- Code quality (ESLint + Prettier)
- Environment configuration
- Modern development practices
