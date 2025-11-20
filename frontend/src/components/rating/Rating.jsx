import { useRef } from 'react';
import { formatDate } from '../../util/functions.js';
import NoPoster from '/no-movie.png';
import StarIcon from '../icons/StarIcon.jsx';
import CalendarIcon from '../icons/CalendarIcon.jsx';
import EditIcon from '/edit.svg';
import DeleteIcon from '/delete.svg';
import IconButton from '../icons/IconButton.jsx';
import RatingModal from './RatingModal.jsx';
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
    <div className="flex max-w-2xl w-full overflow-hidden rounded-lg shadow-lg bg-gray-800 text-gray-300 p-3 gap-4">
      <div className="hidden sm:inline-block shrink-0">
        <img
          src={posterImageUrl}
          alt={`${title} movie poster`}
          className="object-cover aspect-2/3 sm:w-26 lg:w-32 rounded-lg"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
      </div>

      <div className="flex flex-col justify-between leading-normal w-full min-w-0">
        <div className='min-w-0'>

          <div className="flex justify-between items-start gap-3">
            <h3 className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-bold tracking-tight text-white text-base sm:text-lg lg:text-xl">
              {title}{" "}
              <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-400">
                ({year})
              </span>
            </h3>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <IconButton
                src={EditIcon}
                alt="Pencil - Edit icon"
                buttonClass="hover:bg-gray-600/25 p-1 rounded-md"
                iconClass="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5"
                onClick={() => handleOpenModal(editModalRef)}
              />
              <IconButton
                src={DeleteIcon}
                alt="Trash can - Delete icon"
                buttonClass="hover:bg-red-400/15 p-1 rounded-md"
                iconClass="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6"
                onClick={() => handleOpenModal(deleteModalRef)}
              />
            </div>
          </div>

          <div className="flex items-center lg:pt-1 space-x-1">
            <StarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
            <span className="text-[.9rem] sm:text-base lg:text-lg font-bold text-white">{score}</span>
            <span className="text-xs sm:text-[.82rem] lg:text-sm text-gray-400">/ 10</span>
          </div>

          <p className="pt-1 lg:pt-2 text-[.9rem] sm:text-base lg:text-lg font-semibold text-gray-100 text-wrap text-ellipsis overflow-hidden text-justify">
            {headline}
          </p>

          <p className="pt-2 text-xs sm:text-[.82rem] lg:text-sm text-gray-400 italic text-wrap text-ellipsis overflow-hidden text-justify">
            {note || "User did not leave a note."}
          </p>
        </div>

        <div className="flex items-center justify-end mt-2 sm:mt-3 text-[.65rem] sm:text-xs text-gray-500 space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span>Rated on {formattedDate}</span>
        </div>
      </div>
      <RatingModal ref={editModalRef} editMode={true} data={rating} />
      <DeleteRatingModal ref={deleteModalRef} />
    </div>
  );
}
