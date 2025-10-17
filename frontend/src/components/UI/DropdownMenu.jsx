import { useState } from "react";


export default function DropdownMenu({ text, options, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggleOpen() {
    setIsOpen(prev => !prev);
  }

  function handleSelect(event) {
    setIsOpen(false);
    onUpdate(event);
  }

  return (
    <div className="px-[5vw] m-auto max-w-md sm:px-0">
      <button
        id="dropdownDefaultButton"
        className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 w-full focus:ring-4 focus:outline-none font-medium rounded-lg text-lg px-5 py-2.5 text-center flex justify-center items-center"
        type="button"
        onClick={handleToggleOpen}
      >
        {text}
        <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div id="dropdown" className="w-full z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm max-h-50 overflow-y-scroll dark:bg-gray-700 custom-scrollbar">
          <ul className="py-2 text-base text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
            {options.map(option => (
              <li key={option.id}>
                <button data-genre-id={option.id} data-genre={option.name} className="w-full block px-4 py-2 hover:bg-gray-600 hover:text-white" onClick={handleSelect}>
                  {option.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}