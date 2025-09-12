import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store/store.js';
import queryClient from './util/query.js';
import RootLayout from './components/layout/RootLayout.jsx';
import MovieRecommender from './pages/MovieRecommender.jsx';
import SelectedMovie from './pages/SelectedMovie.jsx';
import { loadSelectedMovie } from './util/moviesLoaders.js';
import MyArea from './pages/MyArea.jsx';

const router = createBrowserRouter([
  {
    path: '',
    element: <RootLayout />,
    children: [
      { index: true, loader: () => redirect('/movies') },
      {
        path: 'movies', children: [
          { index: true, element: <MovieRecommender /> },
          { path: ':movieId', element: <SelectedMovie />, loader: loadSelectedMovie }
        ]
      },
      {
        path: 'trending', children: [
          { index: true, element: <></> },
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