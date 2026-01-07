import { useRef } from "react";
import ScrollContainer from 'react-indiana-drag-scroll';
import MovieCard from "./MovieCard";


export default function MovieList({ title, titleClass='', movies, fallback }) {
  const recommendationsRef = useRef();

  if (movies?.length === 0) {
    return (
      <div className="my-24 text-center">
        {title && <h3 className='section-title'>{title}</h3>}
        <h3 className="text-xl text-stone-300">{fallback}</h3>
      </div>
    );
  }

  function handleScroll(direction) {
    const scrollPercentage = 65 / 100;
    const pixelsOffset = Math.ceil(window.innerWidth * scrollPercentage);
    const offset = (direction === 'left') ? pixelsOffset * -1 : pixelsOffset;
    const ref = recommendationsRef.current;
    ref.scrollBy({ behavior: 'smooth', left: offset });
  }

  const scrollBtnClass = 'hidden xl:inline-block absolute top-1/2 -translate-y-1/2 text-amber-100 bg-stone-700 px-2 py-8 z-10 rounded-xl hover:bg-stone-600';
  const titleClassName = 'section-title ' + titleClass
  
  return (
    <section className='relative my-6 md:my-10 lg:my-12'>
      {title && <h3 className={titleClassName}>{title}</h3>}
      <ScrollContainer className="movie-list" horizontal vertical={false} innerRef={recommendationsRef}  >
        <button
          className={scrollBtnClass + ' left-0 -translate-x-full'}
          onClick={() => handleScroll('left')}
        >
          &lt;
        </button>
        {movies.map(rec => <MovieCard key={rec.id} movie={rec} linkTo={`/search/${rec.id}`} />)}
        <button
          className={scrollBtnClass + " right-0 translate-x-full"}
          onClick={() => handleScroll('right')}
        >
          &gt;
        </button>
      </ScrollContainer>
    </section>
  );
}