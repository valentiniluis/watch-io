import { useQuery } from "@tanstack/react-query";
import { loadInteractedMovies } from "../util/moviesLoaders";
import Spinner from "../components/UI/Spinner";
import ErrorPage from "./ErrorPage";
import MovieCatalog from "../components/movie/MovieCatalog";
import { useState } from "react";


export default function MyArea() {
  const [interactionType, setInteractionType] = useState('watchlist');

  const { data, isPending, isError, error } = useQuery({
    queryFn: () => loadInteractedMovies({ interactionType }),
    queryKey: ['interactions', { interactionType }]
  });

  let content;

  if (isPending) {
    content = <Spinner />
  }
  else if (isError) {
    content = <ErrorPage message={error.message} />
  }
  else if (data) {
    const buttonClass = 'bg-gray-700 text-xl font-bold tracking-wide px-8 py-4 rounded-t-2xl hover:bg-gray-800';
    content = (
      <section id="interacted-movies">
        <div className="flex gap-2 mx-[12vw] 2xl:mx-[15vw]">
          <button onClick={() => setInteractionType('watchlist')} className={buttonClass}>
            Watchlist
          </button>
          <button onClick={() => setInteractionType('like')} className={buttonClass}>
            Liked
          </button>
          <button onClick={() => setInteractionType('not interested')} className={buttonClass}>
            Not Interested
          </button>
        </div>
        <MovieCatalog movies={data.interactions} />
      </section>
    );
  }

  return (
    <>
      {content}
    </>
  );
}