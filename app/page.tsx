"use client";

import { getTrendigMovies, updateSearchCount } from "@/app/services/appwrite";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import MovieCard from "./components/card";
import { Search } from "./components/search";
import { Spinner } from "./components/spinner";
import "./globals.css";


const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to fetch movies from the API
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce the search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 700, [searchTerm]);

  // Trending movies
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);

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
    try {
      const trending = await getTrendigMovies();
      setTrendingMovies(trending ?? []);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  // Loading Movies debouncing for Search
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchMovies(debouncedSearchTerm);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [debouncedSearchTerm]);

  // Loading Trending Movies
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTrendingMovies();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <Image src="/hero.png" alt="Hero" width={1200} height={500} priority />
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <Link href={movie.movie_id ? `/movies/${movie.movie_id}` : "/"}>
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
          </section>
        )}

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
