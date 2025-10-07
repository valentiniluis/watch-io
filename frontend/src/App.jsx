import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store/store.js';
import queryClient from './util/query.js';
import RootLayout from './components/layout/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import MoviePicker from './pages/MoviePicker.jsx';
import SelectedMovie from './pages/SelectedMovie.jsx';
import { loadSelectedMovie } from './util/moviesLoaders.js';
import MyArea from './pages/MyArea.jsx';

const router = createBrowserRouter([
  {
    path: '',
    element: <RootLayout />,
    children: [
      { index: true, loader: () => redirect('/home') },
      {
        path: 'search', children: [
          { index: true, element: <MoviePicker /> },
          { path: ':movieId', element: <SelectedMovie />, loader: loadSelectedMovie }
        ]
      },
      {
        path: 'home', children: [
          { index: true, element: <HomePage /> },
          { path: ':movieId', element: <SelectedMovie />, loader: loadSelectedMovie }
        ]
      },
      {
        path: 'my-area', children: [
          { index: true, element: <MyArea /> },
          { path: ':movieId', element: <SelectedMovie />, loader: loadSelectedMovie }
        ]
      }
    ]
  }
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </Provider>
    </QueryClientProvider>
  )
}