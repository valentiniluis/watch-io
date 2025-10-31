
export default function MovieRatings({ ratings }) {
  let gridCols;

  const len = ratings.length;
  if (len === 0 || len === 1) gridCols = 'grid-cols-1';
  else if (len === 2) gridCols = 'grid-cols-2';
  else gridCols = 'grid-cols-3';

  return (
    <section className={'grid gap-5 text-center mb-8 mt-6 ' + gridCols}>
      {ratings.map(rating => (
        <div key={rating.Source}>
          <p className='text-stone-400 font-medium text-xs'>{rating.Source}</p>
          <p className='text-stone-100 text-[.95rem] md:text-[1.1rem] font-bold'>{rating.Value}</p>
        </div>
      ))}
    </section>
  );
}