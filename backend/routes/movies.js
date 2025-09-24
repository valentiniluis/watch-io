import express from 'express';
const router = express.Router();

import * as moviesControllers from '../controllers/movies.js';
import { optionallyAuthenticateJWT } from '../middleware/auth.js';

router.get('/search', optionallyAuthenticateJWT, moviesControllers.getSearchedMovies);

router.get('/:movieId', moviesControllers.getMovieData);

router.get('/:movieId/recommendations', optionallyAuthenticateJWT, moviesControllers.getRecommendations);

export default router;