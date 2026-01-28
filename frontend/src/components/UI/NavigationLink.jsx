import { NavLink } from "react-router-dom"

export default function NavigationLink({ text, ...props }) {
  const transitionClasses = "transition-colors ease-in";
  const navLinkClass = "text-stone-400 font-medium hover:text-stone-100 block text-center md:inline-block " + transitionClasses;
  const activeClass = navLinkClass + ' text-white underline underline-offset-8'

  return (
    <li className='w-full md:w-auto'>
      <NavLink {...props} className={({ isActive }) => isActive ? activeClass : navLinkClass}>
        {text}
      </NavLink>
    </li>
  );
}