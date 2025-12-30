import { Router } from 'express';
import * as moviesControllers from '../controllers/movie.js';
import { optionallyAuthenticateJWT } from '../middleware/auth.js';

const router = Router();


// search/discover movies
router.get('/search', optionallyAuthenticateJWT, moviesControllers.getSearchedMovies);

// get all possible genres
router.get('/genres', moviesControllers.getMovieGenres);

// get recommendations based on user profile
router.get('/user-recommendations', optionallyAuthenticateJWT, moviesControllers.getUserRecommendations);

// get only movies of a certain genre
router.get('/genre/:genreId', optionallyAuthenticateJWT, moviesControllers.getMoviesByGenre);

// get data for a particular movie
router.get('/:movieId', optionallyAuthenticateJWT, moviesControllers.getMovieData);

// get recommendations based on a particular movie
router.get('/:movieId/recommendations', optionallyAuthenticateJWT, moviesControllers.getMovieRecommendations);


export default router;