import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toastActions } from '../../store/toast';


export default function Toast() {
  const { message, variant } = useSelector(state => state.toast);
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(100);
  const intervalId = useRef();
  const MS_TIMEOUT = 4000;

  function clear() {
    clearInterval(intervalId.current);
    intervalId.current = null;
    setProgress(100);
  }

  // effect that executes every time the global toast redux-state is updated
  useEffect(() => {
    // if a toast overrides another, clear the initial timeout and reset countdown
    if (intervalId.current) clear();
    if (message && variant) intervalId.current = setInterval(() => setProgress(oldProgress => oldProgress - 1), MS_TIMEOUT / 100);
    return clear;
  }, [message, variant, dispatch]);

  // effect to check whether the progress bar has expired and must be cleared
  useEffect(() => {
    if (progress <= 0) {
      dispatch(toastActions.clearToast());
      clear();
    }
  }, [progress, dispatch]);

  if (!message || !variant) return null;

  let cssClass = 'text-white fixed z-50 top-18 right-1/2 translate-x-1/2 rounded-md text-center w-full min-w-90 max-w-120';
  let progressBarColor;
  if (variant === 'info') {
    cssClass += ' bg-blue-500';
    progressBarColor = 'bg-blue-700';
  }
  else if (variant === 'success') {
    cssClass += ' bg-green-700';
    progressBarColor = 'bg-green-800';
  }
  else if (variant === 'error') {
    cssClass += ' bg-red-600';
    progressBarColor = 'bg-red-800';
  }

  return createPortal(
    <div className={cssClass}>
      <p className='py-3 text-base font-medium tracking-wide'>{message}</p>

      <div className="h-1 bg-transparent bg-opacity-30">
        <div
          className={`h-full transition-all duration-[${MS_TIMEOUT}ms] ease-linear ${progressBarColor}`}
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>,
    document.getElementById('root')
  );
}