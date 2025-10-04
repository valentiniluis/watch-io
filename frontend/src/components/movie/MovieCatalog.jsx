import MovieCard from "./MovieCard";

export default function MovieCatalog({ movies, catalogType }) {
  return (
    <ul className="catalog">
      {movies.map(movie => <MovieCard key={movie.id} type={catalogType} movie={movie} linkTo={movie.id} />)}
    </ul>
  );
}