import { useDispatch, useSelector } from "react-redux";
import Modal from "../layout/Modal";
import { useMutation } from "@tanstack/react-query";
import { deleteRating } from "../../query/rating";
import queryClient from "../../query/client";
import { toastActions } from '../../store/toast';


export default function DeleteRatingModal({ ref }) {
  const dispatch = useDispatch();
  const { data: media, type: mediaType } = useSelector(state => state.media);
  const { id, release_year, title } = media;

  const { mutate, isPending } = useMutation({
    mutationFn: deleteRating,
    onSuccess: () => {
      dispatch(toastActions.setSuccessToast("Removed rating successfully!"));
      queryClient.invalidateQueries({ queryKey: ['rating'] });
    },
    onError: ctx => dispatch(toastActions.setErrorToast(`Failed to delete rating: ${ctx?.response?.data?.message || ctx.message}`)),
    onSettled: handleClose
  });

  function handleClose() {
    ref.current?.close();
  }

  function handleSubmit(event) {
    event.preventDefault();
    mutate({ mediaId: id, mediaType });
  }

  return (
    <Modal ref={ref} handleClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-stone-500">Deleting movie rating</p>
        <h2 className="text-semibold text-xl flex items-center gap-2 mb-4">
          {title}{" "}
          <span className="text-sm text-stone-600">({release_year})</span>
        </h2>
        <p className="text-gray-600 mb-4">Are you sure?</p>
        <div className="flex justify-end gap-2">
          <button
            disabled={isPending}
            onClick={handleClose}
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-400 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed disabled:hover:bg-red-300"
          >
            Delete
          </button>
        </div>
      </form>
    </Modal>
  );
}