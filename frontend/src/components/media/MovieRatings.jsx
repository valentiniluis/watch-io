import { getSourceColor } from '../../util/functions';


export default function MovieRatings({ ratings }) {
  let gridCols;

  const len = ratings.length;
  if (len === 0) return (
    <div className='flex items-center justify-center gap-2 p-4 rounded-lg bg-stone-800/30 border border-stone-700/50'>
      <span className='text-stone-500 text-sm'>No ratings available</span>
    </div>
  );

  if (len === 1) gridCols = 'grid-cols-1';
  else if (len === 2) gridCols = 'grid-cols-2';
  else if (len === 3) gridCols = 'grid-cols-2 sm:grid-cols-3';
  else gridCols = 'grid-cols-2 sm:grid-cols-4';

  return (
    <section className={`grid gap-3 mb-4 mt-3 ${gridCols}`}>

      {ratings.map(({ Source, Value }) => (
        <div key={Source}
          className='flex flex-col mx-auto max-w-32 w-full items-center text-center gap-1.5 p-4 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-stone-600 hover:bg-stone-800/70 transition-all duration-200'
        >
          <span className='text-stone-400 font-medium text-[10px] uppercase tracking-widest'>
            {Source === 'Internet Movie Database' ? 'IMDb' : Source}
          </span>

          <span className={`text-lg sm:text-xl lg:text-2xl font-bold ${getSourceColor(Source)}`}>
            {Value}
          </span>

        </div>
      ))}

    </section>
  );
}