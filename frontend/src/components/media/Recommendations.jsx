import { useQuery } from "@tanstack/react-query";
import { loadRecommendations } from '../../query/media';
import Spinner from "../UI/Spinner";
import ErrorSection from '../UI/ErrorSection';
import MovieList from "./MovieList";
import { useSelector } from "react-redux";


export default function MovieRecommendations() {
  const media = useSelector(state => state.media);

  const mediaType = media.type;
  const mediaId = media.data.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: [mediaType, { mediaId }],
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