import { useState } from "react";
import { sortOptions } from "../../util/constants";
import { useQuery } from "@tanstack/react-query";
import DropdownMenu from "../UI/DropdownMenu";
import { loadMoviesByGenre } from "../../util/movie-query";
import Spinner from "../UI/Spinner";
import MovieCatalog from './MovieCatalog';


export default function GenresPageContent({ genres }) {
  const [genre, setGenre] = useState({ name: genres[0].name, id: genres[0].id });
  const [sortAttribute, setSortAttribute] = useState({ attribute: sortOptions[0].id, label: sortOptions[0].name });

  const { data: movies, isLoading, isError, error } = useQuery({
    queryKey: ['movies', { genre: genre.id, orderBy: sortAttribute.attribute }],
    queryFn: loadMoviesByGenre,
  });

  let content;
  if (isLoading) {
    content = <Spinner text="Loading movies by genre..." />
  }
  else if (isError) {
    content = <ErrorSection message={error.message || "Failed to load movies."} />
  }
  else if (movies) {
    content = <MovieCatalog movies={movies} />
  }

  function handleSort(event) {
    const { attribute, label } = event.currentTarget.dataset;
    setSortAttribute({ attribute, label })
  }

  function handleUpdateGenre(event) {
    const { genreId, genre } = event.currentTarget.dataset;
    setGenre({ name: genre, id: genreId });
  }

  return (
    <section>
      <div className="flex justify-evenly items-center gap-3 px-2">
        <DropdownMenu label="Genre" className="bg-blue-600 text-white font-semibold rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide hover:bg-blue-700 focus:ring-blue-800" text={genre.name} options={genres} onUpdate={handleUpdateGenre} />
        <DropdownMenu label="Sort By" className="bg-orange-500 font-semibold text-white rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide focus:ring-orange-400" text={sortAttribute.label} options={sortOptions} onUpdate={handleSort} />
      </div>
      <div className='catalog-container'>
        {content}
      </div>
    </section>
  );
}