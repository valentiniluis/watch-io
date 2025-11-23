import { Outlet } from "react-router-dom";
import Header from "../layout/Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from '../../util/user-query.js';
import { authActions } from '../../store/auth.js';
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import Toast from "../UI/Toast.jsx";
import { toastActions } from "../../store/toast.js";


export default function RootLayout() {
  const dispatch = useDispatch();

  const { data, isError, error } = useQuery({
    queryKey: ['user'],
    queryFn: ({ signal }) => fetchUser({ signal }),
    refetchInterval: 1000 * 60 * 10
  });

  useEffect(() => {
    if (data?.success) dispatch(authActions.login(data.user));
    if (isError && error.code === 'ERR_NETWORK') dispatch(toastActions.setToast({ message: "Network issues detected!", variant: "error" }));
    else if (isError) dispatch(toastActions.setToast({ message: 'Please authenticate for a better experience!', variant: "info" }));
  }, [data, error, isError, dispatch]);

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