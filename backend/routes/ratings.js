import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import * as ratingControllers from '../controllers/ratings';

const router = Router();


router.get('/', authenticateJWT);

router.post('/:movieId', authenticateJWT, ratingControllers.postRating);

router.put('/:movieId', authenticateJWT);

router.delete('/:movieId', authenticateJWT);


export default router;