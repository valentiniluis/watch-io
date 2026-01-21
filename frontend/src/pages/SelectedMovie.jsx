import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ErrorPage from './ErrorPage.jsx';
import MovieInfo from '../components/media/MovieInfo.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import { loadMediaData } from '../query/media.js';
import MovieRecommendations from '../components/media/Recommendations.jsx';
import { mediaActions } from '../store/media.js';
import { useEffect, useRef } from 'react';
import { SERIES } from '../util/constants.js';
import TvShowSeasons from '../components/tv/Seasons.jsx';


export default function SelectedMoviePage() {
  const { mediaId } = useParams();
  const mediaType = useSelector(state => state.media.type);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const prevMediaType = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [mediaType, { mediaId }],
    queryFn: loadMediaData,
    // only enable queries if the global mediaType state remains unchanged
    enabled: (mediaType === prevMediaType.current) || !prevMediaType.current
  });

  // if media type changes, redirect user to homepage. else, some random tv show/movie will be shown
  useEffect(() => {
    if (!prevMediaType.current || prevMediaType.current === mediaType) prevMediaType.current = mediaType;
    else {
      prevMediaType.current = null;
      navigate('/home');
    }
  }, [mediaType, navigate]);

  useEffect(() => {
    if (data) {
      const media = data[mediaType];
      dispatch(mediaActions.setMediaData(media));
    }
  }, [data, dispatch, mediaType]);

  let content;
  if (isLoading) {
    content = <Spinner text="Loading Movie Data..." />;
  }
  else if (isError) {
    content = <ErrorPage message="This Movie Is Unavailable." />;
  }
  else if (data) {
    const media = data[mediaType];
    // recomendações são extraídas apenas após os dados do filme
    content = (
      <>
        <MovieInfo movie={media} />
        {mediaType === SERIES && <TvShowSeasons numberOfSeasons={media.number_of_seasons} />}
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