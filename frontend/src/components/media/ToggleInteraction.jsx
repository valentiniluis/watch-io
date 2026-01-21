import ErrorSection from '../UI/ErrorSection';
import { getInteractionBtnContent } from '../../util/functions';


export default function ToggleInteraction({ className, type, active = false, ...props }) {
  let cssClass = 'w-fit rounded-md py-1.5 px-2.5 uppercase text-[.7rem] text-nowrap tracking-wider font-semibold';
  if (className) cssClass += ' ' + className;

  const btnContent = getInteractionBtnContent(type, active);
  if (!btnContent) return <ErrorSection message="Invalid interaction type." />
  const { label, icon, style } = btnContent;
  cssClass += ' ' + style;

  return (
    <button {...props} className={cssClass}>
      <p className="flex justify-center items-center gap-1.5">
        <img src={icon} alt={type + ' Icon'} className='h-3 w-min' />
        <span>{label}</span>
      </p>
    </button>
  )
}