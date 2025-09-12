import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as userControllers from '../controllers/user.js';

const router = Router();


router.get('/current', authenticateJWT, userControllers.getUser);

export default router;