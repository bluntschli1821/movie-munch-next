import { fetchMovieDetails } from "@/app/services/api";
import Image from "next/image";
// import Link from "next/link";
import { notFound } from "next/navigation";
// import { CornerUpLeft } from "@deemlol/next-icons";

interface MovieDetailsPageProps {
  params: Promise<{ id: string }>;
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="mt-5">
    <p className="text-light-200 text-sm">{label}</p>
    <p className="mt-2 text-sm font-bold text-white">{value || "N/A"}</p>
  </div>
);

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params;
  let movie;

  try {
    movie = await fetchMovieDetails(id);
  } catch {
    notFound();
  }

  return (
    <main>
      <div className="wrapper">
        {/* <Link href="/" className="mb-8 text-light-200 hover:text-white inline-flex items-center gap-2">
          <CornerUpLeft className="h-5 w-5" />
          Back to movies
        </Link> */}

        <article className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[minmax(240px,360px)_1fr]">
          <Image
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "/no-movie.png"
            }
            alt={movie.title}
            width={500}
            height={750}
            className="lg:h-auto md:h-auto w-full rounded-2xl sm:h-150 xs:*:h-75"
            unoptimized
            priority
          />

          <div>
            <h1 className="text-left text-3xl font-bold text-white md:text-5xl">
              {movie.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-3 text-light-200">
              <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
              <span>{movie.runtime ? `${movie.runtime}m` : "Runtime N/A"}</span>
              <span>{movie.original_language || "N/A"}</span>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-dark-100 px-3 py-2 text-white">
              <span aria-hidden="true">&#9733;</span>
              <strong>{Math.round(movie.vote_average)}/10</strong>
              <span className="text-light-200">({movie.vote_count} votes)</span>
            </div>

            <Detail label="Overview" value={movie.overview || "N/A"} />
            <Detail
              label="Genres"
              value={
                movie.genres.length
                  ? movie.genres.map((genre) => genre.name).join(", ")
                  : "N/A"
              }
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Detail
                label="Budget"
                value={
                  movie.budget ? `$${movie.budget / 1_000_000} million` : "N/A"
                }
              />
              <Detail
                label="Revenue"
                value={
                  movie.revenue
                    ? `$${Math.round(movie.revenue) / 1_000_000} million`
                    : "N/A"
                }
              />
            </div>
            <Detail
              label="Production Companies"
              value={
                movie.production_companies.length
                  ? movie.production_companies
                      .map((company) => company.name)
                      .join(", ")
                  : "N/A"
              }
            />
          </div>
        </article>
      </div>
    </main>
  );
}
