import { Link } from 'react-router-dom';
import star from '/star.svg';
import noPoster from '/no-movie.png';
import { useRef } from 'react';


export default function MovieCard({ movie, linkTo }) {
  const draggingRef = useRef(false);

  function handleMouseDown() {
    draggingRef.current = false;
  }

  function handleMouseMove() {
    draggingRef.current = true;
  }

  function handleClick(e) {
    if (draggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    draggingRef.current = false;
  }

  const { tmdb_rating, poster_path, title, year } = movie;
  const posterImage = poster_path || noPoster;

  return (
    <li className="movie-card relative inline-block">
      <Link
        to={`${linkTo}`}
        className='after:absolute after:inset-0 after:pointer-events-auto block'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <div className="image-wrapper">
          <img src={posterImage} alt={title + " Movie Poster"} />
        </div>
        <div className="card-text-wrapper">
          <h3 className="card-title">{title}</h3>
          <div className="card-info">
            <div className="rating">
              <img src={star} className='size-3 md:size-3.5 lg:size-4' alt="Start Icon" />
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