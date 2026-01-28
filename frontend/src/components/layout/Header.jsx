// import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import NavigationLink from '../UI/NavigationLink';
import HamburguerMenuBtn from '../UI/HamburguerMenuBtn';
import AuthButton from '../auth/AuthButton';
import LogoutButton from '../auth/LogoutButton';
import AppModeSelector from './AppModeSelector';
import useExpandableContainer from '../../hooks/useExpandableContainer';


export default function Header() {
  const { isLoggedIn } = useSelector(state => state.auth);

  const { 
    isOpen: isMenuOpen,
    ref: menuRef,
    setIsOpen: setIsMenuOpen
  } = useExpandableContainer();

  function handleToggleMenu() {
    setIsMenuOpen(prevBool => !prevBool);
  }

  function handleCloseMenu() {
    if (isMenuOpen) setIsMenuOpen(false);
  }

  return (
    <header className="flex justify-between items-center p-4 mb-16">

      <div className="lg:inline-block hidden">
        <AppModeSelector />
      </div>

      <HamburguerMenuBtn
        className="lg:hidden"
        onClick={handleToggleMenu}
        aria-label="Toggle Navigation Menu"
        aria-expanded={isMenuOpen}
      />

      <nav ref={menuRef} className={`${isMenuOpen ? 'block' : 'hidden'} absolute top-0 right-0 left-0 z-50 bg-stone-800 lg:bg-transparent lg:inline-block lg:relative lg:top-0 lg:flex-row`}>
        <ul className="flex flex-col items-center justify-center text-zinc-200 gap-4 lg:gap-12 py-8 lg:py-0 lg:flex-row">
          <NavigationLink to="/home" text="Home" onClick={handleCloseMenu} />
          <NavigationLink to="/search" text="Search" onClick={handleCloseMenu} />
          <NavigationLink to="/genres" text="Genres" onClick={handleCloseMenu} />
          {isLoggedIn && <NavigationLink to="/my-area" text="My Area" onClick={handleCloseMenu} />}
          <li className="lg:hidden"><AppModeSelector /></li>
        </ul>
      </nav>

      {isLoggedIn ? <LogoutButton /> : <AuthButton />}

    </header>
  );
}