import { useQuery } from '@tanstack/react-query';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';
import { loadGenres } from '../util/movie-query';
import GenresPageContent from '../components/media/GenresPageContent';
import { useSelector } from 'react-redux';


export default function GenresPage() {
  const { type: mediaType } = useSelector(state => state.media);
  const { data, isPending, isError } = useQuery({
    queryKey: [mediaType, 'genres'],
    queryFn: loadGenres
  });

  let content;
  if (isPending) {
    content = <Spinner text="Loading available genres..." />
  }
  else if (isError || !data?.genres?.length) {
    content = <ErrorSection message="Failed to load genres" />
  }
  else if (data) {
    const genres = data.genres.map(item => ({ id: item.id, name: item.genre_name, 'data-genre-id': item.id, 'data-genre': item.genre_name }));
    content = <GenresPageContent genres={genres} key={mediaType} />
  }

  return content;
}