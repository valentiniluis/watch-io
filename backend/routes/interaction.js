import { Router } from 'express';
import * as interactionControllers from '../controllers/interaction.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateMediaType } from '../middleware/validation.js';

const router = Router();


router.get('/:mediaType', authenticateJWT, validateMediaType, interactionControllers.getInteractions);

router.post('/', authenticateJWT, validateMediaType, interactionControllers.postInteraction);

router.get('/check/:mediaType/:mediaId', authenticateJWT, validateMediaType, interactionControllers.hasInteraction);

router.delete('/:mediaType/:mediaId', authenticateJWT, validateMediaType, interactionControllers.deleteInteraction);

export default router;