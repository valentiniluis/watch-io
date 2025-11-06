import Rating from "./Rating";


export default function Ratings({ ratings }) {
  return (
    <div className='flex flex-col items-center gap-4'>
      {ratings.map(rating => <Rating rating={rating} />)}
    </div>    
  );
}