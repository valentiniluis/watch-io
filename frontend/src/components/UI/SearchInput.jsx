import { useState } from "react";
import { useSelector } from "react-redux";
import { useDebounce } from 'react-use';
import { MOVIES } from '../../util/constants';


export default function SearchInput({ onUpdate }) {
  const mediaType = useSelector(state => state.media.type);
  const [searchTerm, setSearchTerm] = useState('');

  const DEBOUNCE_MS = 500;
  useDebounce(() => onUpdate(searchTerm), DEBOUNCE_MS, [searchTerm]);

  function handleChange(event) {
    setSearchTerm(event.target.value);
  }

  return (
    <>
      <label className="text-amber-50 text-lg md:text-[22px] lg:text-2xl font-bold md:tracking-wide my-4 md:my-5 lg:my-6" htmlFor="search">
        {mediaType === MOVIES ? "Discover Great " : "Find Incredible "}
        <span className="text-transparent bg-linear-to-r from-purple-300 to-purple-400 bg-clip-text font-medium">
          {mediaType === MOVIES ? 'Movies' : 'TV Shows'}
        </span>
        {mediaType === MOVIES ? " With Ease" : " Instantly"}
      </label>
      <input className="bg-stone-600 w-full max-w-[min(85vw,360px)] sm:max-w-[60vw] md:max-w-130 p-3.5 md:p-4 mb-12 rounded-lg text-[.9rem] md:text-base lg:text-[1.1rem] text-center text-stone-200 transition-colors ease-in focus:outline-none focus:bg-stone-500"
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