import NoPoster from '/no-movie.png';
import { formatDate } from '../../util/funtions.js';
import StarIcon from '../UI/StarIcon.jsx';
import CalendarIcon from '../UI/CalendarIcon.jsx';


export default function Rating({ rating }) {
  const { created_at, headline, note, score, poster_path, title, year } = rating;

  const posterImageUrl = poster_path ? `${poster_path}` : NoPoster;
  const formattedDate = formatDate(created_at);

  return (
    <div className="flex max-w-2xl w-full overflow-hidden rounded-lg shadow-lg bg-gray-800 text-gray-300">

      <div className="shrink-0">
        <img
          src={posterImageUrl}
          alt={`${title} movie poster`}
          className="object-cover w-32 h-48"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
      </div>

      <div className="flex flex-col justify-between p-4 leading-normal w-full">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {title} <span className="text-lg font-normal text-gray-400">({year})</span>
          </h3>

          <div className="flex items-center mt-2 space-x-1">
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-white">{score}</span>
            <span className="text-sm text-gray-400">/ 10</span>
          </div>

          <p className="mt-3 text-lg font-semibold text-gray-100">
            "{headline}"
          </p>

          <p className="mt-1 text-sm text-gray-400 italic">
            {note || "User did not leave a note."}
          </p>
        </div>

        <div className="flex items-center justify-end mt-4 text-xs text-gray-500 space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span>Rated on {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
