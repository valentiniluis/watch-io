import { useState } from 'react';
import { useSelector } from 'react-redux';
import NavigationLink from '../UI/NavigationLink';
import HamburguerMenuBtn from '../UI/HamburguerMenuBtn';
import AuthButton from '../auth/AuthButton';
import LogoutButton from '../auth/LogoutButton';
import AppModeSelector from './AppModeSelector';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn } = useSelector(state => state.auth);

  function handleToggleMenu() {
    setIsMenuOpen(prevBool => !prevBool);
  }

  function handleCloseMenu() {
    if (isMenuOpen) setIsMenuOpen(false);
  }

  return (
    <header className="flex justify-between items-center py-4 px-6 mb-16 relative">
      <AppModeSelector />
      <HamburguerMenuBtn className="md:hidden" onClick={handleToggleMenu} />
      <menu className={`${isMenuOpen ? 'block' : 'hidden'} absolute top-0 right-0 left-0 z-50 bg-stone-800 md:bg-transparent md:inline-block md:w-3/5 md:relative md:top-0 md:flex-row`} onMouseLeave={handleCloseMenu}>
        <ul className="flex flex-col items-center justify-center text-zinc-200 gap-6 py-8 md:gap-12 md:py-0 md:flex-row">
          <NavigationLink to="/home" text="Home" onClick={handleCloseMenu} />
          <NavigationLink to="/search" text="Search" onClick={handleCloseMenu} />
          <NavigationLink to="/genres" text="Genres" onClick={handleCloseMenu} />
          {isLoggedIn && <NavigationLink to="/my-area" text="My Area" onClick={handleCloseMenu} />}
        </ul>
      </menu>
      {isLoggedIn ? <LogoutButton /> : <AuthButton />}
    </header>
  );
}