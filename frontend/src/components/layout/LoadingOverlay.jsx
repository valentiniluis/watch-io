import { createPortal } from 'react-dom';
import Spinner from '../UI/Spinner';

export default function LoadingOverlay({ text }) {
  return createPortal(
    <div className='fixed top-0 bottom-0 right-0 left-0 bg-stone-800/80 flex items-center justify-center z-50'>
      <Spinner text={text} />
    </div>,
    document.getElementById('root')
  );
}