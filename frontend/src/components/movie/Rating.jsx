import { useRef } from 'react';
import { formatDate } from '../../util/functions.js';
import NoPoster from '/no-movie.png';
import StarIcon from '../UI/StarIcon.jsx';
import CalendarIcon from '../UI/CalendarIcon.jsx';
import EditIcon from '/edit.svg';
import DeleteIcon from '/delete.svg';
import IconButton from '../UI/IconButton.jsx';
import RatingModal from '../UI/RatingModal.jsx';
import { useDispatch } from 'react-redux';
import { movieActions } from '../../store/movie.js';
import DeleteRatingModal from './DeleteRatingModal.jsx';


export default function Rating({ rating }) {
  const editModalRef = useRef();
  const deleteModalRef = useRef();
  const dispatch = useDispatch();

  const { created_at, headline, note, score, poster_path, title, year } = rating;

  const posterImageUrl = poster_path ? `${poster_path}` : NoPoster;
  const formattedDate = formatDate(created_at);

  function handleOpenModal(ref) {
    dispatch(movieActions.setMovie(rating));
    ref.current.showModal();
  }

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
          <div className="flex justify-between">
            <h3 className="text-xl font-bold tracking-tight text-white">
              {title} <span className="text-lg font-normal text-gray-400">({year})</span>
            </h3>

            <div className="flex items-center gap-3">
              <IconButton src={EditIcon} alt="Pencil - Edit icon" buttonClass="hover:bg-gray-600/25 p-1 rounded-md" iconClass="w-5 h-5" onClick={() => handleOpenModal(editModalRef)} />
              <IconButton src={DeleteIcon} alt="Trash can - Delete icon" buttonClass="hover:bg-red-400/15 p-1 rounded-md" iconClass="w-6 h-6" onClick={() => handleOpenModal(deleteModalRef)} />
            </div>
          </div>

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
      <RatingModal ref={editModalRef} editMode={true} data={rating} />
      <DeleteRatingModal ref={deleteModalRef} />
    </div>
  );
}
