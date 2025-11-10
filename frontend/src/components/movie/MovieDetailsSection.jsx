import { useSelector } from "react-redux";
import HighlightedText from "../UI/HighligthedText";
import RatingSection from "../UI/RatingSection";


export default function MovieDetailsSection({ movie }) {
  const { isLoggedIn } = useSelector(state => state.auth);

  return (
    <section className='my-8 flex flex-col-reverse lg:flex-row w-full gap-8'>
      <div className='w-full lg:w-1/2 text-center lg:text-start'>
        <h2 className='section-title mb-5'>More Information</h2>
        {movie.actors?.length > 0 && <HighlightedText regularText="Starring " highlighted={movie.actors} />}
        {movie.director?.length > 0 && <HighlightedText regularText="Directed by " highlighted={movie.director} />}
        {movie.awards?.length > 0 && <HighlightedText highlighted={movie.awards} />}
        {movie.rated?.length > 0 && <HighlightedText regularText="Rated " highlighted={movie.rated} />}
        <p className="small-text">Available on...</p>
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