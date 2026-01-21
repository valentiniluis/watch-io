import { useEffect, useRef, useState } from "react";


export default function DropdownMenu({ label, className, text, options, onUpdate, containerClass='max-w-3xs mb-16' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function handleToggleOpen() {
    setIsOpen(prev => !prev);
  }

  function handleSelect(event) {
    handleClose();
    onUpdate(event);
  }

  function handleClose() {
    setIsOpen(false);
  }

  let baseClass = "w-full px-2 md:px-3 lg:px-5 py-2.5 text-center flex justify-center items-center focus:ring-3 focus:outline-none";
  if (className) baseClass += " " + className;

  return (
    <div ref={dropdownRef} className={`flex flex-col items-center justify-center w-full gap-2 ${containerClass}`}>
      <h3 className="text-xs sm:text-[.8rem] lg:text-sm uppercase font-medium tracking-wider text-stone-200">{label}</h3>
      <div className="w-full relative">
        <button
          id="dropdownDefaultButton"
          className={baseClass}
          type="button"
          onClick={handleToggleOpen}
        >
          {text}
          <svg className={"w-2.5 h-2.5 absolute right-3" + (isOpen ? " rotate-180" : "")} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
          </svg>
        </button>

        {isOpen && (
          <div id="dropdown" className="w-full z-10 rounded-lg shadow-sm max-h-50 overflow-y-auto bg-gray-700 absolute top-full right-0 left-0">
            <ul className="py-2 text-sm md:text-[.92rem] lg:text-base text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
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