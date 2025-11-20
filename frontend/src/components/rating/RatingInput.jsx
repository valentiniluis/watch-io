import { useState } from "react"
import StarIcon from '../icons/StarIcon';

const EMPTY = "";

export default function RatingInput({ margin, id, defaultValue, ...props }) {
  const [rating, setRating] = useState(defaultValue || EMPTY);

  function handleChange(event) {
    let value = event.target.value;
    if (value === EMPTY) setRating(EMPTY);
    value = +value;
    if (!Number.isInteger(value) || value < 1 || value > 10) return;
    setRating(value);
  }

  return (
    <div className={margin || ""}>
      <label htmlFor={id}>Score*</label>
      <div className="flex items-center gap-3 mt-1">
        <input id={id} placeholder="1 - 10" className="text-lg font-semibold border-0 border-b max-w-16 text-center focus:border-stone-400 placeholder:font-medium focus:outline-0" onChange={handleChange} value={rating} {...props} />
        <StarIcon className='w-7 h-7 text-yellow-400 mb-2' />
      </div>
    </div>
  );
}