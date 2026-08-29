# Movie Munch

Movie Munch is a movie discovery app built with Next.js that helps users browse popular films, search for titles, and view trending movies based on search activity. The app combines a modern movie catalog with lightweight tracking data so users can see what is popular in the community and easily explore a full movie list.

## Overview

This project is designed to feel like a polished movie landing page and browsing experience. It includes:

- a hero section with branded messaging
- a search bar for filtering movies
- a trending movies section driven by stored search activity
- a full movie listing from TMDB
- movie detail pages for selected titles
- a lightweight Appwrite layer to track search popularity

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Appwrite for trending/search tracking
- TMDB API for the movie catalog
- Tailwind CSS for styling

## Features

### Movie discovery
Users can explore a catalogue of movies pulled from TMDB and filter the list by search term.

### Trending section
The app tracks search terms and counts how often a title is searched. That data is ranked and shown in the trending section near the top of the homepage.

### Movie detail view
Each movie card links to a dedicated details page where users can see additional metadata such as budget, revenue, genres, runtime, overview, and production companies.

### Performance-friendly behavior
The app includes lightweight UX improvements such as debouncing search input and caching trending results in localStorage for faster repeat visits.

## Project Structure

```text
movie-munch-next/
├── app/
│   ├── components/
│   │   ├── card.jsx
│   │   ├── search.jsx
│   │   └── spinner.jsx
│   ├── movies/
│   │   └── [id]/page.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── constants.ts
├── app/services/
│   ├── api.ts
│   └── appwrite.ts
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── README.md
└── .env.local
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root and add the following values:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_appwrite_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_appwrite_collection_id
```

### 3. Start the app

```bash
npm run dev
```

Open http://localhost:3000 to view the app in the browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Appwrite Setup

This project uses Appwrite to store search activity and power the trending section.

The app writes records with fields such as:

- `searchTerm`
- `movie_id`
- `title`
- `count`
- `poster_url`

The trending query then sorts those records by the `count` value and returns the most searched items.

## TMDB Integration

TMDB provides the movie catalog and metadata used throughout the app. The project calls the TMDB API for:

- popular movie discovery
- movie search results
- movie detail data
- posters and rating information

## Deployment

This app is ready to be deployed on platforms such as Vercel.

When deploying, make sure all environment variables are set in the production environment so the app can access both TMDB and Appwrite correctly.

## Notes for Contributors

- The homepage logic is primarily in `app/page.tsx`.
- The Appwrite database logic lives in `app/services/appwrite.ts`.
- The search input component lives in `app/components/search.jsx`.
- Movie detail and card styling are defined throughout the app structure.

## License

This project is currently for personal and demo use. Add a license file if you plan to distribute or commercialize it publicly.

## Summary

Movie Munch is a simple but polished movie discovery app that combines search, trending insights, and movie details into a clean user experience. It is a strong example of a modern Next.js frontend integrated with a lightweight backend data layer for community-driven trending content.
