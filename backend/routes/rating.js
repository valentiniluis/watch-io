import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as ratingControllers from '../controllers/rating.js';
import { validateMediaType } from '../middleware/validation.js';

const router = Router();


router.post('/', authenticateJWT, validateMediaType, ratingControllers.postRating);

router.put('/', authenticateJWT, validateMediaType, ratingControllers.putRating);

router.get('/check/:mediaType/:mediaId', authenticateJWT, validateMediaType, ratingControllers.getSingleRating);

router.get('/:mediaType', authenticateJWT, validateMediaType, ratingControllers.getRatings);

router.delete('/:mediaType/:mediaId', authenticateJWT, validateMediaType, ratingControllers.deleteRating);


export default router;