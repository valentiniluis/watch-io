import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as ratingControllers from '../controllers/ratings.js';

const router = Router();


router.get('/', authenticateJWT, ratingControllers.getRatings);

router.post('/:movieId', authenticateJWT, ratingControllers.postRating);

router.put('/:movieId', authenticateJWT, ratingControllers.putRating);

router.delete('/:movieId', authenticateJWT, ratingControllers.deleteRating);


export default router;