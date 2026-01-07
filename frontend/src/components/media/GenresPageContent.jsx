import { useSelector } from "react-redux";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DropdownMenu from "../UI/DropdownMenu";
import { loadMediaByGenre } from "../../query/media";
import Spinner from "../UI/Spinner";
import MovieCatalog from './MovieCatalog';
import { sortOptions } from "../../util/constants";
import ErrorSection from "../UI/ErrorSection";


const initialState = {
  label: sortOptions[0]["data-label"],
  attribute: sortOptions[0]["data-attribute"]
};

export default function GenresPageContent({ genres }) {
  const mediaType = useSelector(state => state.media.type);
  const [genre, setGenre] = useState({ name: genres[0].name, id: genres[0].id });
  const [sortAttribute, setSortAttribute] = useState(initialState);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [mediaType, { genre: genre.id, orderBy: sortAttribute.attribute, page }],
    queryFn: loadMediaByGenre,
  });

  const filteredOptions = genres.filter(g => g.name !== genre.name);

  let content;
  if (isLoading) {
    content = <Spinner text="Loading movies by genre..." />
  }
  else if (isError) {
    content = <ErrorSection message={error.message || "Failed to load movies."} />
  }
  else if (data) {
    const { pages } = data;
    const media = data[mediaType];
    content = (
      <div className="catalog-container">
        <MovieCatalog movies={media} currentPage={page} maxPages={pages} setPage={setPage} />
      </div>
    )
  }

  function handleSort(event) {
    const { attribute, label } = event.currentTarget.dataset;
    setSortAttribute({ attribute, label })
  }

  function handleUpdateGenre(event) {
    const { genreId, genre } = event.currentTarget.dataset;
    setGenre({ name: genre, id: genreId });
    setPage(1)
  }

  return (
    <section>
      <div className="flex justify-evenly items-center gap-3 px-2">
        <DropdownMenu 
          label="Genre" 
          className="bg-blue-600 text-white font-semibold rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide hover:bg-blue-700 focus:ring-blue-800" 
          text={genre.name} 
          options={filteredOptions} 
          onUpdate={handleUpdateGenre} 
        />
        <DropdownMenu 
          label="Sort By" 
          className="bg-cyan-900 font-semibold text-white rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide focus:ring-cyan-950 hover:bg-cyan-950" 
          text={sortAttribute.label} 
          options={sortOptions} 
          onUpdate={handleSort} 
        />
      </div>
      {content}
    </section>
  );
}