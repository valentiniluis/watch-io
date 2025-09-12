
// implement disabled mode and different styles for types of interactions
export default function ToggleInteraction({ className, type, active=false, ...props }) {
  let cssClass = 'w-fit rounded-md py-2 px-4 uppercase text-[.85rem] tracking-wider mt-4 font-semibold';
  if (className) cssClass += ' ' + className;

  let text;
  switch (type) {
    case 'watchlist':
      text = (active) ? 'Remove From Watchlist' : 'Add to Watchlist';
      cssClass += ' border-1 border-stone-400 bg-transparent text-stone-200 hover:bg-stone-700';
      break;
    case 'not interested':
      text = (active) ? 'Remove From Not Interested' : 'Not Interested';
      cssClass += ' bg-red-600 text-white hover:bg-red-700';
      break;
    case 'like':
      text = (active) ? 'Unlike' : 'Like';
      cssClass += ' bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800';
      break;
  }

  return (
    <button {...props} className={cssClass}>
      <p className="flex justify-center items-center gap-4">
        {text}
      </p>
    </button>
  )
}