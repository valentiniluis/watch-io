
export default function MyAreaButton({ active, text, ...props }) {
  let buttonClass = 'bg-gray-700 font-bold uppercase px-5 py-2.5 rounded-2xl hover:bg-stone-300 hover:text-stone-800';
  if (active) buttonClass += ' bg-stone-200 text-stone-900';

  return (
    <button {...props} className={buttonClass}>
      {text}
    </button>
  );
}