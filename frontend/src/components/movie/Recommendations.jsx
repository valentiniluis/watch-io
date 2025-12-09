import { useQuery } from "@tanstack/react-query";
import { loadRecommendations } from '../../util/movie-query';
import Spinner from "../UI/Spinner";
import ErrorSection from '../UI/ErrorSection';
import MovieList from "./MovieList";
import { useSelector } from "react-redux";


export default function MovieRecommendations() {
  const movie = useSelector(state => state.movie);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie-recommendations', { movieId: movie.id }],
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
    const { recommendations } = data;
    content = <MovieList title="You May Like" fallback="Failed to load recommendations" movies={recommendations} />
  }

  return content;
}