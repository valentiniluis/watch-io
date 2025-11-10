import { Suspense } from 'react';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';
import MovieList from '../components/movie/MovieList';
import { Await, useLoaderData } from 'react-router-dom';
import { mainGenres } from '../util/constants.js';


export default function HomePage() {
  const moviesData = useLoaderData();

  const content = (
    <>
      {mainGenres.map(genre => {
        const Fallback = (
          <div className='my-48'>
            <Spinner text={`Loading ${genre.name} movies...`} />
          </div>
        ); 

        return (
          <Suspense fallback={Fallback} key={genre.id}>
            <Await errorElement={<ErrorSection message="Failed to load genre" />} resolve={moviesData[genre.name]}>
              {({ movies }) => <MovieList title={genre.name} movies={movies || []} />}
            </Await>
          </Suspense>
        );
      })}
    </>
  )

  return (
    <section className='px-[5vw]'>
      <section className="text-center my-40" id='recommendations-section'>
        <h1 className='text-2xl font-bold'>Our Recommendations For You</h1>
        <p>...</p>
      </section>
      <section id='genres-section'>
        {content}
      </section>
    </section>
  );
}