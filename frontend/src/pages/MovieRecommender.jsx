import { useEffect, useState } from "react";
import SearchInput from "../components/SearchInput.jsx";
import MovieCatalog from "../components/MovieCatalog.jsx";
import Spinner from "../components/Spinner.jsx";

import api from '../api/request.js';

// <button
//   disabled={!isOptionSelected}
//   className=" bg-violet-700 text-violet-50 uppercase font-medium text-[.95rem] px-8 py-3 rounded-full hover:bg-violet-600 disabled:bg-stone-600 disabled:text-stone-200">
//   Confirm
// </button>


export default function MoviePicker() {
  const [movieSearched, setMovieSearched] = useState('');
  const [returnedMovies, setReturnedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    async function searchMovie() {
      setIsLoading(true);
      try {
        const queryParam = (movieSearched.length > 0) ? `?movie=${movieSearched}` : '';
        const response = await api.get('/movies/search' + queryParam);
        const movies = response.data.movies.results;
        setReturnedMovies(movies);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    }
    searchMovie();
  }, [movieSearched]);

  let content;
  if (isLoading) content = <Spinner />
  else if (errorMessage) content = <p>{errorMessage}</p>;
  else content = <MovieCatalog movies={returnedMovies} />

  return (
    <section className="flex flex-col items-center justify-center">
      <SearchInput onUpdate={setMovieSearched} />
      <div>
        <h4 className="text-stone-300 font-medium tracking-wide">For a Better and More Customized Experience, Log In or Sign Up!</h4>
      </div>
      {content}
    </section>
  );
}