import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/UI/Spinner";
import MovieCatalog from "../components/movie/MovieCatalog";
import ErrorSection from "../components/UI/ErrorSection";
import { getRatings, getInteractedMovies } from "../util/movie-query";
import Ratings from "../components/movie/Ratings";
import MyAreaButton from "../components/UI/MyAreaButton";
import Pagination from '../components/UI/Pagination';
import { getMyAreaEmptyMessage, getMyAreaLoadingMessage } from "../util/functions";


export default function MyArea() {
  const [contentType, setContentType] = useState('watchlist');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryFn: (contentType === 'ratings') ? getRatings : getInteractedMovies,
    queryKey: (contentType === 'ratings') ? ['ratings', { page }] : ['interactions', { interactionType: contentType, page }],
    retry: false
  });

  let content;
  if (isPending) {
    const message = getMyAreaLoadingMessage(contentType);
    content = <Spinner text={message} />;
  }
  else if (isError) {
    content = <ErrorSection message={error.response?.data?.message || 'Failed to load data.'} />;
  }
  else if (data?.interactions?.length === 0 || data?.ratings?.length === 0) {
    const message = getMyAreaEmptyMessage(contentType);
    content = <ErrorSection message={message} />;
  }
  else if (contentType === 'ratings') {
    const { ratings, pages } = data;
    content = (
      <>
        <Ratings ratings={ratings} />
        <Pagination current={page} max={pages} setPage={setPage} />
      </>
    );
  }
  else {
    const { pages, interactions } = data;
    content = (
      <>
        <MovieCatalog movies={interactions} catalogType={contentType} />
        <Pagination current={page} max={pages} setPage={setPage} />
      </>
    )
  }

  function updateContentType(newType) {
    setContentType(newType);
    setPage(1);
  }

  return (
    <section id="interacted-movies" className="catalog-container">
      <div className="flex justify-between mb-10">
        <div className="flex gap-2">
          <MyAreaButton text="Watchlist" active={contentType === 'watchlist'} onClick={() => updateContentType('watchlist')} />
          <MyAreaButton text="Like" active={contentType === 'like'} onClick={() => updateContentType('like')} />
          <MyAreaButton text="Not Interested" active={contentType === 'not interested'} onClick={() => updateContentType('not interested')} />
        </div>
        <div>
          <MyAreaButton text="Ratings" active={contentType === 'ratings'} onClick={() => updateContentType('ratings')} />
        </div>
      </div>
      {content}
    </section>
  );
}