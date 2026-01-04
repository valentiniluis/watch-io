import { Router } from 'express';
import * as mediaControllers from '../controllers/media.js';
import { optionallyAuthenticateJWT } from '../middleware/auth.js';
import { mapMediaType } from '../middleware/validation.js';

const router = Router({ mergeParams: true });


// search/discover movies
router.get('/search', mapMediaType, optionallyAuthenticateJWT, mediaControllers.getSearchedMedia);

// get all possible genres
router.get('/genres', mapMediaType, mediaControllers.getMediaGenres);

// get recommendations based on user profile
router.get('/user-recommendations', mapMediaType, optionallyAuthenticateJWT, mediaControllers.getUserRecommendations);

// get only movies of a certain genre
router.get('/genre/:genreId', mapMediaType, optionallyAuthenticateJWT, mediaControllers.getMediaByGenre);

// get data for a particular movie
router.get('/:mediaId', mapMediaType, optionallyAuthenticateJWT, mediaControllers.getMediaData);

// get recommendations based on a particular movie
router.get('/:mediaId/recommendations', mapMediaType, optionallyAuthenticateJWT, mediaControllers.getMediaRecommendations);


export default router;