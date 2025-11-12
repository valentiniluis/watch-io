import { useState } from "react";


export default function DropdownMenu({ label, className, text, options, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  let baseClass =  "w-full px-2 md:px-3 lg:px-5 py-2.5 text-center flex justify-center items-center focus:ring-3 focus:outline-none";
  if (className) baseClass += " " + className;
 
  function handleToggleOpen() {
    setIsOpen(prev => !prev);
  }

  function handleSelect(event) {
    setIsOpen(false);
    onUpdate(event);
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-3xs w-full gap-2">
      <h3 className="text-sm uppercase font-medium tracking-wider text-stone-200">{label}</h3>
      <div className="w-full relative mb-16">
        <button
          id="dropdownDefaultButton"
          className={baseClass}
          type="button"
          onClick={handleToggleOpen}
        >
          {text}
          <svg className="w-2.5 h-2.5 ms-2 lg:ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
          </svg>
        </button>

        {isOpen && (
          <div id="dropdown" className="w-full z-10 rounded-lg shadow-sm max-h-50 overflow-y-scroll bg-gray-700 absolute top-full right-0 left-0">
            <ul className="py-2  text-sm md:text-[.92rem] lg:text-base text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
              {options.map((option, index) => (
                <li key={option.id}>
                  <button {...option} className="w-full block px-4 py-2.5 hover:bg-gray-600 hover:text-white" onClick={handleSelect}>
                    {option.name}
                  </button>
                  {index < options.length - 1 && <hr className="w-9/10 h-0 m-auto border-t-gray-600" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}