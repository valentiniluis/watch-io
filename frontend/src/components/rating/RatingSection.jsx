import { useRef } from "react";
import RatingModal from "./RatingModal";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getRating } from '../../query/rating';
import ErrorBlock from '../UI/ErrorSection';
import Spinner from "../UI/Spinner";
import RatingPreview from "./RatingPreview";


export default function RatingSection() {
  const { data: media, type: mediaType } = useSelector(state => state.media);
  const modalRef = useRef();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['rating', { mediaId: media.id, mediaType }],
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
  else if (!data?.rating) {
    content = (
      <div className='flex justify-center'>
        <button className="bg-blue-600 text-white text-sm md:text-base px-4 py-1.5 md:px-6 md:py-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={openModal}>Leave Rating</button>
        <RatingModal ref={modalRef} />
      </div>
    );
  }
  else if (data?.rating) {
    const { rating } = data;
    content = <RatingPreview rating={rating} />;
  }

  return content;
}