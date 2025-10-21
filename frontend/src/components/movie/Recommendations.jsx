import { useQuery } from "@tanstack/react-query";
import { loadRecommendations } from '../../util/movie-query';
import Spinner from "../UI/Spinner";
import ErrorSection from '../UI/ErrorSection';
import MovieList from "./MovieList";


export default function MovieRecommendations({ movieId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie-recommendations', { movieId }],
    queryFn: loadRecommendations
  });

  let content;
  if (isLoading) {
    content = <Spinner text="Loading Movie Recommendations..." />;
  }
  else if (isError) {
    content = <ErrorSection message="Failed to Load Recommendations." />;
  }
  else if (data) {
    const movies = data.recommendations;
    content = <MovieList title="You May Like" fallback="Failed to load recommendations" movies={movies} />
  }

  return (
    <>
      {content}
    </>
  );
}