import { useState } from "react";


export default function Input({ maxLength, margin, ...props }) {
  let content;

  if (maxLength) content = <LimitedInput maxLength={maxLength} {...props} />
  else content = <DefaultInput {...props} />

  return (
    <div className={margin || ''}>
      {content}
    </div>
  );
}


function DefaultInput({ id, name, label, type, ...props }) {
  let cssClass = 'border border-stone-400 rounded-md px-4 py-1.5 block w-full mt-1';
  if (props.className) cssClass += ' ' + props.className;

  let inputType;
  if (type === 'textarea') inputType = <textarea id={id} name={name} {...props} className={cssClass}></textarea>
  else inputType = <input type={type || "text"} id={id} name={name} {...props} className={cssClass} />

  return (
    <>
      <label htmlFor={id}>{label}</label>
      {inputType}
    </>
  );
}


function LimitedInput({ maxLength, ...props }) {
  const [inputLen, setInputLen] = useState(0);

  function handleChange(event) {
    const value = event.target.value;
    setInputLen(value.length);
  }

  return (
    <>
      <DefaultInput maxLength={maxLength} {...props} onChange={handleChange} />
      <p className="text-right text-xs text-stone-600">{inputLen}/{maxLength}</p>
    </>
  );
}
