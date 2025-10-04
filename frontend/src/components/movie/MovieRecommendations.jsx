import { useRef } from "react";
import MovieCard from "./MovieCard";


export default function MovieRecommendations({ movies }) {
  const recommendationsRef = useRef();

  if (movies.length === 0) {
    return <h3 className="text-center text-xl font-medium">No Recommendations Available</h3>;
  }

  const scrollBtnClass = 'absolute top-1/2 -translate-y-1/2 text-amber-100 bg-stone-700 px-2 py-8 z-10 rounded-xl hover:bg-stone-600';

  function handleScroll(direction) {
    const scrollPercentage = 65 / 100;
    const pixelsOffset = Math.ceil(window.innerWidth * scrollPercentage);
    const offset = (direction === 'left') ? pixelsOffset * -1 : pixelsOffset;
    recommendationsRef.current.scrollBy({ behavior: 'smooth', left: offset });
  }

  return (
    <section className='relative my-12'>
      <h3 className='section-title mb-6'>You May Like</h3>
      <div className='movie-list' ref={recommendationsRef}>
        <button
          className={scrollBtnClass + ' left-0 -translate-x-full'}
          onClick={() => handleScroll('left')}
        >
          {'<'}
        </button>
        {movies.map(rec => <MovieCard key={rec.id} movie={rec} linkTo={'../' + rec.id} />)}
        <button 
          className={scrollBtnClass + " right-0 translate-x-full"} 
          onClick={() => handleScroll('right')}
        >
          {'>'}
        </button>
      </div>
    </section>
  )
}