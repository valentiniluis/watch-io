import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ErrorPage from './ErrorPage.jsx';
import MovieInfo from '../components/movie/MovieInfo.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import { loadMediaData } from '../util/movie-query.js';
import MovieRecommendations from '../components/movie/Recommendations.jsx';
import { mediaActions } from '../store/media.js';
import { useDispatch, useSelector } from 'react-redux';


export default function SelectedMoviePage() {
  const { movieId } = useParams();
  const mediaType = useSelector(state => state.media.type);
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useQuery({
    queryKey: [mediaType, { movieId }],
    queryFn: loadMediaData
  });

  let content;
  if (isLoading) {
    content = <Spinner text="Loading Movie Data..." />;
  }
  else if (isError) {
    content = <ErrorPage message="This Movie Is Unavailable." />;
  }
  else if (data) {
    dispatch(mediaActions.setMediaData(data.movieData));
    // recomendações são extraídas apenas após os dados do filme
    const media = data[mediaType];
    content = (
      <>
        <MovieInfo movie={media} />
        <MovieRecommendations />
      </>
    );
  }

  return (
    <section className='content-wrapper'>
      {content}
    </section>
  );
}