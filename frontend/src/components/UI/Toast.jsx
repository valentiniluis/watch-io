
// implement close toast and variant
export default function Toast({ message, className, variant='error' }) {
  let cssClass = 'bg-red-700 text-white rounded-xs text-center w-full min-w-90 max-w-120';

  if (className) cssClass += ' ' + className;

  return (
    <div className={cssClass}>
      <p className='py-3 text-[1.15rem] font-medium tracking-wide'>{message}</p>
    </div>
  );  
}