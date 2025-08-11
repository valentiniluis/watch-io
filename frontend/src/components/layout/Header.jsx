import { Link } from 'react-router-dom';
import HamburguerMenuBtn from '../UI/HamburguerMenuBtn';
import { useState } from 'react';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const transitionClasses = "transition-colors ease-in";
  const navLinkClass = "text-stone-400 font-medium hover:text-stone-100 block text-center md:inline-block " + transitionClasses;
  const loginLinkClasses = "text-[.9rem] px-4 py-3 bg-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-600 hover:text-zinc-50 md:text-[1rem] md:px-5 " + transitionClasses;

  function handleToggleMenu() {
    setIsMenuOpen(prevBool => !prevBool);
  }

  function handleCloseMenu() {
    if (isMenuOpen) setIsMenuOpen(false);
  }

  return (
    <header className="flex justify-between items-center py-4 px-6 md:justify-end">
      <HamburguerMenuBtn className="md:hidden" onClick={handleToggleMenu} />
      <menu className={`${isMenuOpen ? 'block' : 'hidden'} absolute top-0 right-0 left-0 z-50 bg-stone-800 md:bg-transparent md:inline-block md:w-3/5 md:relative md:top-0 md:flex-row`} onMouseLeave={handleCloseMenu}>
        <ul className="flex flex-col items-center justify-center text-zinc-200 gap-6 py-8 md:gap-12 md:py-0 md:flex-row">
          <li className='w-full md:w-auto'>
            <Link to="/" className={navLinkClass}>Movies</Link>
          </li>
          <li className='w-full md:w-auto'>
            <Link to="/trending" className={navLinkClass}>Trending</Link>
          </li>
          <li className='w-full md:w-auto'>
            <Link to="/watchlist" className={navLinkClass}>Watchlist</Link>
          </li>
        </ul>
      </menu>
      <div className='w-1/5 flex justify-end md'>
        <Link to="/login" className={loginLinkClasses}>
          Log in
        </Link>
      </div>
    </header>
  );
}