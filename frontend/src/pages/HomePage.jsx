import { Fragment, useRef, useState, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import Spinner from '../components/UI/Spinner';
import ErrorSection from '../components/UI/ErrorSection';
import MovieList from '../components/movie/MovieList';
import { mainGenres } from '../util/constants.js';
import { loadMediaByGenre } from '../util/movie-query.js';
import RecommendationsSection from '../components/movie/RecommendationsSection.jsx';
import { useSelector } from 'react-redux';


export default function HomePage() {
  const mediaType = useSelector(state => state.media.type);
  const [enabledQueries, setEnabledQueries] = useState([true, ...Array(mainGenres.length - 1).fill(false)]);
  const observerRefs = useRef([]);

  const results = useQueries({
    queries: mainGenres.map((genre, index) => ({
      queryKey: [mediaType, { genre: genre.id, genreName: genre.name }],
      queryFn: loadMediaByGenre,
      // 10 minutes until refetch
      refetchInterval: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      enabled: enabledQueries[index],
    }))
  });

  useEffect(() => {
    const observers = [];
    observerRefs.current.forEach((ref, index) => {
      if (ref && index < mainGenres.length - 1) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            // if is intersecting, enable next query
            if (entry.isIntersecting && !enabledQueries[index + 1]) {
              setEnabledQueries(prev => {
                const newEnabled = [...prev];
                newEnabled[index + 1] = true;
                return newEnabled;
              });
            }
          });
        },
          {
            threshold: 0.1,
            rootMargin: '100px' // Start loading 100px before element is visible
          }
        );

        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, [enabledQueries]);

  const content = results.map((result, i) => {
    if (!enabledQueries[i]) return null;
    const { data, isPending, isError, error } = result;

    return (
      <Fragment key={i}>
        {isPending && <div className='py-40'><Spinner text={`Loading ${mainGenres[i].name} movies...`} /></div>}
        {isError && <ErrorSection message={error.message} />}
        {data && <MovieList movies={data.movies} fallback="No movies found" title={mainGenres[i].name} />}

        {/* Trigger for next section */}
        {i < mainGenres.length - 1 && <div ref={el => observerRefs.current[i] = el} />}
      </Fragment>
    );
  });

  return (
    <section className='content-wrapper'>
      <RecommendationsSection />
      <section id='genres-section'>
        {content}
      </section>
    </section>
  );
}