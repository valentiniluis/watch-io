
export default function MyAreaButton({ active, text, ...props }) {
  let buttonClass = 'bg-gray-700 sm:w-max text-[.85rem] md:text-[.95rem] lg:text-base font-bold uppercase rounded-2xl sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 hover:bg-stone-300 hover:text-stone-800';
  if (active) buttonClass += ' bg-stone-200 text-stone-900';

  return (
    <button {...props} className={buttonClass}>
      {text}
    </button>
  );
}