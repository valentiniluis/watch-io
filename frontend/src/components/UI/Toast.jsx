import { createPortal } from 'react-dom';

// implement close toast and variant
export default function Toast({ message, className }) {
  let cssClass = 'bg-red-700/10 text-white rounded-md text-center w-full min-w-90 max-w-120';

  if (className) cssClass += ' ' + className;

  return createPortal(
    <div className={cssClass}>
      <p className='py-3 text-[1.15rem] font-medium tracking-wide'>{message}</p>
    </div>,
    document.getElementById('root')
  );
}