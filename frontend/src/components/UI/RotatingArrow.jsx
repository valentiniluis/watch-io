
export default function RotatingArrow({ isExpanded, className='w-4 h-4' }) {
  
  let cssClass = `transition-transform ${isExpanded ? 'rotate-180' : ''}`;
  
  if (className) cssClass += ' ' + className;
  
  return (
    <svg
      className={cssClass}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}