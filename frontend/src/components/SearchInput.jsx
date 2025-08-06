import { useState } from "react";
import { useDebounce } from 'react-use';

export default function SearchInput({ onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');

  const DEBOUNCE_MS = 500;
  useDebounce(() => onUpdate(searchTerm), DEBOUNCE_MS, [searchTerm]);

  function handleChange(event) {
    setSearchTerm(event.target.value);
  }

  return (
    <>
      <label className="text-amber-50 text-2xl font-bold tracking-wide my-6" htmlFor="search">
        Pick a Movie,{' '}
        <span className="text-transparent bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text font-medium">
          We'll Do the Rest
        </span>
      </label>
      <input className="bg-stone-600 w-full max-w-130 px-4 py-4 mb-12 rounded-lg text-[1.1rem] text-center text-stone-200 transition-colors ease-in focus:outline-none focus:bg-stone-500"
        id="search"
        name="search"
        type="text"
        value={searchTerm}
        placeholder="Search Through Movies"
        onChange={handleChange}
      />
    </>
  );
}