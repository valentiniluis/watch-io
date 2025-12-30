import { useSelector } from 'react-redux';
import MovieRatings from './MovieRatings.jsx';
import MovieInteractions from './MovieInteractions.jsx';
import noPoster from '/no-movie.png';
import MovieDetailsSection from './MovieDetailsSection.jsx';
import Overview from '../UI/Overview.jsx';


export default function MovieInfo({ movie }) {
  const { isLoggedIn } = useSelector(reduxState => reduxState.auth);

  const { title, poster_path, tagline, release_year, runtime, genres, overview } = movie;
  const poster = poster_path || noPoster;

  return (
    <>
      <div className='movie-info-container'>

        <div className='text-container xl:hidden'>
          <h1 className='movie-name'>{title}</h1>
          {tagline && <h4 className='tagline'>{tagline}</h4>}
        </div>

        <div className='flex flex-col items-center xl:min-w-[400px]'>
          <img src={poster} alt={title + ' Movie Poster'} />
          {isLoggedIn && <MovieInteractions movie={movie} />}
        </div>

        <div className='text-container'>
          <h1 className='movie-name hidden xl:inline-block'>{title}</h1>
          {tagline && <h4 className='tagline hidden xl:inline-block'>{tagline}</h4>}
          <MovieRatings ratings={movie.ratings} />
          <Overview overviewText={overview} />
          <div className='additional-info mt-8'>
            <p>{genres.map(genre => genre.name).join(', ')}</p>
            <p className='tracking-wide'>{release_year}</p>
            <p className='tracking-wider'>{runtime}</p>
          </div>
        </div>
      </div>
      <MovieDetailsSection movie={movie} />
    </>
  );
}