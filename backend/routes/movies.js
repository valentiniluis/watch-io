import express from 'express';
const router = express.Router();

import * as moviesControllers from '../controllers/movies.js';

router.get('/search', moviesControllers.getSearchedMovies);

router.get('/:movieId', moviesControllers.getMovieData);

router.get('/:movieId/recommendations', moviesControllers.getRecommendations);

export default router;