import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DropdownMenu from "../components/UI/DropdownMenu";
import MovieCatalog from '../components/movie/MovieCatalog';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';
import GenreDropdownMenu from '../components/movie/GenreDropdownMenu';
import { loadMoviesByGenre } from '../util/movie-query';

const orderByOptions = [
  { id: 'title.asc', name: "Title (ASC)", 'data-attribute': 'title.asc', 'data-label': 'Title (Ascending)' },
  { id: 'title.desc', name: 'Title (DESC)', 'data-attribute': 'title.desc', 'data-label': 'Title (Descending)' },
  { id: 'tmdb_rating.asc', name: "Rating (ASC)", 'data-attribute': 'tmdb_rating.asc', 'data-label': "Rating (Ascending)" },
  { id: 'tmdb_rating.desc', name: "Rating (DESC)", 'data-attribute': 'tmdb_rating.desc', 'data-label': "Rating (Descending)" },
  { id: 'year.asc', name: "Year (ASC)", 'data-attribute': 'year.asc', 'data-label': "Year (Asceding)" },
  { id: 'year.desc', name: "Year (DESC)", 'data-attribute': 'year.desc', 'data-label': "Year (Descending)" },
];


export default function GenresPage() {
  const [currentGenre, setCurrentGenre] = useState({ genre: null, genreId: null });
  const [sortAttribute, setSortAttribute] = useState({ label: orderByOptions[0].name, id: orderByOptions[0].id });

  const { data: movies, isLoading, isError, error } = useQuery({
    queryKey: ['movies', { genre: currentGenre.genreId, orderBy: sortAttribute.attribute }],
    queryFn: loadMoviesByGenre,
  });

  let content;
  if (isLoading || !currentGenre.genre) {
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

  return (
    <section>
      <div className="flex justify-evenly items-center">
        <GenreDropdownMenu currentGenre={currentGenre} setGenre={setCurrentGenre} />
        <DropdownMenu label="Sort By" className="bg-orange-500 font-semibold text-white tracking-wide text-md rounded-lg focus:ring-orange-400" text={sortAttribute.label} options={orderByOptions} onUpdate={handleSort} />
      </div>
      <div className='catalog-container'>
        {content}
      </div>
    </section>
  );
}