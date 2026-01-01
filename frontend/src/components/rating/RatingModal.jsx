import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import queryClient from '../../util/query';
import Input from "../UI/Input";
import { mutateRating } from "../../util/movie-query";
import Modal from "../layout/Modal";
import RatingInput from './RatingInput';
import { toastActions } from '../../store/toast';


export default function RatingModal({ ref, editMode, data }) {
  const { data: media, type: mediaType }  = useSelector(state => state.media);
  const { id: mediaId, title, release_year } = media;
  const dispatch = useDispatch();

  function handleClose() {
    ref.current?.querySelector("form").reset();
    ref.current?.close();
  }

  const { mutate } = useMutation({
    mutationFn: mutateRating,
    onSuccess: () => {
      const successMessage = (editMode ? "Edited" : "Added") + " rating successfully!";
      dispatch(toastActions.setSuccessToast(successMessage));
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
    onError: (ctx) => dispatch(toastActions.setErrorToast(`Failed to rate movie: ${ctx?.response?.data?.message || ctx.message}`))
  });

  async function submitAndClose(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    let rating = Object.fromEntries(formData.entries());
    rating = {
      ...rating,
      score: +rating.score,
      note: rating.note.length > 0 ? rating.note : undefined
    };
    const method = (editMode === true) ? "PUT" : "POST";
    mutate({ rating, mediaId, mediaType, method });
    event.target.reset();
    handleClose();
  }

  return createPortal(
    <Modal ref={ref} handleClose={handleClose}>
      <form onSubmit={submitAndClose} className='flex flex-col'>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-stone-700 m-0 text-sm">{editMode ? "Editing rating" : "Rating movie"}</h4>
            <h2 className="font-medium text-lg flex items-center gap-2">
              {title}
              <span className="text-stone-600 font-normal text-sm">
                ({release_year})
              </span>
            </h2>
          </div>
          <button type="reset" onClick={handleClose} className="text-red-600 hover:text-red-700 text-2xl leading-none">
            ×
          </button>
        </div>
        <RatingInput id="score" name="score" margin="mb-4" defaultValue={editMode ? data.score : ""} required />
        <Input id='headline' name='headline' label="Headline*" maxLength="255" className="font-medium text-[1.05rem]" defaultValue={editMode ? data.headline : undefined} required />
        <Input type="textarea" id="description" name="note" label="Description" maxLength="511" className="text-stone-600 text-sm" defaultValue={editMode ? data?.note : undefined} />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="reset"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            Confirm
          </button>
        </div>
      </form>
    </Modal>,
    document.getElementById('root')
  );
}