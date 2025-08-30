import express from 'express';

import * as authControllers from '../controllers/auth.js';

const router = express.Router();

router.post('/google', authControllers.postLogin);

export default router;