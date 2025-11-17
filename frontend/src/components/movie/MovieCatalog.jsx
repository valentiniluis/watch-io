import ErrorSection from "../UI/ErrorSection";
import MovieCard from "./MovieCard";
import Pagination from '../UI/Pagination';


export default function MovieCatalog({ movies, currentPage, maxPages, setPage }) {
  if (movies?.length === 0) return <ErrorSection message="No movies available" />

  return (
    <>
      <ul className="catalog">
        {movies.map(movie => <MovieCard key={movie.id} movie={movie} linkTo={`/search/${movie.id}`} />)}
      </ul>
      <Pagination current={currentPage} max={maxPages} setPage={setPage} />
    </>
  );
}