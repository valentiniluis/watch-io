import { useSelector } from "react-redux";
import HighlightedText from "../UI/HighligthedText";
import RatingSection from "../rating/RatingSection";
import WatchProviders from "./WatchProviders";


export default function MovieDetailsSection({ movie }) {
  const { isLoggedIn } = useSelector(state => state.auth);
  const { actors, director, awards, rated, available } = movie;

  return (
    <section className='my-8 flex flex-col-reverse lg:flex-row w-full gap-8'>
      <div className='w-full lg:w-1/2 text-center lg:text-start'>
        <h2 className='section-title mb-5'>More Information</h2>
        {actors?.length > 0 && <HighlightedText regularText="Starring " highlighted={movie.actors} />}
        {director?.length > 0 && <HighlightedText regularText="Directed by " highlighted={movie.director} />}
        {awards != 'N/A' && <HighlightedText highlighted={movie.awards} />}
        {rated?.length > 0 && <HighlightedText regularText="Rated " highlighted={movie.rated} />}
        <WatchProviders providers={available} />
      </div>
      <div className='w-full lg:w-1/2'>
        {isLoggedIn
          ? <RatingSection movieId={movie.id} />
          : (
            <div className='flex justify-center'>
              <p className='regular-text px-4 py-2 m-0 bg-blue-700 rounded-lg w-max'>Log in to rate this movie!</p>
            </div>
          )
        }
      </div>
    </section>
  );
}