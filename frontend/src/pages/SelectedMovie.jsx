import { useLoaderData } from 'react-router-dom';
import noPoster from '/no-movie.png';
import MovieCard from '../components/MovieCard';
import { Fragment } from 'react';
import ErrorPage from './ErrorPage';


// dividir em componentes menores
export default function SelectedMoviePage() {
  const loaderData = useLoaderData();
  const movie = loaderData.movieData;

  console.log(movie);
  if (!movie) return (
    <ErrorPage message="This Movie Is Unavailable." />
  )

  const { title, poster_path, overview, tagline } = movie;

  const genres = movie.genres.map((genre, index) => (
    <Fragment key={genre.name}>
      <p>
        {genre.name}
      </p>
      {index < movie.genres.length - 1 ? <p>•</p> : null}
    </Fragment>
  ));

  const poster = poster_path || noPoster;

  let recommendations = <h3>No Recommendations Available</h3>;
  let ratings = null;

  if (movie.recommendations?.results?.length > 0) {
    recommendations = (
      <section className='my-12'>
        <h3 className='text-2xl mb-4'>You May Like</h3>
        <div className='recommendations'>
          {movie.recommendations.results.map(rec => <MovieCard key={rec.id} movie={rec} />)}
        </div>
      </section>
    )
  }

  if (movie.ratings?.length > 0) {
    ratings = (
      <section className='flex justify-center gap-[20%] text-center'>
        {movie.ratings.map(rating => (
          <div key={rating.Source}>
            <p className='text-stone-400 font-medium text-xs'>{rating.Source}</p>
            <p className='text-stone-100 text-[1.1rem] font-bold'>{rating.Value}</p>
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className='px-[5vw]'>
      <div className='flex mt-12 justify-center'>
        <img className="max-h-[500px]" src={poster} alt={title + ' Movie Poster'} />
        <div className='w-full mx-20 max-w-[40rem] flex flex-col justify-between'>
          <h2 className='text-4xl text-center text-stone-100 font-semibold tracking-wide'>{title}</h2>
          {tagline ? <h4 className='text-center font-medium text-xl text-stone-200'>{tagline}</h4> : null}
          {ratings}
          <p className='text-[1.1rem] text-justify'>{overview}</p>
          <div className='flex gap-6'>
            <p className='tracking-wider'>{movie.runtime}</p>
            <p className='tracking-wide'>{movie.year}</p>
          </div>
          <div className='flex gap-3 text-stone-300'>
            {genres}
          </div>
        </div>
      </div>
      <div className='my-10'>
        <h3 className='text-3xl font-semibold text-stone-100'>More Information</h3>
        {movie.director?.length > 0 ? <p className="text-stone-300 font-medium mt-4">Directed by {movie.director}</p> : null}
        {movie.actors?.length > 0 ? <p className="text-stone-300 font-medium mt-4">Starring {movie.actors}</p> : null}
        <p className="text-stone-300 font-medium mt-4">Available on...</p>
      </div>
      {recommendations}
    </section>
  );
}