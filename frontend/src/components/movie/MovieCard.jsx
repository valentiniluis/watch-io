import { Link } from 'react-router-dom';
import star from '/star.svg';
import noPoster from '/no-movie.png';


export default function MovieCard({ movie }) {
  const { tmdb_rating, poster_path, title, year } = movie;

  const posterImage = poster_path || noPoster;

  return (
    <li className="movie-card relative inline-block">
      <Link to={`${movie.id}`} className='after:absolute after:inset-0 after:pointer-events-auto block'>
        <img src={posterImage} alt={title + " Movie Poster"} />
        <div className="px-5 mt-4 mb-3.5">
          <h3 className="card-title">{title}</h3>
          <div className="card-info">
            <div className="rating">
              <img src={star} className='size-4' alt="Start Icon" />
              <p>{tmdb_rating}</p>
            </div>
            <span className="text-xs text-stone-300">•</span>
            <p className='release'>{year}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}