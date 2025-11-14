import express from 'express';
const router = express.Router();

import * as moviesControllers from '../controllers/movies.js';
import { optionallyAuthenticateJWT } from '../middleware/auth.js';

// search/discover movies
router.get('/search', optionallyAuthenticateJWT, moviesControllers.getSearchedMovies);

// get all possible genres
router.get('/genres', moviesControllers.getMovieGenres);

// get data for a particular movie
router.get('/:movieId', optionallyAuthenticateJWT, moviesControllers.getMovieData);

// get recommendations based on a particular movie
router.get('/:movieId/recommendations', optionallyAuthenticateJWT, moviesControllers.getRecommendations);

// get only movies of a certain genre
router.get('/genre/:genreId', optionallyAuthenticateJWT, moviesControllers.getMoviesByGenre);

export default router;