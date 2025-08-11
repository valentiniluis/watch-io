import noPoster from '/no-movie.png';
import MovieRatings from './MovieRatings.jsx';
import Overview from './Overview.jsx';


export default function MovieInfo({ movie }) {
  const { title, poster_path, overview, tagline } = movie;
  const poster = poster_path || noPoster;

  return (
    <>
      <div className='movie-info-container'>
        <img src={poster} alt={title + ' Movie Poster'} />
        <div className='text-container'>
          <h1 className='movie-name'>{title}</h1>
          {tagline && <h4 className='tagline'>{tagline}</h4>}
          {movie.ratings?.length > 0 && <MovieRatings ratings={movie.ratings} />}
          <Overview className='mb-6'>{overview}</Overview>
          <div className='additional-info'>
            <p>{movie.genres.map(genre => genre.name).join(', ')}</p>
            <p className='tracking-wide'>{movie.year}</p>
            <p className='tracking-wider'>{movie.runtime}</p>
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