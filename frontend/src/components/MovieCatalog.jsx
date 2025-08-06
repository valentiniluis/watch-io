import MovieCard from "./MovieCard";

export default function MovieCatalog({ movies }) {
  return (
    <ul className="movie-list">
      {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
    </ul>
  );
}