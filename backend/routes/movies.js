import express from 'express';
const router = express.Router();

import * as moviesControllers from '../controllers/movies.js';
import { optionallyAuthenticateJWT } from '../middleware/auth.js';

// search/discover movies
router.get('/search', optionallyAuthenticateJWT, moviesControllers.getSearchedMovies);

// get all possible genres
router.get('/genres', moviesControllers.getMovieGenres);

router.get('/homepage', optionallyAuthenticateJWT, moviesControllers.getHomepage);

// get data for a particular movie
router.get('/:movieId', moviesControllers.getMovieData);

// get recommendations based on a particular movie
router.get('/:movieId/recommendations', optionallyAuthenticateJWT, moviesControllers.getRecommendations);


export default router;