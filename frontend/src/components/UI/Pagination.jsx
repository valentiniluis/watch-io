
// deixar a página atual bem no meio
export default function Pagination({ current, max, setPage }) {
  const FIRST = 1;
  const PREV = current - 1;
  const NEXT = current + 1;

  const btnClass = "border-2 border-stone-400 px-3 py-1.5 rounded-lg hover:border-stone-300 hover:text-stone-100 disabled:text-stone-400 disabled:border-stone-600";
  
  return (
    <div>
      <ul className="flex text-stone-200 gap-4">
        {
          (PREV > FIRST) && (
            <li className={btnClass + " mr-3"}>
              <button onClick={() => setPage(FIRST)}>{FIRST}</button>
            </li>
          )
        }

        {
          (current > 1) && (
            <li>
              <button className={btnClass} onClick={() => setPage(PREV)}>{PREV}</button>
            </li>
          )
        }

        <li>
          <button className={btnClass} onClick={() => setPage(current)} disabled>{current}</button>
        </li>

        {
          (max > current) && (
            <li>
              <button className={btnClass} onClick={() => setPage(NEXT)}>{NEXT}</button>
            </li>
          )
        }

        {
          (max > NEXT) && (
            <li className={btnClass + " ml-3"}>
              <button onClick={() => setPage(max)}>{max}</button>
            </li>
          )
        }
      </ul>
    </div>
  );
}