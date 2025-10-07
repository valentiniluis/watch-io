import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import SearchInput from "../components/UI/SearchInput.jsx";
import MovieCatalog from "../components/movie/MovieCatalog.jsx";
import Spinner from "../components/UI/Spinner.jsx";
import { fetchMovies } from "../util/movie-query.js";
import Pagination from "../components/UI/Pagination.jsx";
import ErrorSection from "../components/UI/ErrorSection.jsx";


export default function MoviePicker() {
  const [movieSearched, setMovieSearched] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['movies', { searchTerm: movieSearched, page }],
    queryFn: fetchMovies,
  });

  function handleUpdateSearch(movie) {
    setMovieSearched(movie);
    setPage(1);
  }

  let content;
  if (isPending) {
    content = <Spinner />
  }

  else if (isError) {
    console.log(error);
    content = <ErrorSection message={error.message || 'Failed to load movies'} />;
  }

  else if (data) {
    content = (
      <div className="catalog-container">
        <MovieCatalog movies={data} />
        {/* valor 350 hardcoded, mas depende das interações do usuário com os filmes */}
        <Pagination current={page} max={350} setPage={setPage}/>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center">
      <SearchInput onUpdate={handleUpdateSearch} />
      {content}
    </section>
  );
}