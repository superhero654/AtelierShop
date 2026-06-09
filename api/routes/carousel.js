import { Router } from 'express';
import { carouselTable } from '../db.js';

const router = Router();

router.get('/', (_req, res) => res.json(carouselTable.all()));

export default router;
