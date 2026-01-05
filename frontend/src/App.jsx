import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store/store.js';
import queryClient from './util/query.js';
import RootLayout from './components/layout/RootLayout.jsx';
import LoadingOverlay from './components/layout/LoadingOverlay.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const MoviePicker = lazy(() => import('./pages/MoviePicker.jsx'));
const SelectedMovie = lazy(() => import('./pages/SelectedMovie.jsx'));
const MyArea = lazy(() => import('./pages/MyArea.jsx'));
const GenresPage = lazy(() => import('./pages/GenresPage.jsx'));
const ErrorPage = lazy(() => import('./pages/ErrorPage.jsx'));


const router = createBrowserRouter([
  {
    path: '',
    element: <RootLayout />,
    errorElement: <ErrorPage message="Page Not Found" />,
    children: [
      { index: true, loader: () => redirect('/home') },
      {
        path: 'search', children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingOverlay text="Loading content..." />}>
                <MoviePicker />
              </Suspense>
            )
          },
          {
            path: ':mediaId',
            element: (
              <Suspense fallback={<LoadingOverlay text="Loading content..." />}>
                <SelectedMovie />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'home', children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingOverlay text="Loading content..." />}>
                <HomePage />
              </Suspense>
            ),
          },
        ]
      },
      {
        path: 'my-area', children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingOverlay text="Loading content..." />}>
                <MyArea />
              </Suspense>
            ),
          },
        ]
      },
      {
        path: 'genres',
        element: (
          <Suspense fallback={<LoadingOverlay text="Loading content..." />}>
            <GenresPage />
          </Suspense>
        )
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