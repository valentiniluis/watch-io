import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DropdownMenu from "../components/UI/DropdownMenu";
import api from '../api/request';
import MovieCatalog from '../components/movie/MovieCatalog';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';


export default function GenresPage() {
  const [currentGenre, setCurrentGenre] = useState({ genre: null, genreId: null });

  const { data: genres } = useQuery({
    queryKey: ['movie-genres'],
    queryFn: async () => {
      const response = await api.get('/movies/genres');
      return response.data.genres;
    }
  });

  const { data: movies, isLoading, isError, error } = useQuery({
    queryKey: ['movies', { genre: currentGenre.genreId }],
    queryFn: async (context) => {
      const { queryKey } = context;
      const { genre } = queryKey[1];

      const url = (genre) ? '/movies/genre/' + genre : '/movies/search';
      const response = await api.get(url);
      return response.data.movies;
    }
  });


  let content;
  if (isLoading) {
    content = <Spinner text="Loading movies by genre..." />    
  }
  if (isError) {
    content = <ErrorSection message={error.message || "Failed to load movies."} />
  }
  if (movies) {
    content = <MovieCatalog movies={movies} />
  }

  function handleUpdateGenre(event) {
    const { genreId, genre } = event.currentTarget.dataset;
    setCurrentGenre({ genreId, genre });
  }

  return (
    <section>
      <DropdownMenu text={!currentGenre.genre ? "Genre" : currentGenre.genre} options={genres} onUpdate={handleUpdateGenre} />
      <div className='catalog-container'>
        {content}
      </div>
    </section>
  );
}