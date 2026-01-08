import DropdownMenu from "../UI/DropdownMenu";
import { MEDIA_TYPES_LABELS, MEDIA_TYPES } from "../../util/constants";
import { useSelector, useDispatch } from "react-redux";
import { setMediaType } from '../../store/media';


export default function AppModeSelector() {
  const currentType = useSelector(state => state.media.type);
  const dispatch = useDispatch();

  const mediaTypes = MEDIA_TYPES
    .filter(mediaType => mediaType !== currentType)
    .map(mediaType => ({ id: mediaType, name: MEDIA_TYPES_LABELS[mediaType], 'data-media-type': mediaType }));

  function handleUpdateType(event) {
    const { mediaType } = event.currentTarget.dataset;
    dispatch(setMediaType(mediaType));
  }

  return (
    <DropdownMenu
      className="bg-transparent text-stone-400 font-semibold rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide hover:text-white focus:ring-slate-600"
      containerClass='max-w-34'
      text={MEDIA_TYPES_LABELS[currentType]}
      options={mediaTypes}
      onUpdate={handleUpdateType}
    />
  );
}