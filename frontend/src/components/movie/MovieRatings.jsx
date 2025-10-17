
export default function MovieRatings({ ratings }) {

  return (
    <section className={`grid grid-cols-${ratings.length} grid-cols gap-5 text-center mb-8`}>
      {ratings.map(rating => (
        <div key={rating.Source}>
          <p className='text-stone-400 font-medium text-xs'>{rating.Source}</p>
          <p className='text-stone-100 text-[.95rem] md:text-[1.1rem] font-bold'>{rating.Value}</p>
        </div>
      ))}
    </section>
  );
}