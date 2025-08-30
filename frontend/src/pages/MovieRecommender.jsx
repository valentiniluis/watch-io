import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from '@tanstack/react-query';
import SearchInput from "../components/UI/SearchInput.jsx";
import MovieCatalog from "../components/movie/MovieCatalog.jsx";
import Spinner from "../components/UI/Spinner.jsx";
import Auth from "../components/auth/AuthSection.jsx";
import { fetchMovies } from "../util/query.js";


export default function MoviePicker() {
  const [movieSearched, setMovieSearched] = useState('');

  const auth = useSelector(reduxState => reduxState.auth);
  const isAuth = auth.isLoggedIn;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['movies', { searchTerm: movieSearched }],
    queryFn: (obj) => fetchMovies({ ...obj, search: movieSearched }),
  });

  let content;

  if (isPending) {
    content = <Spinner />
  }

  else if (isError) {
    console.log(error);
    content = <p>{error.message}</p>;
  }

  else if (data) {
    content = <MovieCatalog movies={data} />;
  }

  return (
    <section className="flex flex-col items-center justify-center">
      {!isAuth ? <Auth /> : <h1>Welcome, {auth.user}!</h1>}
      <SearchInput onUpdate={setMovieSearched} />
      {content}
    </section>
  );
}