import StarIcon from "../UI/StarIcon";

export default function RatingPreview({ score }) {
  return (
    <div>
      <h3 className="text-stone-300 text-center text-md mb-4">Your rating</h3>
      <div className="flex justify-center gap-5">
        <div className="flex justify-center items-end">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <StarIcon className="w-7 h-7 text-yellow-500" />
          <StarIcon className="w-5 h-5 text-yellow-400" />
        </div>
        <h4 className="text-center font-semibold text-stone-50 text-2xl">{score}.0</h4>
      </div>
    </div>
  );
}