import { useQuery } from "@tanstack/react-query";
import { loadUserRecommendations } from "../../util/movie-query";
import Spinner from "../UI/Spinner";
import ErrorSection from "../UI/ErrorSection";
import MovieList from "./MovieList";


export default function RecommendationsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['user-recommendations'],
    queryFn: loadUserRecommendations
  });

  let content;
  if (isPending) {
    content = <Spinner text="Loading our custom recommendations..." />
  }
  else if (isError) {
    content = <ErrorSection message={`Failed to load movies - ${error.message}`} />
  }
  else if (data) {
    const { recommendations } = data;
    content = <MovieList movies={recommendations} />
  }

  return (
    <section className="my-20" id='recommendations-section'>
      <h1 className='text-center text-2xl font-bold'>Our Recommendations For You</h1>
      {content}
    </section>
  );
}