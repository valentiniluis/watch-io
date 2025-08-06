import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/RootLayout.jsx';
import MovieRecommender from './pages/MovieRecommender.jsx';
import SelectedMovie from './pages/SelectedMovie.jsx';

import { loadSingleMovieData } from './util/moviesLoaders.js';

const router = createBrowserRouter([
  { 
    path: '',
    element: <RootLayout />,
    children: [
      { index: true, element: <MovieRecommender /> },
      { path: ':movieId', element: <SelectedMovie />, loader: loadSingleMovieData }
    ]
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}