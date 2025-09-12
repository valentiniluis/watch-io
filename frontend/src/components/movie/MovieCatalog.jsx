import MovieCard from "./MovieCard";

export default function MovieCatalog({ movies }) {
  return (
    <ul className="catalog">
      {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
    </ul>
  );
}