import { Outlet } from "react-router-dom";
import Header from "../layout/Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from '../../util/user-query.js';
import { authActions } from '../../store/auth.js';
import { useDispatch } from "react-redux";


export default function RootLayout() {
  const dispatch = useDispatch();

  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: ({ signal }) => fetchUser({ signal }),
    refetchInterval: 1000 * 60 * 10
  });

  if (data && data.success) {
    dispatch(authActions.login(data.user));
  }

  return (
    <div className='min-h-dvh'>
      <Header />
      <main className="max-w-[100vw]">
        <Outlet />
      </main>
    </div>
  )
}