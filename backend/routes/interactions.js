import { Router } from 'express';
import * as interactionControllers from '../controllers/interactions.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();


router.get('/', authenticateJWT, interactionControllers.getInteractions);

router.post('/:interactionType', authenticateJWT, interactionControllers.postInteraction);

router.get('/:movieId', authenticateJWT, interactionControllers.hasInteraction);

router.delete('/:interactionType/:movieId', authenticateJWT, interactionControllers.deleteInteraction);

export default router;