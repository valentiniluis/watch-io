import star from '/star.svg';
import noPoster from '/no-movie.png';
import { getReleaseYear } from '../../util/util-functions.js';


export default function MovieCard({ movie }) {
  const { vote_average, poster_path, title, release_date } = movie;

  const posterImage = poster_path || noPoster;

  return (
    <li className="movie-card relative inline-block">
      <a href={movie.id} className='after:absolute after:inset-0'>
        <img src={posterImage} alt={title + " Movie Poster"} />
        <div className="px-5 mt-4 mb-3.5">
          <h3 className="card-title">{title}</h3>
          <div className="card-info">
            <div className="rating">
              <img src={star} className='size-4' alt="Start Icon" />
              <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            </div>
            <span className="text-xs text-stone-300">•</span>
            <p className='release'>{release_date ? getReleaseYear(release_date) : 'N/A'}</p>
          </div>
        </div>
      </a>
    </li>
  );
}