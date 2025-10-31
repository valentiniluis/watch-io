
export default function Input({ id, name, label, type, ...props }) {
  let cssClass = 'border border-stone-400 rounded-md px-4 py-1.5';
  if (props.className) cssClass += ' ' + props.className;

  let inputType;
  if (type === 'textarea') {
    inputType = <textarea id={id} name={name} {...props} className={cssClass}></textarea>
  }
  else {
    inputType = <input id={id} name={name} {...props} className={cssClass} />;
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {inputType}
    </div>
  );
}