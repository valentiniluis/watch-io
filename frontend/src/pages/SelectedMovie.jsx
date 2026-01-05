import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ErrorPage from './ErrorPage.jsx';
import MovieInfo from '../components/media/MovieInfo.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import { loadMediaData } from '../util/movie-query.js';
import MovieRecommendations from '../components/media/Recommendations.jsx';
import { mediaActions } from '../store/media.js';


export default function SelectedMoviePage() {
  const { mediaId } = useParams();
  const mediaType = useSelector(state => state.media.type);
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useQuery({
    queryKey: [mediaType, { mediaId }],
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
    const media = data[mediaType];
    dispatch(mediaActions.setMediaData(media));
    // recomendações são extraídas apenas após os dados do filme
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