import { useQuery } from '@tanstack/react-query';
import { getHomepage } from '../util/movie-query';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';
import MovieList from '../components/movie/MovieList';


export default function HomePage() {

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['homepage'],
    queryFn: getHomepage
  });

  let content;

  if (isPending) {
    content = <Spinner text="Loading movie genres..." />
  }
  else if (isError) {
    content = <ErrorSection message={error.message || 'Failed to load movie genres'} />
  }
  else if (data) {
    const { genres } = data;
    content = (
      <div>
        {Object.entries(genres).map(([genre, movies]) => (
          <MovieList key={genre} title={genre} movies={movies} />
        ))}
      </div>
    )
  }

  return (
    <section className='px-[5vw]'>
      <section id='recommendations-section'>
        <h1>Recommendations for you</h1>
        <p>...</p>
      </section>
      <section className='flex justify-center' id='genres-section'>
        {content}
      </section>
    </section>
  );
}