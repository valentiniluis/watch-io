import { useState } from 'react';
import { useSelector } from 'react-redux';
import MovieRatings from './MovieRatings.jsx';
import Toast from '../UI/Toast.jsx';
import MovieInteractions from './MovieInteractions.jsx';
import noPoster from '/no-movie.png';


export default function MovieInfo({ movie }) {
  const auth = useSelector(reduxState => reduxState.auth);
  const [error, setError] = useState();
  const { isLoggedIn } = auth;

  const { title, poster_path, overview, tagline, year, runtime, genres } = movie;
  const poster = poster_path || noPoster;


  let errorBlock = null;
  if (error) {
    errorBlock = (
      <div className='flex justify-center'>
        <Toast message={error} />
      </div>
    );
  }
  return (
    <>
      {errorBlock}
      <div className='movie-info-container'>
        <img src={poster} alt={title + ' Movie Poster'} />
        <div className='text-container'>
          <h1 className='movie-name'>{title}</h1>
          {tagline && <h4 className='tagline'>{tagline}</h4>}
          {movie.ratings?.length > 0 && <MovieRatings ratings={movie.ratings} />}
          {/* <p className='text-justify mb-6 text-[.9rem] md:text-[1rem]'>{overview}</p> */}
          {/* add new component for interaction buttons => Like, Don't Show and Watchlist */}
          {isLoggedIn && <MovieInteractions movie={movie} onError={setError} />}
          <div className='additional-info mt-8'>
            <p>{genres.map(genre => genre.name).join(', ')}</p>
            <p className='tracking-wide'>{year}</p>
            <p className='tracking-wider'>{runtime}</p>
          </div>
        </div>
      </div>
      <section className='my-10'>
        <h2 className='section-title'>More Information</h2>
        {movie.director?.length > 0 ? <p className="small-text">Directed by {movie.director}</p> : null}
        {movie.actors?.length > 0 ? <p className="small-text">Starring {movie.actors}</p> : null}
        <p className="small-text">Available on...</p>
      </section>
    </>
  );
}