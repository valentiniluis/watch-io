import { useRef } from "react";
import ScrollContainer from 'react-indiana-drag-scroll';
import MovieCard from "./MovieCard";


export default function MovieList({ title, movies, fallback }) {
  const recommendationsRef = useRef();

  if (movies?.length === 0) {
    return (
      <div className="my-24 text-center">
        <h3 className='section-title'>{title}</h3>
        <h3 className="text-xl text-stone-300">{fallback}</h3>
      </div>
    );
  }

  const scrollBtnClass = 'hidden xl:inline-block absolute top-1/2 -translate-y-1/2 text-amber-100 bg-stone-700 px-2 py-8 z-10 rounded-xl hover:bg-stone-600';

  function handleScroll(direction) {
    const scrollPercentage = 65 / 100;
    const pixelsOffset = Math.ceil(window.innerWidth * scrollPercentage);
    const offset = (direction === 'left') ? pixelsOffset * -1 : pixelsOffset;
    const ref = recommendationsRef.current;
    ref.scrollBy({ behavior: 'smooth', left: offset });
  }

  return (
    <section className='relative my-4 md:my-8 lg:my-12'>
      <h3 className='section-title'>{title}</h3>
      <ScrollContainer className="movie-list" horizontal vertical={false} innerRef={recommendationsRef} >
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