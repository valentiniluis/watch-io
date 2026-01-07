import { useSelector } from "react-redux";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { fetchMedia } from "../query/media.js";
import SearchInput from "../components/UI/SearchInput.jsx";
import MovieCatalog from "../components/media/MovieCatalog.jsx";
import Spinner from "../components/UI/Spinner.jsx";
import ErrorSection from "../components/UI/ErrorSection.jsx";


export default function MoviePicker() {
  const mediaType = useSelector(state => state.media.type);
  const [movieSearched, setMovieSearched] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryKey: [mediaType, { searchTerm: movieSearched, page }],
    queryFn: fetchMedia,
  });

  function handleUpdateSearch(title) {
    setMovieSearched(title);
    setPage(1);
  }

  let content;
  if (isPending) {
    content = <Spinner />
  }
  else if (isError) {
    content = <ErrorSection message={error.message || 'Failed to load movies'} />;
  }
  else if (data) {
    const { pages } = data;
    const media = data[mediaType];
    content = (
      <div className="catalog-container">
        <MovieCatalog movies={media} currentPage={page} maxPages={pages} setPage={setPage} />
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center">
      <SearchInput onUpdate={handleUpdateSearch} key={mediaType} />
      {content}
    </section>
  );
}