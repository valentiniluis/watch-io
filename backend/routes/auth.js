import { Router } from 'express';
import * as authControllers from '../controllers/auth.js';

const router = Router();


router.post('/google', authControllers.postLogin);

router.post('/logout', authControllers.postLogout);

export default router;