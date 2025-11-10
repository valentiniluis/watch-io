export default function IconButton({ buttonClass, iconClass, ...props }) {
  return (
    <button className={buttonClass}>
      <img {...props} className={iconClass} />
    </button>
  );
}