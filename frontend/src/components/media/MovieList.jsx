import MovieCard from "./MovieCard";
import HorizontalScrollContainer from '../layout/HorizontalScrollContainer';

export default function MovieList({ title, titleClass = '', movies, fallback }) {
  if (movies?.length === 0) {
    return (
      <div className="my-24 text-center">
        {title && <h3 className='section-title'>{title}</h3>}
        <h3 className="text-xl text-stone-300">{fallback}</h3>
      </div>
    );
  }

  const titleClassName = 'section-title ' + titleClass;

  return (
    <HorizontalScrollContainer.wrapper className='my-6 md:my-10 lg:my-12'>
      {title && (
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          {/* Ícone decorativo tech */}
          <div className="hidden md:flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-linear-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 backdrop-blur-sm">
            <svg 
              className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" 
              />
            </svg>
          </div>
          
          <h3 className={titleClassName}>{title}</h3>
        </div>
      )}
      
      <HorizontalScrollContainer className="movie-list">
        {movies.map(rec => <MovieCard key={rec.id} movie={rec} linkTo={`/search/${rec.id}`} />)}
      </HorizontalScrollContainer>
    </HorizontalScrollContainer.wrapper>
  );
}