import { useRef } from "react";
import ScrollContainer from "react-indiana-drag-scroll";

export default function HorizontalScrollContainer({ className, children }) {
  const containerRef = useRef();

  function handleScroll(direction) {
    const scrollPercentage = 65 / 100;
    const pixelsOffset = Math.ceil(window.innerWidth * scrollPercentage);
    const offset = (direction === 'left') ? pixelsOffset * -1 : pixelsOffset;
    const ref = containerRef.current;
    ref.scrollBy({ behavior: 'smooth', left: offset });
  }

  const scrollBtnClass = 'hidden xl:inline-block absolute top-1/2 -translate-y-1/2 text-amber-100 bg-stone-700 px-2 py-8 z-10 rounded-xl hover:bg-stone-600';
  const leftScrollBtnClass = scrollBtnClass + ' left-0 -translate-x-full';
  const rightScrollBtnClass = scrollBtnClass + " right-0 translate-x-full";

  return (
    <ScrollContainer className={className} horizontal vertical={false} innerRef={containerRef}>

      <button className={leftScrollBtnClass} onClick={() => handleScroll('left')}>
        &lt;
      </button>

      {children}

      <button className={rightScrollBtnClass} onClick={() => handleScroll('right')}>
        &gt;
      </button>

    </ScrollContainer>
  )
}


function ContainerWrapper({ children, className }) {
  let cssClass = 'relative';

  if (className) cssClass += ' ' + className;
  
  return (
    <section className={cssClass}>
      {children}
    </section>
  )
}


HorizontalScrollContainer.wrapper = ContainerWrapper;