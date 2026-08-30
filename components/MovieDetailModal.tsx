"use client";

import { Spinner } from "@/components/spinner";
import { fetchMovieDetails } from "@/services/api";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  movieId: number | null;
  onClose: () => void;
};

export default function MovieDetailModal({ movieId, onClose }: Props) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movieId) {
      return;
    }

    let isMounted = true;

    const loadMovie = async () => {
      setMovie(null);
      setLoading(true);

      try {
        const movieData = await fetchMovieDetails(String(movieId));

        if (isMounted) {
          setMovie(movieData);
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);

        if (isMounted) {
          setMovie(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMovie();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  useEffect(() => {
    if (!movieId) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "0px";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [movieId, onClose]);

  if (!movieId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-[#101827] p-6 text-white shadow-2xl ring-1 ring-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <button 
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-sm text-white transition hover:bg-white/10"
        >
          Close
        </button>

        <div className="max-h-[calc(90vh-3rem)] overflow-y-auto pr-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex min-h-75 items-center justify-center">
              <Spinner />
            </div>
          ) : movie ? (
            <article className="grid gap-8 pt-8 md:grid-cols-[minmax(220px,320px)_1fr]">
              <div className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/no-movie.png"
                  }
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full rounded-2xl object-cover"
                  unoptimized
                  priority
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold md:text-5xl">{movie.title}</h2>

                <div className="mt-4 flex flex-wrap gap-3 text-light-200">
                  <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                  <span>{movie.runtime ? `${movie.runtime}m` : "Runtime N/A"}</span>
                  <span>{movie.original_language || "N/A"}</span>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-dark-100 px-3 py-2 text-white">
                  <span aria-hidden="true">★</span>
                  <strong>{Math.round(movie.vote_average)}/10</strong>
                  <span className="text-light-200">({movie.vote_count} votes)</span>
                </div>

                <div className="mt-5">
                  <p className="text-light-200 text-sm">Overview</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {movie.overview || "N/A"}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-light-200 text-sm">Genres</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {movie.genres?.length
                      ? movie.genres.map((genre) => genre.name).join(", ")
                      : "N/A"}
                  </p>
                </div>

                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-light-200 text-sm">Budget</p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {movie.budget ? `$${movie.budget / 1_000_000} million` : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-light-200 text-sm">Revenue</p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {movie.revenue
                        ? `$${Math.round(movie.revenue) / 1_000_000} million`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-light-200 text-sm">Production Companies</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {movie.production_companies?.length
                      ? movie.production_companies
                          .map((company) => company.name)
                          .join(", ")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </article>
          ) : (
            <div className="flex min-h-75 items-center justify-center text-white">
              Unable to load movie details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
