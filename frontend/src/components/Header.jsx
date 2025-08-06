
export default function Header() {
  const navBtnClass = "py-1 hover:border-b-1";
  
  return (
    <header className="flex justify-center items-center py-4 px-6">
      <menu className="w-3/5">
        <ul className="flex justify-center gap-12 text-zinc-200">
          <li>
            <button className={navBtnClass}>Movies</button>
          </li>
          <li>
            <button className={navBtnClass}>Trending</button>
          </li>
          <li>
            <button className={navBtnClass}>Watchlist</button>
          </li>
        </ul>
      </menu>
      <div>
        <button className="bg-zinc-800 text-zinc-300 px-5 py-2 rounded-md hover:bg-zinc-700 hover:text-zinc-200 ">
          Log in
        </button>
      </div>
    </header>
  );
}