import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import Spinner from "../components/UI/Spinner";
import MovieCatalog from "../components/media/MovieCatalog";
import ErrorSection from "../components/UI/ErrorSection";
import Ratings from "../components/rating/Ratings";
import DropdownMenu from '../components/UI/DropdownMenu';
import { getMyAreaEmptyMessage, getMyAreaLoadingMessage } from "../util/functions";
import { getMyAreaContent } from "../query/user";
import { myAreaCategories, RATINGS } from "../util/constants";

const initialState = {
  label: myAreaCategories[0]["data-label"],
  category: myAreaCategories[0]["data-category"]
};

export default function MyArea() {
  const { isLoggedIn } = useSelector(state => state.auth);
  const mediaType = useSelector(state => state.media.type);

  const [contentType, setContentType] = useState(initialState);
  const [page, setPage] = useState(1);

  const { category, label } = contentType;
  const mainQueryKey = (category === RATINGS) ? 'rating' : 'interaction';

  const { data, isPending, isError, error } = useQuery({
    queryFn: getMyAreaContent,
    queryKey: [mainQueryKey, { interactionType: category, page, mediaType }],
    retry: false
  });

  if (!isLoggedIn) return <ErrorSection message="Authentication failed or expired. Please re-autheticate to access your private area." />;

  let content;
  if (isPending) {
    const message = getMyAreaLoadingMessage(category);
    content = <Spinner text={message} />;
  }
  else if (isError) {
    content = <ErrorSection message={error.response?.data?.message || 'Failed to load data.'} />;
  }
  else if (data?.interactions?.length === 0 || data?.ratings?.length === 0) {
    const message = getMyAreaEmptyMessage(category, mediaType);
    content = <ErrorSection message={message} />;
  }
  else if (category === RATINGS) {
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
        <DropdownMenu label="Category" options={myAreaCategories} text={label} onUpdate={updateContentType} className="bg-cyan-900 font-semibold text-white rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide focus:ring-cyan-950 hover:bg-cyan-950" />
      </div>
      {content}
    </section>
  );
}