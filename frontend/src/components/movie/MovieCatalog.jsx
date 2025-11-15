import ErrorSection from "../UI/ErrorSection";
import MovieCard from "./MovieCard";

export default function MovieCatalog({ movies }) {
  if (movies?.length === 0) return <ErrorSection message="No movies available" />

  return (
    <ul className="catalog">
      {movies.map(movie => <MovieCard key={movie.id} movie={movie} linkTo={`/search/${movie.id}`} />)}
    </ul>
  );
}