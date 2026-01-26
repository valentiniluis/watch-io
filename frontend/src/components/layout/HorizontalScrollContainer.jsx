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

  const scrollBtnBaseClass = 'hidden xl:flex items-center justify-center absolute top-1/2 -translate-y-1/2 z-20 group';
  const scrollBtnStyleClass = 'w-12 h-20 rounded-xl backdrop-blur-md bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800/50 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] hover:scale-105';
  
  const leftScrollBtnClass = `${scrollBtnBaseClass} left-0 -translate-x-full ml-2`;
  const rightScrollBtnClass = `${scrollBtnBaseClass} right-0 translate-x-full mr-2`;

  return (
    <ScrollContainer className={className} horizontal vertical={false} innerRef={containerRef}>

      <button 
        className={leftScrollBtnClass}
        onClick={() => handleScroll('left')}
        aria-label="Scroll para esquerda"
      >
        <div className={`${scrollBtnStyleClass} relative flex items-center justify-center`}>
          {/* Ícone de seta customizado */}
          <svg 
            className="w-6 h-6 text-cyan-400 transition-transform duration-300 group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          
          {/* Glow effect no hover */}
          <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
        </div>
      </button>

      {children}

      <button 
        className={rightScrollBtnClass}
        onClick={() => handleScroll('right')}
        aria-label="Scroll para direita"
      >
        <div className={`${scrollBtnStyleClass} relative flex items-center justify-center`}>
          {/* Ícone de seta customizado */}
          <svg 
            className="w-6 h-6 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
          
          {/* Glow effect no hover */}
          <div className="absolute inset-0 bg-linear-to-l from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
        </div>
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