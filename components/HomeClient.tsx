"use client";

import MovieCard from "@/components/card";
// Imported from constants.ts to centralize configuration and avoid magic numbers in the code.
import {
    ALL_MOVIES_LOAD_DELAY_MS,
    API_BASE_URL,
    API_OPTIONS,
    EMPTY_POSTER_FALLBACK,
    HOME_SCROLL_KEY,
    SEARCH_DEBOUNCE_MS,
    TRENDING_CACHE_KEY,
    TRENDING_CACHE_TTL_MS,
    TRENDING_LOAD_DELAY_MS,
} from "@/components/constants";
import MovieDetailModal from "@/components/MovieDetailModal";
import { Search } from "@/components/search";
import { Spinner } from "@/components/spinner";
import { getTrendigMovies, updateSearchCount } from "@/services/appwrite";
import Image from "next/image";
import { useEffect, useState } from "react";

// Main landing page for Movie Munch.
// This screen is responsible for three core user actions:
// 1) showing the marketing hero/header,
// 2) letting the user search for movies,
// 3) displaying trending movies and the full movie list.
// The component coordinates data from TMDB (movie catalog) and Appwrite (trending/search tracking).
export default function HomeClient() {
  // selectedMovieId keeps the movie currently opened in the modal without forcing a route change.
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // searchTerm holds the text typed in the search box so the form remains controlled.
  const [searchTerm, setSearchTerm] = useState("");

  // errorMessage stores any fetch problem so the UI can show a friendly message instead of crashing.
  const [errorMessage, setErrorMessage] = useState("");

  // movies holds the main list of movies returned from TMDB.
  const [movies, setMovies] = useState<Movie[]>([]);

  // loading tells the UI whether the all-movies section is currently fetching data.
  const [loading, setLoading] = useState(false);

  // debouncedSearchTerm delays the search request by 700ms to avoid firing an API call on every keystroke.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  // trendingMovies stores the top searched movies coming from Appwrite.
  // This drives the "Trending Movies" section shown near the top of the page.
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);

  // trendingLoading tells the UI to show a spinner while the trending list is loading.
  const [trendingLoading, setTrendingLoading] = useState(false);

  // fetchMovies is responsible for pulling either:
  // - the default popular movie list, or
  // - a filtered search result based on the user's query.
  // After a successful fetch, it also updates the search-tracking database for the first matching movie.
  const fetchMovies = async (query = "") => {
    setLoading(true);
    setErrorMessage("");
    try {
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endPoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Simulated testing error");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies.");
        setMovies([]);
        return;
      }

      setMovies(data.results || []);

      // Update search count in the database when a search is active and results exist.
      if (query && data.results.length > 0) {
        const movie = data.results[0];
        console.log("Calling updateSearchCount with:", query);
        try {
          await updateSearchCount(query, movie);
          console.log("updateSearchCount succeeded");
        } catch (err) {
          console.error("updateSearchCount failed:", err);
        }
      }
    } catch (error) {
      console.error(`Error fetching movies:  ${error}`);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // loadTrendingMovies fetches the most searched movies from Appwrite.
  // It first checks localStorage so the page feels fast on repeat visits, then falls back to the database if no cache is available or if the cache is stale.
  const loadTrendingMovies = async () => {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(TRENDING_CACHE_KEY);

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as {
            fetchedAt: number;
            movies: TrendingMovie[];
          };

          if (Date.now() - parsed.fetchedAt < TRENDING_CACHE_TTL_MS) {
            setTrendingMovies(parsed.movies ?? []);
            return;
          }
        } catch (error) {
          console.warn("Trending cache is invalid, refreshing:", error);
        }
      }
    }

    setTrendingLoading(true);

    try {
      const trending = await getTrendigMovies();
      const nextTrending = trending ?? [];
      setTrendingMovies(nextTrending);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          TRENDING_CACHE_KEY,
          JSON.stringify({
            fetchedAt: Date.now(),
            movies: nextTrending,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    } finally {
      setTrendingLoading(false);
    }
  };

  // This effect delays the full movie fetch by 300ms so the page feels like it loads from top to bottom.
  // The trending section is intentionally prioritized above the all-movies list.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchMovies(debouncedSearchTerm);
    }, ALL_MOVIES_LOAD_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [debouncedSearchTerm]);

  // This effect loads the trending section soon after the page mounts so the hero and top content appear active immediately.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTrendingMovies();
    }, TRENDING_LOAD_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const persistScroll = () => {
    window.sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
  };

  const restoreScroll = () => {
    const savedScrollTop = window.sessionStorage.getItem(HOME_SCROLL_KEY);

    if (!savedScrollTop) {
      return;
    }

    const parsedValue = Number(savedScrollTop);

    if (Number.isFinite(parsedValue)) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: parsedValue,
          behavior: "smooth",
        });
      });
    }
  };

  // Restore the user's last scroll position when the browser brings the home page back from history.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const handleScroll = () => {
      persistScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pageshow", restoreScroll);
    window.addEventListener("popstate", restoreScroll);
    window.addEventListener("beforeunload", persistScroll);
    window.addEventListener("pagehide", persistScroll);

    restoreScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pageshow", restoreScroll);
      window.removeEventListener("popstate", restoreScroll);
      window.removeEventListener("beforeunload", persistScroll);
      window.removeEventListener("pagehide", persistScroll);
    };
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        {/* Header section: this contains the hero image, headline, and search input. */}
        <header>
          <Image
            src="/hero.png"
            alt="Hero"
            width={1200}
            height={500}
            priority
            className="xs:w-50 md:w-1/3"
          />
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Trending section: highlights the most popular search results from Appwrite and gives users a quick visual preview before the full catalog loads. */}
        <section className="trending">
          <h2>Trending Movies</h2>
          {trendingLoading ? (
            <Spinner />
          ) : trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (movie.movie_id) {
                        persistScroll();
                        window.dispatchEvent(
                          new CustomEvent("open-movie-modal", {
                            detail: { id: Number(movie.movie_id) },
                          })
                        );
                      }
                    }}
                    className="cursor-pointer border-0 bg-transparent p-0"
                  >
                    <Image
                      alt={`${movie.title} Poster`}
                      src={movie.poster_url || EMPTY_POSTER_FALLBACK}
                      width={160}
                      height={240}
                      unoptimized
                      onError={(event) => {
                        event.currentTarget.src = EMPTY_POSTER_FALLBACK;
                      }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* All-movies section: shows the main movie catalog from TMDB and is used when the user is browsing the full list after search or initial load. */}
        <section className="all-movies">
          <h2>All Movies</h2>
          {loading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={(movieId: number) => {
                    persistScroll();
                    setSelectedMovieId(movieId);
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <MovieDetailModal
        movieId={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />
    </main>
  );
}
