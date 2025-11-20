import { useState } from 'react';
import { useSelector } from 'react-redux';
import MovieRatings from './MovieRatings.jsx';
import Toast from '../UI/Toast.jsx';
import MovieInteractions from './MovieInteractions.jsx';
import noPoster from '/no-movie.png';
import MovieDetailsSection from './MovieDetailsSection.jsx';


export default function MovieInfo({ movie }) {
  const auth = useSelector(reduxState => reduxState.auth);
  const [error, setError] = useState();
  const { isLoggedIn } = auth;

  // overview accordion ?
  const { title, poster_path, tagline, year, runtime, genres } = movie;
  const poster = poster_path || noPoster;

  return (
    <>
      {error && <Toast message={error} />}
      <div className='movie-info-container'>

        <div className='text-container xl:hidden'>
          <h1 className='movie-name'>{title}</h1>
          {tagline && <h4 className='tagline'>{tagline}</h4>}
        </div>

        <img src={poster} alt={title + ' Movie Poster'} />
        <div className='text-container'>
          <h1 className='movie-name hidden xl:inline-block'>{title}</h1>
          {tagline && <h4 className='tagline hidden xl:inline-block'>{tagline}</h4>}
          {movie.ratings?.length === 0 ?
            <p className='text-center small-text'>No ratings available.</p>
            : <MovieRatings ratings={movie.ratings} />
          }
          {/* <p className='text-justify mb-6 text-[.9rem] md:text-[1rem]'>{overview}</p> */}
          {isLoggedIn && <MovieInteractions movie={movie} onError={setError} />}
          <div className='additional-info mt-8'>
            <p>{genres.map(genre => genre.name).join(', ')}</p>
            <p className='tracking-wide'>{year}</p>
            <p className='tracking-wider'>{runtime}</p>
          </div>
        </div>
      </div>
      <MovieDetailsSection movie={movie} />
    </>
  );
}