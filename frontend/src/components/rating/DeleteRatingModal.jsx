import { useDispatch, useSelector } from "react-redux";
import Modal from "../layout/Modal";
import { useMutation } from "@tanstack/react-query";
import { deleteRating } from "../../util/movie-query";
import queryClient from "../../util/query";
import { toastActions } from '../../store/toast';


export default function DeleteRatingModal({ ref }) {
  const dispatch = useDispatch();
  const movie = useSelector(state => state.movie);

  const { mutate } = useMutation({
    mutationFn: deleteRating,
    onSuccess: () => {
      dispatch(toastActions.setSuccessToast("Removed rating successfully!"));
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
    onError: ctx => dispatch(toastActions.setErrorToast(`Failed to delete rating: ${ctx?.response?.data?.message || ctx.message}`))
  });

  function handleClose() {
    ref.current?.close();
  }

  function handleDelete() {
    mutate({ movie });
  }

  return (
    <Modal ref={ref} handleClose={handleClose}>
      <p className="text-sm text-stone-500">Deleting movie rating</p>
      <h2 className="text-semibold text-xl flex items-center gap-2 mb-4">
        {movie.title}{" "}
        <span className="text-sm text-stone-600">({movie.release_year})</span>
      </h2>
      <p className="text-gray-600 mb-4">Are you sure?</p>
      <div className="flex justify-end gap-2">
        <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-400">Cancel</button>
        <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500">Delete</button>
      </div>
    </Modal>
  );
}