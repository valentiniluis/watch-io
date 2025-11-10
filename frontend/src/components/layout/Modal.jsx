import { createPortal } from "react-dom";

export default function Modal({ handleClose, ref, children, className="bg-white max-w-xl w-full p-6" }) {
  const baseClass = "backdrop:bg-black backdrop:opacity-50 rounded-lg shadow-xl fixed top-1/2 left-1/2 -translate-1/2";
  const fullClass = baseClass + " " + className;

  return createPortal(
    <dialog ref={ref} onClose={handleClose} className={fullClass}>
      {children}
    </dialog>,
    document.getElementById('root')
  );
}