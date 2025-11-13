import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/UI/Spinner";
import MovieCatalog from "../components/movie/MovieCatalog";
import ErrorSection from "../components/UI/ErrorSection";
import { getRatings, getInteractedMovies } from "../util/movie-query";
import Ratings from "../components/movie/Ratings";


export default function MyArea() {
  const [contentType, setContentType] = useState('watchlist');

  const { data, isPending, isError, error } = useQuery({
    queryFn: (contentType === 'ratings') ? getRatings : getInteractedMovies,
    queryKey: (contentType === 'ratings') ? ['ratings'] : ['interactions', { interactionType: contentType }],
    retry: false
  });

  const buttonClass = 'bg-gray-700 font-bold uppercase px-5 py-2.5 rounded-2xl hover:bg-stone-300 hover:text-stone-800';
  const activeBtn = ' bg-stone-200 text-stone-900';
  let content;

  if (isPending) {
    let messageComplement;
    switch (contentType) {
      case 'like':
        messageComplement = 'liked movies';
        break;
      case 'not interested':
        messageComplement = '"Not Interested" list';
        break;
      default:
        messageComplement = contentType;
        break;
    }
    content = <Spinner text={'Loading ' + messageComplement} />;
  }
  else if (isError) {
    content = <ErrorSection message={error.response?.data?.message || 'Failed to load data.'} />;
  }
  else if (data?.interactions?.length === 0 || data?.ratings?.length === 0) {
    let message;
    switch (contentType) {
      case 'watchlist':
        message = 'Your watchlist is empty.';
        break;
      case 'like':
        message = 'You have no liked movies yet.';
        break;
      case 'not interested':
        message = 'No movies added to the "Not Interested" list yet.';
        break;
      case 'ratings':
        message = 'No movie ratings yet!';
        break;
    }
    content = <ErrorSection message={message} />;
  }
  else if (contentType === 'ratings') {
    content = <Ratings ratings={data.ratings} />
  }
  else {
    content = <MovieCatalog movies={data.interactions} catalogType={contentType} />;
  }

  return (
    <section id="interacted-movies" className="catalog-container">
      <div className="flex justify-between mb-10">
        <div className="flex gap-2">
          <button onClick={() => setContentType('watchlist')}
            className={buttonClass + (contentType === 'watchlist' ? activeBtn : '')}
          >
            Watchlist
          </button>
          <button
            onClick={() => setContentType('like')}
            className={buttonClass + (contentType === 'like' ? activeBtn : '')}
          >
            Liked
          </button>
          <button
            onClick={() => setContentType('not interested')}
            className={buttonClass + (contentType === 'not interested' ? activeBtn : '')}
          >
            Not Interested
          </button>
        </div>
        <div>
          <button onClick={() => setContentType('ratings')}
            className={buttonClass + (contentType === 'ratings' ? activeBtn : '')}
          >
            Ratings
          </button>
        </div>
      </div>
      {content}
    </section>
  );
}