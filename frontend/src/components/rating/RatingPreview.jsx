import { formatDate } from '../../util/functions';
import StarIcon from "../icons/StarIcon";


export default function RatingPreview({ rating }) {
  const { headline, score, rate_date } = rating;

  return (
    <div>
      <h4 className="text-stone-400 text-center text-xs sm:text-[.82rem] lg:text-sm uppercase tracking-wide font-medium mb-4">Your rating</h4>
      <h3 className="text-center font-semibold text-stone-50 text-base sm:text-lg lg:text-xl mb-4">"{headline}"</h3>
      <div className="flex justify-center gap-5 mb-6">
        <div className="flex justify-center items-end">
          <StarIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-yellow-400" />
          <StarIcon className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7 text-yellow-500" />
          <StarIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-yellow-400" />
        </div>
        <h4 className="text-center font-semibold text-stone-50 text-lg sm:text-xl lg:text-2xl">{score}.0</h4>
      </div>
      <p className='text-xs sm:text-[.82rem] lg:text-sm text-stone-400 text-center'>Rated on {formatDate(rate_date)}</p>
    </div>
  );
}