import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import Spinner from "../components/UI/Spinner";
import MovieCatalog from "../components/movie/MovieCatalog";
import ErrorSection from "../components/UI/ErrorSection";
import Ratings from "../components/rating/Ratings";
import DropdownMenu from '../components/UI/DropdownMenu';
import { getMyAreaEmptyMessage, getMyAreaLoadingMessage } from "../util/functions";
import { getRatings, getInteractedMovies } from "../util/movie-query";
import { myAreaCategories } from "../util/constants";

const initialState = {
  label: myAreaCategories[0]["data-label"],
  category: myAreaCategories[0]["data-category"]
};

export default function MyArea() {
  const { isLoggedIn } = useSelector(state => state.auth);
  const [contentType, setContentType] = useState(initialState);
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryFn: (contentType.category === 'ratings') ? getRatings : getInteractedMovies,
    queryKey: (contentType.category === 'ratings') ? ['ratings', { page }] : ['interactions', { interactionType: contentType.category, page }],
    retry: false
  });

  if (!isLoggedIn) return <ErrorSection message="Authentication failed or expired. Please re-autheticate to access your private area." />;

  let content;
  if (isPending) {
    const message = getMyAreaLoadingMessage(contentType);
    content = <Spinner text={message} />;
  }
  else if (isError) {
    content = <ErrorSection message={error.response?.data?.message || 'Failed to load data.'} />;
  }
  else if (data?.interactions?.length === 0 || data?.ratings?.length === 0) {
    const message = getMyAreaEmptyMessage(contentType.category);
    content = <ErrorSection message={message} />;
  }
  else if (contentType.category === 'ratings') {
    const { ratings, pages } = data;
    content = <Ratings ratings={ratings} currentPage={page} maxPages={pages} setPage={setPage} />
  }
  else {
    const { pages, interactions } = data;
    content = <MovieCatalog movies={interactions} currentPage={page} maxPages={pages} setPage={setPage} />
  }

  function updateContentType(event) {
    const { label, category } = event.currentTarget.dataset;
    setContentType({ label, category });
    setPage(1);
  }

  return (
    <section id="interacted-movies" className="catalog-container">
      <div className="flex justify-center">
        <DropdownMenu label="Category" options={myAreaCategories} text={contentType.label} onUpdate={updateContentType} className="bg-cyan-900 font-semibold text-white rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide focus:ring-cyan-950 hover:bg-cyan-950" />
      </div>
      {content}
    </section>
  );
}