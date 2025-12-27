import { Router } from 'express';
import * as interactionControllers from '../controllers/interactions.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();


router.get('/:mediaType', authenticateJWT, interactionControllers.getInteractions);

router.post('/', authenticateJWT, interactionControllers.postInteraction);

router.get('/check/:mediaType/:mediaId', authenticateJWT, interactionControllers.hasInteraction);

router.delete('/:mediaType/:mediaId', authenticateJWT, interactionControllers.deleteInteraction);

export default router;