import { useQuery } from '@tanstack/react-query';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';
import { loadGenres } from '../util/movie-query';
import GenresPageContent from '../components/movie/GenresPageContent';


export default function GenresPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['movie-genres'],
    queryFn: loadGenres
  });

  let content;
  if (isPending) {
    content = <Spinner text="Loading available genres..." />
  }
  else if (isError || !data?.length) {
    content = <ErrorSection message="Failed to load genres" />
  }
  else if (data) {
    const genres = data.map(item => ({ ...item, 'data-genre-id': item.id, 'data-genre': item.name }));
    content = <GenresPageContent genres={genres} />
  }

  return content;
}