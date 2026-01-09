import { SERIES, MOVIES } from "../../util/constants";
import { useSelector, useDispatch } from "react-redux";
import { setMediaType } from '../../store/media';


export default function AppModeSelector() {
  const currentType = useSelector(state => state.media.type);
  const dispatch = useDispatch();

  function handleUpdateType(mediaType) {
    dispatch(setMediaType(mediaType));
  }

  const buttonClass = 'relative z-10 flex-1 flex items-center justify-center font-medium text-sm transition-colors duration-300';

  const movieBtnClass = buttonClass + (currentType === MOVIES ? 'text-white' : 'text-zinc-500 hover:text-zinc-300');
  const tvBtnClass = buttonClass + (currentType === SERIES ? 'text-white' : 'text-zinc-500 hover:text-zinc-300');

  const sliderClass = 'absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-indigo-600 rounded-lg transition-transform duration-150 ease-in-out shadow-lg ' + (currentType === MOVIES ? 'translate-x-0' : 'translate-x-full');

  return (
    <div className="relative flex bg-zinc-900 p-1 rounded-xl w-60 h-12 border border-zinc-800 shadow-2xl">

      <div className={sliderClass} />

      <button onClick={() => handleUpdateType(MOVIES)} className={movieBtnClass}>
        Movies
      </button>

      <button onClick={() => handleUpdateType(SERIES)} className={tvBtnClass}>
        TV Shows
      </button>
    </div>
  );
}