import { formatDate } from '../../util/functions';
import StarIcon from "../UI/StarIcon";


export default function RatingPreview({ rating }) {
  return (
    <div>
      <h4 className="text-stone-400 text-center text-sm uppercase tracking-wide font-medium mb-4">Your rating</h4>
      <h3 className="text-center font-semibold text-stone-50 text-xl mb-4">"{rating.headline}"</h3>
      <div className="flex justify-center gap-5 mb-6">
        <div className="flex justify-center items-end">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <StarIcon className="w-7 h-7 text-yellow-500" />
          <StarIcon className="w-5 h-5 text-yellow-400" />
        </div>
        <h4 className="text-center font-semibold text-stone-50 text-2xl">{rating.score}.0</h4>
      </div>
      <p className='text-sm text-stone-400 text-center'>Rated on {formatDate(rating.last_update)}</p>
    </div>
  );
}