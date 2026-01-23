import { useSelector } from "react-redux";
import HighlightedText from "../UI/HighligthedText";
import RatingSection from "../rating/RatingSection";
import WatchProviders from "./WatchProviders";


export default function MovieDetailsSection({ movie }) {
  const { isLoggedIn } = useSelector(state => state.auth);
  const { id, actors, director, awards, rated, available } = movie;

  const hasRating = rated != 'N/A' && rated != 'Not Rated';

  return (
    <>
      <section className='my-8 flex flex-col-reverse lg:flex-row w-full gap-12 sm:gap-16 lg:gap-8'>
        <div className='w-full lg:w-1/2 text-center lg:text-start'>
          <h2 className='section-title mb-5'>More Information</h2>
          {actors != 'N/A' && <HighlightedText regularText="Starring " highlighted={actors} />}
          {director != 'N/A' && <HighlightedText regularText="Directed by " highlighted={director} />}
          {awards != 'N/A' && <HighlightedText highlighted={awards} />}
          {hasRating && <HighlightedText regularText="Rated " highlighted={rated} />}
        </div>
        <div className='w-full lg:w-1/2'>
          {isLoggedIn
            ? <RatingSection mediaId={id} />
            : (
              <div className='flex justify-center'>
                <p className='regular-text px-4 py-2 m-0 bg-blue-700 rounded-lg w-max'>Log in to rate this movie!</p>
              </div>
            )
          }
        </div>
      </section>
      <WatchProviders providers={available} margin="mt-4" />
    </>
  );
}