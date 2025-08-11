
export default function MovieRatings({ ratings }) {
  const justify = ratings.length === 1 ? 'justify-center' : 'justify-between';

  return (
    <section className={'flex text-center mb-8 ' + justify}>
      {ratings.map(rating => (
        <div key={rating.Source}>
          <p className='text-stone-400 font-medium text-xs'>{rating.Source}</p>
          <p className='text-stone-100 text-[1.1rem] font-bold'>{rating.Value}</p>
        </div>
      ))}
    </section>
  );
}