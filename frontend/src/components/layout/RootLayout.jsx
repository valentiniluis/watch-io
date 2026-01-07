import { Outlet } from "react-router-dom";
import Header from "../layout/Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from '../../query/user.js';
import { useDispatch, useSelector } from "react-redux";
import Toast from "../UI/Toast.jsx";
import useJwtTimer from "../../hooks/jwtTimer.js";
import { useEffect } from "react";
import { authActions } from "../../store/auth.js";
import { toastActions } from "../../store/toast.js";


export default function RootLayout() {
  const dispatch = useDispatch();
  const { id } = useSelector(state => state.auth);

  useJwtTimer(id);

  const { data, isError, error, isSuccess } = useQuery({
    queryKey: ['user'],
    queryFn: ({ signal }) => fetchUser({ signal }),
    refetchInterval: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (isSuccess && data?.success) dispatch(authActions.login(data.user));

    if (isError) {
      if (error && error.code === 'ERR_NETWORK') dispatch(toastActions.setErrorToast("Network problems detected!"));
      else dispatch(toastActions.setInfoToast('Please authenticate for a better experience!'));
    }
  }, [isSuccess, data, error, isError, dispatch]);


  return (
    <div className='min-h-dvh'>
      <Toast />
      <Header />
      <main className="max-w-[100vw]">
        <Outlet />
      </main>
    </div>
  )
}