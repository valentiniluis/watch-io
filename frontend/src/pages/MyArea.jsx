import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadInteractedMovies } from "../util/moviesLoaders";
import Spinner from "../components/UI/Spinner";
import MovieCatalog from "../components/movie/MovieCatalog";
import ErrorSection from "../components/UI/ErrorSection";


export default function MyArea() {
  const [interactionType, setInteractionType] = useState('watchlist');

  const { data, isPending, isError, error } = useQuery({
    queryFn: () => loadInteractedMovies({ interactionType }),
    queryKey: ['interactions', { interactionType }],
    retry: false
  });

  if (isError) {
    return <ErrorSection message={error.response?.data?.message || 'Failed to load interacted movies.'} />
  }

  const buttonClass = 'bg-gray-700 font-bold uppercase px-5 py-2.5 rounded-2xl hover:bg-stone-300 hover:text-stone-800';
  const activeBtn = ' bg-stone-200 text-stone-900';
  let content;

  if (isPending) {
    content = <Spinner />
  }
  else if (data) {
    const { interactions } = data;
    if (interactions.length === 0) {
      let message;
      switch (interactionType) {
        case 'watchlist':
          message = 'Your watchlist is empty.';
          break;
        case 'like':
          message = 'You have no liked movies yet.';
          break;
        case 'not interested':
          message = 'No movies added to the "Not Interested" list yet.';
          break;
      }
      content = <ErrorSection message={message} />;
    } else {
      content = <MovieCatalog movies={interactions} catalogType={interactionType} />;
    }
  }

  return (
    <section id="interacted-movies" className="catalog-container">
      <div>
        <div className="flex gap-2 mb-10">
          <button onClick={() => setInteractionType('watchlist')}
            className={buttonClass + (interactionType === 'watchlist' ? activeBtn : '')}
          >
            Watchlist
          </button>
          <button
            onClick={() => setInteractionType('like')}
            className={buttonClass + (interactionType === 'like' ? activeBtn : '')}
          >
            Liked
          </button>
          <button
            onClick={() => setInteractionType('not interested')}
            className={buttonClass + (interactionType === 'not interested' ? activeBtn : '')}
          >
            Not Interested
          </button>
        </div>
      </div>
      {content}
    </section>
  );
}