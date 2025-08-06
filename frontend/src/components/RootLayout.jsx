import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";


export default function RootLayout() {
  return (
    <div className='min-h-dvh bg-zinc-900'>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}