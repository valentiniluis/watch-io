export default function Pagination({ current, max, setPage }) {
  const FIRST = 1;
  const PREV = current - 1;
  const PENULTIMATE = PREV - 1;
  const NEXT = current + 1;
  const SECOND_NEXT = NEXT + 1;

  const btnClass = "border-2 border-stone-400 text-sm px-2 py-0.5 sm:text-base sm:px-3 sm:py-1.5 rounded-lg hover:border-stone-300 hover:text-stone-100 disabled:text-stone-400 disabled:border-stone-600";

  return (
    <div>
      <ul className="flex text-stone-200 gap-4 justify-center my-10">

        <li className={(PENULTIMATE >= FIRST) ? '' : 'hidden'}>
          <button className={btnClass} onClick={() => setPage(PENULTIMATE)}>
            {PENULTIMATE}
          </button>
        </li>

        <li className={(current > FIRST) ? '' : 'hidden'}>
          <button className={btnClass} onClick={() => setPage(PREV)}>
            {PREV}
          </button>
        </li>

        <li>
          <button className={btnClass} onClick={() => setPage(current)} disabled>
            {current}
          </button>
        </li>

        <li className={(NEXT <= max) ? '' : 'hidden'}>
          <button className={btnClass} onClick={() => setPage(NEXT)}>
            {NEXT}
          </button>
        </li>

        <li className={(SECOND_NEXT <= max) ? '' : 'hidden'}>
          <button className={btnClass} onClick={() => setPage(SECOND_NEXT)}>
            {SECOND_NEXT}
          </button>
        </li>
        
      </ul>
    </div>
  );
}