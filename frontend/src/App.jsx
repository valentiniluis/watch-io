import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout.jsx';
import MovieRecommender from './pages/MovieRecommender.jsx';
import SelectedMovie from './pages/SelectedMovie.jsx';

import { loadSelectedMovie } from './util/moviesLoaders.js';

const router = createBrowserRouter([
  { 
    path: '',
    element: <RootLayout />,
    children: [
      { index: true, element: <MovieRecommender /> },
      { path: ':movieId', element: <SelectedMovie />, loader: loadSelectedMovie }
    ]
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}