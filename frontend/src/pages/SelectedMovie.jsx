import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ErrorPage from './ErrorPage.jsx';
import MovieInfo from '../components/movie/MovieInfo.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import { loadMovieData } from '../util/movie-query.js';
import MovieRecommendations from '../components/movie/Recommendations.jsx';
import { movieActions } from '../store/movie.js';
import { useDispatch } from 'react-redux';


export default function SelectedMoviePage() {
  const { movieId } = useParams();
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie-data', { movieId }],
    queryFn: loadMovieData
  });

  let content;
  if (isLoading) {
    content = <Spinner text="Loading Movie Data..." />;
  }
  else if (isError) {
    content = <ErrorPage message="This Movie Is Unavailable." />;
  }
  else if (data) {
    dispatch(movieActions.setMovie(data.movieData));
    // recomendações são extraídas apenas após os dados do filme
    content = (
      <>
        <MovieInfo movie={data.movieData} />
        <MovieRecommendations movieId={movieId} />
      </>
    );
  }

  return (
    <section className='px-[5vw]'>
      {content}
    </section>
  );
}