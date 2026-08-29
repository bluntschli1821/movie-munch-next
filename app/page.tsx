"use client";

import { API_BASE_URL, API_OPTIONS } from "@/components/constants";
import { getTrendigMovies, updateSearchCount } from "@/services/appwrite";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import MovieCard from "../components/card";
import { Search } from "../components/search";
import { Spinner } from "../components/spinner";
import "@/globals.css";


const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to fetch movies from the API
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce the search term to avoid too many API calls without relying on a third-party hook
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  // Trending movies
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

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

      //  Update search count in the database
      if (query && data.results.length > 0) {
        // Use the first movie from the search results
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

  const loadTrendingMovies = async () => {
    setTrendingLoading(true);

    try {
      const trending = await getTrendigMovies();
      setTrendingMovies(trending ?? []);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    } finally {
      setTrendingLoading(false);
    }
  };

  // Load the full movie list slightly later so the top-of-page trending section
  // feels like it loads first and the page reads from top to bottom.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchMovies(debouncedSearchTerm);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [debouncedSearchTerm]);

  // Loading Trending Movies
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTrendingMovies();
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <Image
            src="/hero.png"
            alt="Hero"
            width={1200}
            height={500}
            priority
            className="  xs:w-50 md:w-1/3"
          />
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="trending">
          <h2>Trending Movies</h2>
          {trendingLoading ? (
            <Spinner />
          ) : trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <Link
                    href={movie.movie_id ? `/movies/${movie.movie_id}` : "/"}
                  >
                    <Image
                      alt={`${movie.title} Poster`}
                      src={movie.poster_url || "/no-movie.png"}
                      width={160}
                      height={240}
                      unoptimized
                      onError={(event) => {
                        event.currentTarget.src = "/no-movie.png";
                      }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="all-movies">
          <h2>All Movies</h2>
          {loading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
