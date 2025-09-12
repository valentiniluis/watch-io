import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import HamburguerMenuBtn from '../UI/HamburguerMenuBtn';
import { useState } from 'react';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn } = useSelector(reduxState => reduxState.auth);

  const transitionClasses = "transition-colors ease-in";
  const navLinkClass = "text-stone-400 font-medium hover:text-stone-100 block text-center md:inline-block " + transitionClasses;
  const activeClass = navLinkClass + ' text-white underline underline-offset-10'

  function handleToggleMenu() {
    setIsMenuOpen(prevBool => !prevBool);
  }

  function handleCloseMenu() {
    if (isMenuOpen) setIsMenuOpen(false);
  }

  return (
    <header className="flex justify-between items-center py-4 px-6 md:justify-center mb-12">
      <HamburguerMenuBtn className="md:hidden" onClick={handleToggleMenu} />
      <menu className={`${isMenuOpen ? 'block' : 'hidden'} absolute top-0 right-0 left-0 z-50 bg-stone-800 md:bg-transparent md:inline-block md:w-3/5 md:relative md:top-0 md:flex-row`} onMouseLeave={handleCloseMenu}>
        <ul className="flex flex-col items-center justify-center text-zinc-200 gap-6 py-8 md:gap-12 md:py-0 md:flex-row">
          <li className='w-full md:w-auto'>
            <NavLink to="/movies" className={({ isActive }) => isActive ? activeClass : navLinkClass}>Movies</NavLink>
          </li>
          <li className='w-full md:w-auto'>
            <NavLink to="/trending" className={({ isActive }) => isActive ? activeClass : navLinkClass}>Trending</NavLink>
          </li>
          {isLoggedIn && (
            <li className='w-full md:w-auto'>
              <NavLink to="/watchlist" className={({ isActive }) => isActive ? activeClass : navLinkClass}>Watchlist</NavLink>
            </li>
          )}
        </ul>
      </menu>
    </header>
  );
}