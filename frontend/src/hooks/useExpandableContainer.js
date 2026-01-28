import { useEffect, useRef, useState } from "react";

// hook for handling containers with open/close states that should close on a click outside event
export default function useExpandableContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return { 
    ref, 
    isOpen, 
    setIsOpen 
  };
}