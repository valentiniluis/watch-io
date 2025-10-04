import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import ErrorPage from './ErrorPage.jsx';
import MovieRecommendations from '../components/movie/MovieRecommendations.jsx';
import MovieInfo from '../components/movie/MovieInfo.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import ErrorSection from '../components/UI/ErrorSection.jsx';


export default function SelectedMoviePage() {
  const loaderData = useLoaderData();
  const { movie, recommendations } = loaderData;

  // recomendações são extraídas apenas após os dados do filme
  return (
    <section className='px-[5vw]'>
      <Suspense fallback={<Spinner text="Loading Movie Data..." />}>
        <Await errorElement={<ErrorPage message="This Movie Is Unavailable." />} resolve={movie}>
          {loaded => (
            <>
              <MovieInfo movie={loaded.movieData} />
              <Suspense fallback={<Spinner text="Loading Recommendations..." />} >
                <Await errorElement={<ErrorSection message="Failed to Load Recommendations." />} resolve={recommendations}>
                  {({ recommendations }) => <MovieRecommendations movies={recommendations} />}
                </Await>
              </Suspense>
            </>
          )}
        </Await>
      </Suspense>
    </section>
  );
}