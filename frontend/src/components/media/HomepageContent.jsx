import { Fragment, useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueries } from '@tanstack/react-query';
import { loadMediaByGenre } from '../../query/media.js';
import Spinner from '../UI/Spinner.jsx';
import ErrorSection from '../UI/ErrorSection';
import MovieList from './MovieList.jsx';
import RecommendationsSection from './RecommendationsSection.jsx';
import { SERIES } from '../../util/constants.js';


export default function HomepageContent({ genres }) {
  const mediaType = useSelector(state => state.media.type);
  const [enabledQueries, setEnabledQueries] = useState([true, ...Array(genres.length - 1).fill(false)]);
  const observerRefs = useRef([]);

  const results = useQueries({
    queries: genres.map((genre, index) => ({
      queryKey: [mediaType, { genre: genre.id, genreName: genre.genre_name }],
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
      if (ref && index < genres.length - 1) {
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
  }, [enabledQueries, genres.length]);

  const mediaLabel = (mediaType === SERIES) ? 'TV Shows' : 'Movies';
  
  const content = results.map((result, i) => {
    if (!enabledQueries[i]) return null;
    const { data, isPending, isError, error } = result;

    return (
      <Fragment key={i}>
        {isPending && <div className='py-40'><Spinner text={`Loading ${genres[i].genre_name} ${mediaLabel}...`} /></div>}
        {isError && <ErrorSection message={error.message} />}
        {data && <MovieList movies={data[mediaType]} fallback="No movies found" title={genres[i].genre_name} />}

        {/* Trigger for next section */}
        {i < genres.length - 1 && <div ref={el => observerRefs.current[i] = el} />}
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