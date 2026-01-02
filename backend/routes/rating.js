import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as ratingControllers from '../controllers/rating.js';

const router = Router();


router.post('/', authenticateJWT, ratingControllers.postRating);

router.put('/', authenticateJWT, ratingControllers.putRating);

router.get('/check/:mediaType/:mediaId', authenticateJWT, ratingControllers.getSingleRating);

router.get('/:mediaType', authenticateJWT, ratingControllers.getRatings);

router.delete('/:mediaType/:movieId', authenticateJWT, ratingControllers.deleteRating);


export default router;