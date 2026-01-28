import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authActions } from '../store/auth';
import { toastActions } from '../store/toast';


export default function useJwtTimer(user) {
  const dispatch = useDispatch();

  useEffect(() => {
    let timerId;
    if (user) {
      const expiry = localStorage.getItem('WATCHIO_JWT_EXPIRY');
      if (!expiry) {
        dispatch(authActions.logout());
        return;
      }
      const expiryTime = new Date(+expiry);
      const expiryMs = expiryTime.getTime() - (new Date().getTime());

      if (expiryMs > 0) {
        timerId = setTimeout(() => {
          dispatch(authActions.logout());
          dispatch(toastActions.setInfoToast("Authentication has expired. Please log in again!"));
        }, expiryMs);
      } 
      else dispatch(authActions.logout());
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    }
  }, [user, dispatch]);
};