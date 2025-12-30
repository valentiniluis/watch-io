import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as ratingControllers from '../controllers/rating.js';

const router = Router();


router.get('/', authenticateJWT, ratingControllers.getRatings);

router.post('/', authenticateJWT, ratingControllers.postRating);

router.put('/', authenticateJWT, ratingControllers.putRating);

router.delete('/:movieId', authenticateJWT, ratingControllers.deleteRating);


export default router;