export const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

export const SEARCH_DEBOUNCE_MS = 700;
export const ALL_MOVIES_LOAD_DELAY_MS = 150;
export const TRENDING_LOAD_DELAY_MS = 50;
export const TRENDING_CACHE_KEY = "movie-munch-trending";
export const TRENDING_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
export const EMPTY_POSTER_FALLBACK = "/no-movie.png";
export const HOME_SCROLL_KEY = "movie-munch-home-scroll";