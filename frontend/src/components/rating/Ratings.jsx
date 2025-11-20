import Rating from "./Rating";
import Pagination from "../UI/Pagination";


export default function Ratings({ ratings, currentPage, maxPages, setPage }) {
  return (
    <>
      <div className='flex flex-col items-center gap-4'>
        {ratings.map(rating => <Rating key={rating.id} rating={rating} />)}
      </div>
      <Pagination current={currentPage} max={maxPages} setPage={setPage} />
    </>
  );
}