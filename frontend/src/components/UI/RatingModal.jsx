import { createPortal } from "react-dom";
import Input from "./Input";
import { useMutation } from "@tanstack/react-query";
import { addRating } from "../../util/movie-query";
import queryClient from '../../util/query';
import { useSelector } from 'react-redux';


export default function RatingModal({ ref }) {
  const movie = useSelector(state => state.movie);

  function handleClose() {
    ref.current?.close();
  }

  const { mutate } = useMutation({
    mutationFn: addRating,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rating', { movieId: movie.id }] })
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
    mutate({ movie, rating });
    event.target.reset();
    handleClose();
  }

  return createPortal(
    <dialog ref={ref} className="backdrop:bg-black backdrop:opacity-50 bg-white rounded-lg shadow-xl max-w-xl w-full p-6 fixed top-1/2 left-1/2 -translate-1/2">
      <form onSubmit={submitAndClose} className='flex flex-col'>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-stone-700 m-0 text-sm">Rating movie:</h4>
            <h2 className="font-medium text-lg">{movie.title} ({movie.year})</h2>
          </div>
          <button onClick={handleClose} className="text-red-600 hover:text-red-700 text-2xl leading-none">
            ×
          </button>
        </div>
        <Input type="number" min="1" max="10" label="Score*" required id="score" name="score" className="mb-4" />
        <Input id='headline' name='headline' label="Headline*" maxLength="255" className="font-medium text-[1.05rem] mb-4" required />
        <Input type="textarea" id="description" name="note" label="Description" maxLength="511" className="text-stone-600 text-sm" />
        <div className="flex justify-end gap-3 mt-6">
          <button
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
    </dialog>,
    document.getElementById('root')
  );
}