import { Router } from 'express';
import * as seriesControllers from '../controllers/series.js';

const router = Router();


router.get('/:seriesId', seriesControllers.getSeriesData);

export default router;