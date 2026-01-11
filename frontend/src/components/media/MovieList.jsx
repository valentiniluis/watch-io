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

  const titleClassName = 'section-title ' + titleClass

  return (
    <HorizontalScrollContainer.wrapper className='my-6 md:my-10 lg:my-12'>
      {title && <h3 className={titleClassName}>{title}</h3>}
      <HorizontalScrollContainer className="movie-list">
        {movies.map(rec => <MovieCard key={rec.id} movie={rec} linkTo={`/search/${rec.id}`} />)}
      </HorizontalScrollContainer>
    </HorizontalScrollContainer.wrapper>
  );
}