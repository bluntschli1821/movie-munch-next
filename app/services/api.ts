const movieDetailsCache = new Map<string, MovieDetails>();
const SESSION_STORAGE_CACHE_KEY = "movie-munch-detail-cache";

const readPersistedMovieDetails = () => {
  if (typeof window === "undefined") {
    return {} as Record<string, MovieDetails>;
  }

  try {
    const storedValue = window.sessionStorage.getItem(SESSION_STORAGE_CACHE_KEY);
    return storedValue ? (JSON.parse(storedValue) as Record<string, MovieDetails>) : {};
  } catch {
    return {} as Record<string, MovieDetails>;
  }
};

const writePersistedMovieDetails = (cache: Record<string, MovieDetails>) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      SESSION_STORAGE_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch {
    // Ignore storage errors so the app still works if the browser blocks storage.
  }
};

const hydrateMovieDetailsCache = () => {
  const persistedCache = readPersistedMovieDetails();

  for (const [movieId, movie] of Object.entries(persistedCache)) {
    movieDetailsCache.set(movieId, movie);
  }
};

hydrateMovieDetailsCache();

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
  },
};

export const fetchMovies = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch movies, ${response.statusText}`);
  }

  const data = await response.json();

  return data.results;
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  const cachedMovie = movieDetailsCache.get(movieId);

  if (cachedMovie) {
    return cachedMovie;
  }

  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );
    if (!response.ok) throw new Error(`Failed to fetch movie details`);
    const data = await response.json();
    movieDetailsCache.set(movieId, data);

    const persistedDetails = readPersistedMovieDetails();
    persistedDetails[movieId] = data;
    writePersistedMovieDetails(persistedDetails);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
