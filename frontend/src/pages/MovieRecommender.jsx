import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from '@tanstack/react-query';
import SearchInput from "../components/UI/SearchInput.jsx";
import MovieCatalog from "../components/movie/MovieCatalog.jsx";
import Spinner from "../components/UI/Spinner.jsx";
import Auth from "../components/auth/AuthSection.jsx";
import { fetchMovies } from "../util/movie-query.js";
import Pagination from "../components/UI/Pagination.jsx";


export default function MoviePicker() {
  const [movieSearched, setMovieSearched] = useState('');
  const [page, setPage] = useState(1);

  // refatorar esse componente para useSelector ficar em seu próprio componente e não re-executar a cada mudança de input
  const auth = useSelector(reduxState => reduxState.auth);
  const isAuth = auth.isLoggedIn;

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
    content = <p>{error.message}</p>;
  }

  else if (data) {
    content = (
      <>
        <MovieCatalog movies={data} />
        <Pagination current={page} max={50} setPage={setPage}/>
      </>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center">
      {!isAuth && <Auth />}
      <SearchInput onUpdate={handleUpdateSearch} />
      {content}
    </section>
  );
}