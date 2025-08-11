import { useState } from "react";

export default function Overview({ children, className }) {
  const [showOverview, setShowOverview] = useState(false);

  let cssClass = 'text-[1rem] text-justify';
  if (className) cssClass += ' ' + className;
  return (
    <p className={cssClass}>{children}</p>
  );
}