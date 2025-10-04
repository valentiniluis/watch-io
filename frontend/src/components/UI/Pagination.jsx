
// deixar a página atual centralizada na div
export default function Pagination({ current, max, setPage }) {
  const FIRST = 1;
  const PREV = current - 1;
  const PENULTIMATE = PREV - 1;
  const NEXT = current + 1;
  const SECOND_NEXT = NEXT + 1;

  const btnClass = "border-2 border-stone-400 px-3 py-1.5 rounded-lg hover:border-stone-300 hover:text-stone-100 disabled:text-stone-400 disabled:border-stone-600";

  return (
    <div>
      <ul className="flex text-stone-200 gap-4">

        {
          (PENULTIMATE >= FIRST) && (
            <li>
              <button className={btnClass} onClick={() => setPage(PENULTIMATE)}>{PENULTIMATE}</button>
            </li>
          )
        }

        {
          (current > FIRST) && (
            <li>
              <button className={btnClass} onClick={() => setPage(PREV)}>{PREV}</button>
            </li>
          )
        }

        <li>
          <button className={btnClass} onClick={() => setPage(current)} disabled>{current}</button>
        </li>

        {
          (NEXT <= max) && (
            <li>
              <button className={btnClass} onClick={() => setPage(NEXT)}>{NEXT}</button>
            </li>
          )
        }

        {
          (SECOND_NEXT <= max) && (
            <li>
              <button className={btnClass} onClick={() => setPage(SECOND_NEXT)}>{SECOND_NEXT}</button>
            </li>
          )
        }
      </ul>
    </div>
  );
}