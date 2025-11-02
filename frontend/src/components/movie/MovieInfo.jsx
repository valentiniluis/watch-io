import { useState } from 'react';
import { useSelector } from 'react-redux';
import MovieRatings from './MovieRatings.jsx';
import Toast from '../UI/Toast.jsx';
import MovieInteractions from './MovieInteractions.jsx';
import noPoster from '/no-movie.png';
import HighlightedText from '../UI/HighligthedText.jsx';
import RatingSection from '../UI/RatingSection.jsx';


export default function MovieInfo({ movie }) {
  const auth = useSelector(reduxState => reduxState.auth);
  const [error, setError] = useState();
  const { isLoggedIn } = auth;

  // overview ? accordion
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
            <p className='text-center text-sm text-stone-300'>No ratings available.</p>
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
      {/* essa seção pode ser um componente próprio */}
      <section className='my-10 grid grid-cols-2'>
        <div>
          <h2 className='section-title'>More Information</h2>
          {movie.director?.length > 0 && <HighlightedText regularText="Directed by " highlighted={movie.director} />}
          {movie.actors?.length > 0 && <HighlightedText regularText="Starring " highlighted={movie.actors} />}
          {movie.rated?.length > 0 && <HighlightedText regularText="Rated " highlighted={movie.rated} />}
          {movie.awards?.length > 0 && <HighlightedText highlighted={movie.awards} />}
          <p className="small-text">Available on...</p>
        </div>
        <div>
          {isLoggedIn ? <RatingSection movieId={movie.id} />
            : (
              <div className='flex justify-center'>
                <p className='regular-text px-4 py-2 m-0 bg-blue-700 rounded-lg w-max'>Log in to rate this movie!</p>
              </div>
            )}
        </div>
      </section>
    </>
  );
}