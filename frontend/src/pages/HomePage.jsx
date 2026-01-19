import { useQuery } from "@tanstack/react-query";
import { loadHomepageGenres } from "../query/genre";
import { useSelector } from "react-redux";
import { HOMEPAGE_GENRES_NUMBER } from '../util/constants';
import Spinner from "../components/UI/Spinner";
import ErrorSection from "../components/UI/ErrorSection";
import HomepageContent from "../components/media/HomepageContent";

export default function Homepage() {
  const mediaType = useSelector(state => state.media.type);
  
  const { data, isError, error, isPending } = useQuery({
    queryKey: [mediaType, { limit: HOMEPAGE_GENRES_NUMBER, randomize: true }],
    queryFn: loadHomepageGenres,
    staleTime: 1000 * 60 * 20
  });

  let content;
  if (isPending) {
    content = <Spinner text="Loading genres..." />
  }
  else if (isError) {
    content = <ErrorSection message={error.message} />
  }
  else if (data) {
    console.log(data);
    const { genres } = data;
    content = <HomepageContent genres={genres || []} key={mediaType} />
  }

  return content;
}