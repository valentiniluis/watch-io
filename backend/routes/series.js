import { Router } from 'express';
import { optionallyAuthenticateJWT } from '../middleware/auth.js';
import * as seriesControllers from '../controllers/series.js';

const router = Router();


router.get('/search', optionallyAuthenticateJWT, seriesControllers.getSearchedSeries);

router.get('/genres', seriesControllers.getSeriesGenres);

// router.get('/user-recommendations', optionallyAuthenticateJWT, seriesControllers.getUserRecommendations);

router.get('/genre/:genreId', optionallyAuthenticateJWT, seriesControllers.getSeriesByGenre);

// router.get('/:seriesId/recommendations', optionallyAuthenticateJWT, seriesControllers.getMovieRecommendations);

router.get('/:seriesId', optionallyAuthenticateJWT, seriesControllers.getSeriesData);

export default router;