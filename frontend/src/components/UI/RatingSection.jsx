import { useRef } from "react";
import RatingModal from "./RatingModal";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getRating } from '../../util/movie-query';
import ErrorBlock from './ErrorSection';
import Spinner from "./Spinner";


export default function RatingSection() {
  const movie = useSelector(state => state.movie);
  const modalRef = useRef();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['rating', { movieId: movie.id }],
    queryFn: getRating
  });

  function openModal() {
    modalRef.current?.showModal();
  }

  let content;
  if (isPending) {
    content = <Spinner text="Loading rating..." />
  }
  else if (isError) {
    content = <ErrorBlock message={error.message || "Failed to get rating"} />
  }
  else if (data) {
    content;
    console.log(data);
  }

  return (
    <div className='flex justify-center'>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={openModal}>Leave Rating</button>
      <RatingModal ref={modalRef} />
    </div>
  );
}