import { NavLink } from "react-router-dom"

export default function NavigationLink({ linkTo, text }) {
  const transitionClasses = "transition-colors ease-in";
  const navLinkClass = "text-stone-400 font-medium hover:text-stone-100 block text-center md:inline-block " + transitionClasses;
  const activeClass = navLinkClass + ' text-white underline underline-offset-10'

  return (
    <li className='w-full md:w-auto'>
      <NavLink to={linkTo} className={({ isActive }) => isActive ? activeClass : navLinkClass}>
        {text}
      </NavLink>
    </li>
  );
}