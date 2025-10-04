import AddWatchlistIcon from '/plus.svg';
import RemoveIcon from '/remove.svg';
import LikeIcon from '/like.svg';
import UnlikeIcon from '/unlike.svg';
import BlockIcon from '/block.svg';


export default function ToggleInteraction({ className, type, active=false, ...props }) {
  let cssClass = 'w-fit rounded-md py-2 px-4 uppercase text-[.7rem] text-nowrap tracking-wider mt-4 font-semibold';
  if (className) cssClass += ' ' + className;

  let text;
  let icon;
  switch (type) {
    case 'watchlist':
      text = (active) ? 'Remove From Watchlist' : 'Add to Watchlist';
      icon = (active) ? RemoveIcon : AddWatchlistIcon;
      cssClass += ' border-1 border-stone-400 bg-transparent text-stone-200 hover:bg-stone-700';
      break;
    case 'not interested':
      text = (active) ? 'Remove From Not Interested' : 'Not Interested';
      icon = (active) ? RemoveIcon : BlockIcon;
      cssClass += ' bg-red-600 text-white hover:bg-red-700';
      break;
    case 'like':
      text = (active) ? 'Remove from Liked' : 'Like';
      icon = (active) ? UnlikeIcon : LikeIcon;
      cssClass += ' bg-gradient-to-r from-violet-800 to-violet-600 hover:from-violet-700 hover:to-violet-500';
      break;
  }

  return (
    <button {...props} className={cssClass}>
      <p className="flex justify-center items-center gap-2">
        <img src={icon} alt={type + ' Icon'} className='h-3.5 w-min' />
        <span>{text}</span>
      </p>
    </button>
  )
}