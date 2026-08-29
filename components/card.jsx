import Image from "next/image";
import Link from "next/link";

const MovieCard = ({
  movie: {
    id,
    title,
    poster_path,
    release_date,
    vote_average,
    original_language,
  },
}) => {
  return (
    <div className="movie-card">
      <Link href={`/movies/${id}`} aria-label={`View details for ${title}`}>
        <Image
          width={500}
          height={750}
          className="poster"
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "/no-movie.png"
          }
          alt={`${title} Poster`}
          unoptimized
          onError={(event) => {
            event.currentTarget.src = "/no-movie.png";
          }}
        />
      </Link>
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <Image src="/star.svg" alt="Star" width={16} height={16} />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
