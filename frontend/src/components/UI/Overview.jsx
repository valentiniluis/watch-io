import { useState } from "react";
import RotatingArrow from "./RotatingArrow";


export default function Overview({ title = "OVERVIEW", overviewText }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!overviewText) return null;
  
  function toggleOpen() {
    setIsOpen(isOpen => !isOpen);
  }

  const headerClass = isOpen
    ? 'text-xs font-semibold text-white tracking-wide'
    : 'text-base font-bold text-gray-200 tracking-wide';

  const contentHeightClass = isOpen
    ? 'max-h-36 opacity-100 px-4 pb-2 pt-0'
    : 'max-h-0 opacity-0 p-0';

  return (
    <div className="w-full max-w-4xl mx-auto mt-3 bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out">
      <div 
        className={`flex justify-between items-center ${isOpen ? 'py-2' : 'py-3'} px-4 cursor-pointer hover:bg-gray-700 transition-colors duration-300`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <div className={`transition-all duration-500 ease-in-out ${headerClass}`}>
          {title}
        </div>
        
        <div className="text-gray-400">
          <RotatingArrow isExpanded={isOpen} />
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-y-auto ${contentHeightClass}`}>
        <p className="text-gray-300 leading-relaxed text-justify text-sm">
          {overviewText}
        </p>
      </div>
    </div>
  );
};
