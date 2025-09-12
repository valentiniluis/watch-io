import { Outlet } from "react-router-dom";
import Header from "../layout/Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from '../../util/user-query.js';
import { authActions } from '../../store/auth.js';
import { useDispatch } from "react-redux";
import { useEffect } from "react";


export default function RootLayout() {
  const dispatch = useDispatch();
  
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: ({ signal }) => fetchUser({ signal }),
    refetchInterval: 1000 * 60 * 10
  });

  useEffect(() => {
    if (data?.success) {
      dispatch(authActions.login(data.user));
    }
  }, [data, dispatch]);

  return (
    <div className='min-h-dvh'>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}