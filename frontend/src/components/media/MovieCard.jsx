import { Link } from 'react-router-dom';
import star from '/star.svg';
import noPoster from '/no-movie.png';
import { useRef } from 'react';

const DRAG_THRESHOLD_PIXELS = 10;

export default function MovieCard({ movie, linkTo }) {
  const startPositionRef = useRef();
  const draggingRef = useRef(false);

  function handleMouseDown(e) {
    startPositionRef.current = e.clientX;
    draggingRef.current = false;
  }

  function handleMouseMove(e) {
    if (startPositionRef.current === null) return;
    const distanceX = Math.abs(startPositionRef.current - e.clientX);
    if (distanceX > DRAG_THRESHOLD_PIXELS) draggingRef.current = true;
  }

  function handleClick(e) {
    if (draggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    startPositionRef.current = null;
    draggingRef.current = false;
  }

  const { tmdb_rating, poster_path, title, release_year } = movie;
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
        {/* Imagem do poster */}
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={posterImage} 
            alt={title + " Movie Poster"}
            className="w-full h-auto"
          />
          
          {/* Overlay gradiente sutil no hover */}
          <div className="poster-overlay" />
        </div>

        {/* Informações do card */}
        <div className="card-text-wrapper">
          <h3 className="card-title">{title}</h3>
          <div className="card-info">

            {/* Rating com ícone de estrela */}
            <div className="rating">
              <img 
                src={star} 
                className='size-3 md:size-3.5 lg:size-4 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                alt="Star Icon" 
              />
              <p>{tmdb_rating}</p>
            </div>
            
            {/* Separador */}
            <span className="card-separator">•</span>

            {/* Ano de lançamento */}
            <p className='secondary'>{release_year}</p>

          </div>
        </div>

        {/* Indicador visual de hover (linha no topo) */}
        <div className="hover-line" />
      </Link>
    </li>
  );
}