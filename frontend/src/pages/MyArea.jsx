import { useQuery } from "@tanstack/react-query";
import { loadInteractedMovies } from "../util/moviesLoaders";
import Spinner from "../components/UI/Spinner";
import ErrorPage from "./ErrorPage";
import MovieCatalog from "../components/movie/MovieCatalog";


export default function MyArea() {
  const type = 'watchlist';

  const { data, isPending, isError, error } = useQuery({
    queryFn: () => loadInteractedMovies({ type }),
    queryKey: ['interactions', { type }]
  });

  let content;

  if (isPending) {
    content = <Spinner />
  }
  else if (isError) {
    content = <ErrorPage message={error.message} />
  }
  else if (data) {
    console.log(data);
    content = (
      <>
        <h1 className="section-title">My Watchlist</h1>
        <MovieCatalog movies={data.interactions} />
      </>
    );
  }

  return (
    <>
      {content}
    </>
  );
}